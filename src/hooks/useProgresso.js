import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useServicoAnalise } from './useServicoAnalise';
import { useSessao } from '../state/SessaoContext';

export function useProgresso(periodo) {
  const servico = useServicoAnalise();
  const { sessao } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const [estado, setEstado] = useState({
    usuarioId,
    periodo,
    dados: null,
    carregando: true,
    erro: '',
    versaoContrato: null,
  });
  const versao = useRef(0);
  const carregar = useCallback(async () => {
    const atual = ++versao.current;
    setEstado((anterior) => ({
      usuarioId,
      periodo,
      dados: null,
      carregando: true,
      erro: '',
      versaoContrato:
        anterior.usuarioId === usuarioId
          ? (anterior.dados?.versaoContrato ?? anterior.versaoContrato)
          : null,
    }));
    if (!usuarioId) return;
    try {
      const resposta = await servico.progresso(periodo);
      if (atual === versao.current)
        setEstado({
          usuarioId,
          periodo,
          dados: resposta,
          carregando: false,
          erro: '',
          versaoContrato: resposta.versaoContrato,
        });
    } catch (falha) {
      if (atual === versao.current)
        setEstado({
          usuarioId,
          periodo,
          dados: null,
          carregando: false,
          erro:
            falha.status === 401
              ? 'Sua sessão terminou. Entre novamente para ver seu progresso.'
              : 'Não foi possível carregar seus registros. Confira a conexão e tente novamente.',
        });
    }
  }, [periodo, servico, usuarioId]);
  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => {
        versao.current += 1;
      };
    }, [carregar]),
  );
  return {
    ...(estado.usuarioId === usuarioId && estado.periodo === periodo
      ? estado
      : { dados: null, carregando: true, erro: '' }),
    versaoContrato:
      estado.usuarioId === usuarioId
        ? (estado.dados?.versaoContrato ?? estado.versaoContrato)
        : null,
    carregar,
  };
}
