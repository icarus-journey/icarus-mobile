import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { colors } from '../theme';
import { MOCK_CAMPANHAS, MOCK_MISSIONS, pontosLocaisParaDificuldade } from './mockData';

const MissionsContext = createContext(null);

export function MissionsProvider({ children, initialMissions = MOCK_MISSIONS }) {
  const [missions, setMissions] = useState(initialMissions);

  const addMission = useCallback((formValues) => {
    const mission = {
      id: `missao-${Date.now()}`,
      titulo: formValues.titulo,
      descricao: formValues.descricao || null,
      status: 'PENDENTE',
      prazoLabel: formValues.dataLimite,
      prazoCompleto: formValues.dataLimite,
      dificuldade: formValues.dificuldade,
      pontos: pontosLocaisParaDificuldade(formValues.dificuldade),
      recorrencia: formValues.recorrente === 'Sim' ? formValues.tipoRecorrencia : null,
      campanha: formValues.atribuirCampanha === 'Sim' ? formValues.campanha : null,
      corDestaque: colors.typeAccentB,
      progresso: null,
      recompensaLabel: `${pontosLocaisParaDificuldade(formValues.dificuldade)} pontos`,
    };

    setMissions((current) => [mission, ...current]);
    return mission;
  }, []);

  const getMissionById = useCallback(
    (missionId) => missions.find((mission) => mission.id === missionId) ?? null,
    [missions],
  );

  const value = useMemo(
    () => ({ missions, campaigns: MOCK_CAMPANHAS, addMission, getMissionById }),
    [missions, addMission, getMissionById],
  );

  return <MissionsContext.Provider value={value}>{children}</MissionsContext.Provider>;
}

export function useMissions() {
  const context = useContext(MissionsContext);
  if (!context) {
    throw new Error('useMissions deve ser usado dentro de um MissionsProvider');
  }
  return context;
}
