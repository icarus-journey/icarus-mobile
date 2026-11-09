import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { criarServicoHistoricoRelatorios } from '../services/historicoRelatorios';
import { useSessao } from '../state/SessaoContext';
export function useHistoricoRelatorios() {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoHistoricoRelatorios({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const dono = useRef(usuarioId),
    versao = useRef(0),
    ocupado = useRef(false),
    consultado = useRef(null);
  useLayoutEffect(() => {
    dono.current = usuarioId;
  }, [usuarioId]);
  const [estado, setEstado] = useState({
    usuarioId,
    dados: null,
    relatorios: [],
    carregando: true,
    carregandoMais: false,
    erro: '',
    erroMais: '',
    expirada: false,
  });
  const carregar = useCallback(
    async (cursor = null) => {
      if (ocupado.current || !usuarioId) return;
      ocupado.current = true;
      const atual = ++versao.current;
      const valido = () => atual === versao.current && dono.current === usuarioId;
      setEstado((a) =>
        cursor
          ? { ...a, carregandoMais: true, erroMais: '' }
          : {
              usuarioId,
              dados: null,
              relatorios: [],
              carregando: true,
              carregandoMais: false,
              erro: '',
              erroMais: '',
              expirada: false,
            },
      );
      try {
        const dados = await servico.listar(cursor);
        if (!valido()) return;
        consultado.current = usuarioId;
        setEstado((a) => {
          const ids = new Set(cursor ? a.relatorios.map((r) => r.id) : []);
          return {
            usuarioId,
            dados,
            relatorios: [
              ...(cursor ? a.relatorios : []),
              ...dados.relatorios.filter((r) => !ids.has(r.id)),
            ],
            carregando: false,
            carregandoMais: false,
            erro: '',
            erroMais: '',
            expirada: false,
          };
        });
      } catch (e) {
        if (!valido()) return;
        const mensagem =
          e.status === 401
            ? 'Sua sessão terminou. Entre novamente.'
            : e.status === 400
              ? 'Atualize o histórico para continuar.'
              : 'Não foi possível carregar. Confira a conexão e tente de novo.';
        setEstado((a) =>
          e.status === 401
            ? {
                usuarioId,
                dados: null,
                relatorios: [],
                carregando: false,
                carregandoMais: false,
                erro: mensagem,
                erroMais: '',
                expirada: true,
              }
            : {
                ...a,
                carregando: false,
                carregandoMais: false,
                [cursor ? 'erroMais' : 'erro']: mensagem,
              },
        );
      } finally {
        if (valido()) ocupado.current = false;
      }
    },
    [usuarioId, servico],
  );
  useFocusEffect(
    useCallback(() => {
      ocupado.current = false;
      if (consultado.current !== usuarioId) carregar();
      return () => {
        if (ocupado.current) consultado.current = null;
        versao.current++;
        ocupado.current = false;
      };
    }, [usuarioId, carregar]),
  );
  const atual =
    estado.usuarioId === usuarioId
      ? estado
      : {
          dados: null,
          relatorios: [],
          carregando: true,
          carregandoMais: false,
          erro: '',
          erroMais: '',
          expirada: false,
        };
  return {
    ...atual,
    atualizar: () => carregar(),
    carregarMais: () => atual.dados?.proximoCursor && carregar(atual.dados.proximoCursor),
  };
}
