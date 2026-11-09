import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const vazias = { epicos: [], campanhas: [], missoes: [] };
const ExclusoesPlanejamentoContext = createContext({ exclusoes: vazias });

// Vive dentro da sessão. Uma leitura iniciada antes do DELETE não pode recolocar o item.
export function ExclusoesPlanejamentoProvider({ children }) {
  const [exclusoes, setExclusoes] = useState(vazias);
  const registrarExclusao = useCallback((tipo, id) => {
    setExclusoes((atuais) => ({ ...atuais, [tipo]: [...atuais[tipo], id] }));
  }, []);
  const valor = useMemo(() => ({ exclusoes, registrarExclusao }), [exclusoes, registrarExclusao]);
  return (
    <ExclusoesPlanejamentoContext.Provider value={valor}>
      {children}
    </ExclusoesPlanejamentoContext.Provider>
  );
}

export function useExclusoesPlanejamento() {
  return useContext(ExclusoesPlanejamentoContext);
}
