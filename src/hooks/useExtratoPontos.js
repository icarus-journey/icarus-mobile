import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSessao } from '../state/SessaoContext';
import { criarServicoExtratoPontos } from '../services/extratoPontos';

export function useExtratoPontos(filtros) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoExtratoPontos({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const chave = JSON.stringify(filtros ?? {});
  const filtrosDaConsulta = useMemo(() => JSON.parse(chave), [chave]);
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
    movimentos: [],
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
              movimentos: [],
              carregando: true,
              carregandoMais: false,
              erro: '',
              erroMais: '',
              expirada: false,
            },
      );
      try {
        const dados = await servico.listar(filtrosDaConsulta, cursor);
        if (!valido()) return;
        ultimaConsulta.current = `${usuarioId}:${chave}`;
        setEstado((anterior) => {
          const ids = new Set(cursor ? anterior.movimentos.map((r) => r.id) : []);
          return {
            usuarioId,
            chave,
            dados,
            movimentos: [
              ...(cursor ? anterior.movimentos : []),
              ...dados.movimentos.filter((r) => !ids.has(r.id)),
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
            ? 'Atualize o extrato para continuar.'
            : 'Não foi possível carregar. Confira a conexão e tente de novo.';
        setEstado((anterior) =>
          expirada
            ? {
                usuarioId,
                chave,
                dados: null,
                movimentos: [],
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
    [usuarioId, chave, filtrosDaConsulta, servico],
  );
  useFocusEffect(
    useCallback(() => {
      ocupado.current = false;
      if (ultimaConsulta.current !== `${usuarioId}:${chave}`) carregar();
      return () => {
        if (ocupado.current) ultimaConsulta.current = null;
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
          movimentos: [],
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
