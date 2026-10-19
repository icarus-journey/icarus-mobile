import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { colors } from '../theme';
import { deDataIso } from '../utils/dateInput';
import { generateId } from '../utils/generateId';
import { MOCK_EPICS } from './epicMockData';

const EpicsContext = createContext(null);

export function EpicsProvider({ children, initialEpics = MOCK_EPICS }) {
  const [epics, setEpics] = useState(initialEpics);

  const addEpic = useCallback((formValues) => {
    const epic = {
      id: generateId('epico'),
      titulo: formValues.titulo,
      descricao: formValues.descricao || null,
      dataLimite: formValues.dataLimite,
      prazoLabel: formValues.dataLimite,
      dificuldade: formValues.dificuldade,
      pontos: null,
      recompensaLabel: null,
      campanhasAtribuidas: [],
      progresso: null,
      corDestaque: colors.typeAccentB,
    };

    setEpics((current) => [...current, epic]);
    return epic;
  }, []);

  const updateEpic = useCallback((epicId, formValues) => {
    setEpics((current) =>
      current.map((epic) =>
        epic.id === epicId
          ? {
              ...epic,
              titulo: formValues.titulo,
              descricao: formValues.descricao || null,
              dataLimite: formValues.dataLimite,
              prazoLabel: formValues.dataLimite,
              dificuldade: formValues.dificuldade,
            }
          : epic,
      ),
    );
  }, []);

  const getEpicById = useCallback(
    (epicId) => epics.find((epic) => epic.id === epicId) ?? null,
    [epics],
  );

  // Épico gerado pela IA no onboarding (RF-01.5/RF-13) — já vem com id e pontuação reais do
  // backend, diferente de addEpic (formulário manual, id/pontos locais).
  const hidratarDoOnboarding = useCallback((epico) => {
    const epicHidratado = {
      id: epico.id,
      titulo: epico.titulo,
      descricao: epico.descricao,
      dataLimite: deDataIso(epico.prazoFim),
      prazoLabel: deDataIso(epico.prazoFim),
      areaDaVida: epico.areaDaVida,
      dificuldade: epico.dificuldade.toUpperCase(),
      pontos: epico.pontuacao,
      recompensaLabel: `${epico.pontuacao} pontos`,
      campanhasAtribuidas: [],
      progresso: null,
      corDestaque: colors.typeAccentB,
    };

    setEpics((current) => [...current, epicHidratado]);
    return epicHidratado;
  }, []);

  const value = useMemo(
    () => ({ epics, addEpic, updateEpic, getEpicById, hidratarDoOnboarding }),
    [epics, addEpic, updateEpic, getEpicById, hidratarDoOnboarding],
  );

  return <EpicsContext.Provider value={value}>{children}</EpicsContext.Provider>;
}

export function useEpics() {
  const context = useContext(EpicsContext);
  if (!context) {
    throw new Error('useEpics deve ser usado dentro de um EpicsProvider');
  }
  return context;
}
