import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSessao } from '../state/SessaoContext';
import { criarServicoHistoricoMissoes } from '../services/historicoMissoes';

export function useHistoricoMissoes(filtros) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoHistoricoMissoes({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const chave = JSON.stringify(filtros);
  const escopo = useRef({ usuarioId, chave });
  useLayoutEffect(() => {
    escopo.current = { usuarioId, chave };
  }, [usuarioId, chave]);
  const ultimaConsulta = useRef(null);
  const versao = useRef(0),
    ocupado = useRef(false);
  const [estado, setEstado] = useState({
    usuarioId,
    chave,
    dados: null,
    registros: [],
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
      const valido = () =>
        versao.current === atual &&
        escopo.current.usuarioId === usuarioId &&
        escopo.current.chave === chave;
      setEstado((anterior) =>
        cursor
          ? { ...anterior, carregandoMais: true, erroMais: '' }
          : {
              usuarioId,
              chave,
              dados: null,
              registros: [],
              carregando: true,
              carregandoMais: false,
              erro: '',
              erroMais: '',
              expirada: false,
            },
      );
      try {
        const dados = await servico.listar(filtros, cursor);
        if (!valido()) return;
        ultimaConsulta.current = `${usuarioId}:${chave}`;
        setEstado((anterior) => {
          const ids = new Set(cursor ? anterior.registros.map((r) => r.id) : []);
          return {
            usuarioId,
            chave,
            dados,
            registros: [
              ...(cursor ? anterior.registros : []),
              ...dados.registros.filter((r) => !ids.has(r.id)),
            ],
            carregando: false,
            carregandoMais: false,
            erro: '',
            erroMais: '',
            expirada: false,
          };
        });
      } catch (falha) {
        if (!valido()) return;
        const expirada = falha.status === 401;
        const mensagem = expirada
          ? 'Sua sessão terminou. Entre novamente.'
          : falha.status === 400
            ? 'Atualize o histórico para continuar.'
            : 'Não foi possível carregar. Confira a conexão e tente de novo.';
        setEstado((anterior) =>
          expirada
            ? {
                usuarioId,
                chave,
                dados: null,
                registros: [],
                carregando: false,
                carregandoMais: false,
                erro: mensagem,
                erroMais: '',
                expirada: true,
              }
            : {
                ...anterior,
                carregando: false,
                carregandoMais: false,
                [cursor ? 'erroMais' : 'erro']: mensagem,
              },
        );
      } finally {
        if (valido()) ocupado.current = false;
      }
    },
    [usuarioId, chave, filtros, servico],
  );
  useFocusEffect(
    useCallback(() => {
      ocupado.current = false;
      if (ultimaConsulta.current !== `${usuarioId}:${chave}`) carregar();
      return () => {
        versao.current += 1;
        ocupado.current = false;
      };
    }, [carregar, usuarioId, chave]),
  );
  const exibido =
    estado.usuarioId === usuarioId && estado.chave === chave
      ? estado
      : {
          dados: null,
          registros: [],
          carregando: true,
          erro: '',
          erroMais: '',
          carregandoMais: false,
          expirada: false,
        };
  return {
    ...exibido,
    servico,
    atualizar: () => {
      if (!ocupado.current) carregar();
    },
    carregarMais: () => {
      if (exibido.dados?.proximoCursor) carregar(exibido.dados.proximoCursor);
    },
  };
}
