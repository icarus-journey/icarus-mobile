import { useCallback, useRef, useState } from 'react';

export function useEstadoVersionado(inicial) {
  const [estado, carregar] = useState(inicial);
  const revisao = useRef(0);
  const alterar = useCallback((atualizacao) => {
    revisao.current++;
    carregar(atualizacao);
  }, []);
  const obterRevisao = useCallback(() => revisao.current, []);
  return [estado, alterar, carregar, obterRevisao];
}
