import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { generateId } from '../utils/generateId';

const DiariosContext = createContext(null);

export function DiariosProvider({ children, initialEntries = [] }) {
  const [entradas, setEntradas] = useState(initialEntries);

  const adicionarEntrada = useCallback((valores) => {
    const entrada = {
      id: generateId('diario'),
      tipo: valores.tipo,
      texto: valores.texto.trim(),
      dataRegistro: valores.dataRegistro,
      criadaEm: new Date().toISOString(),
      atualizadaEm: null,
      excluidaEm: null,
    };

    setEntradas((atuais) => [entrada, ...atuais]);
    return entrada;
  }, []);

  const atualizarEntrada = useCallback((entradaId, valores) => {
    setEntradas((atuais) =>
      atuais.map((entrada) =>
        entrada.id === entradaId
          ? {
              ...entrada,
              tipo: valores.tipo,
              texto: valores.texto.trim(),
              atualizadaEm: new Date().toISOString(),
            }
          : entrada,
      ),
    );
  }, []);

  const excluirEntrada = useCallback((entradaId) => {
    setEntradas((atuais) =>
      atuais.map((entrada) =>
        entrada.id === entradaId ? { ...entrada, excluidaEm: new Date().toISOString() } : entrada,
      ),
    );
  }, []);

  const entradasAtivas = useMemo(
    () => entradas.filter((entrada) => !entrada.excluidaEm),
    [entradas],
  );

  const value = useMemo(
    () => ({
      entradas: entradasAtivas,
      adicionarEntrada,
      atualizarEntrada,
      excluirEntrada,
    }),
    [entradasAtivas, adicionarEntrada, atualizarEntrada, excluirEntrada],
  );

  return <DiariosContext.Provider value={value}>{children}</DiariosContext.Provider>;
}

export function useDiarios() {
  const context = useContext(DiariosContext);

  if (!context) {
    throw new Error('useDiarios deve ser usado dentro de um DiariosProvider');
  }

  return context;
}
