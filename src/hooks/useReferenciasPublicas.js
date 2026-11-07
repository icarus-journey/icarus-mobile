import { useCallback } from 'react';

import { useLeituraEmFoco } from './useLeituraEmFoco';
import { useServicoAnalise } from './useServicoAnalise';
import { useSessao } from '../state/SessaoContext';

const mensagemErro = () =>
  'Não foi possível carregar as referências. Confira a conexão e tente novamente.';

export function useReferenciasPublicas(areaDaVida, tipoDia = 'todos', ativo = true) {
  const servico = useServicoAnalise();
  const { sessao } = useSessao();
  const consultar = useCallback(
    (signal) => servico.referencias(areaDaVida, tipoDia, signal),
    [servico, areaDaVida, tipoDia],
  );
  return useLeituraEmFoco({
    chave: sessao?.usuarioId ? `${sessao.usuarioId}:${areaDaVida}:${tipoDia}` : null,
    consultar,
    mensagemErro,
    ativo,
  });
}
