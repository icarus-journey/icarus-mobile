import { useCallback } from 'react';

import { useLeituraEmFoco } from './useLeituraEmFoco';
import { useServicoAnalise } from './useServicoAnalise';
import { useSessao } from '../state/SessaoContext';

const mensagemErro = () =>
  'Não foi possível carregar as referências. Confira a conexão e tente novamente.';

export function useReferenciasPublicas(
  areaDaVida,
  tipoDia = 'todos',
  ativo = true,
  campanhaId = null,
) {
  const servico = useServicoAnalise();
  const { sessao } = useSessao();
  const consultar = useCallback(
    (signal) => servico.referencias(areaDaVida, tipoDia, signal, campanhaId),
    [servico, areaDaVida, tipoDia, campanhaId],
  );
  return useLeituraEmFoco({
    chave: sessao?.usuarioId ? `${sessao.usuarioId}:${campanhaId}:${areaDaVida}:${tipoDia}` : null,
    consultar,
    mensagemErro,
    ativo,
  });
}
