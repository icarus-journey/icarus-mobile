import { useCallback } from 'react';

import { useLeituraEmFoco } from './useLeituraEmFoco';
import { useServicoAnalise } from './useServicoAnalise';
import { useSessao } from '../state/SessaoContext';
import { useSincronizacaoFuso } from '../state/SincronizadorDeFuso';

const mensagemErro = (falha) =>
  falha.status === 401
    ? 'Sua sessão terminou. Entre novamente para ver seu progresso.'
    : 'Não foi possível carregar seus registros. Confira a conexão e tente novamente.';

export function useProgresso(periodo, ativo = true) {
  const servico = useServicoAnalise();
  const sincronizarFuso = useSincronizacaoFuso();
  const { sessao } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const consultar = useCallback((signal) => servico.progresso(periodo, signal), [servico, periodo]);
  const leitura = useLeituraEmFoco({
    chave: usuarioId ? `${usuarioId}:${periodo}` : null,
    consultar,
    mensagemErro,
    ativo,
    preparar: sincronizarFuso,
  });
  return {
    ...leitura,
    usuarioId,
    versaoContrato: leitura.dados?.versaoContrato ?? null,
  };
}
