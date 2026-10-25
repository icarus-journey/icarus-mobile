import { useMemo } from 'react';
import { criarServicoAnalise } from '../services/analise';
import { useSessao } from '../state/SessaoContext';

export function useServicoAnalise() {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  return useMemo(
    () => criarServicoAnalise({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
}
