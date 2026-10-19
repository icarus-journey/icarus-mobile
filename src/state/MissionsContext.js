import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { criarMissao, atualizarMissao, concluirMissao as concluirMissaoNaApi } from '../services/missoes';
import { colors } from '../theme';
import { deDataIso, paraDataIso } from '../utils/dateInput';
import { useSessao } from './SessaoContext';
import { MOCK_MISSIONS } from './mockData';

const MissionsContext = createContext(null);

function horarioParaApi(horarioIso) {
  if (!horarioIso) return null;
  const data = new Date(horarioIso);
  return `${String(data.getUTCHours()).padStart(2, '0')}:${String(data.getUTCMinutes()).padStart(2, '0')}`;
}

function mapearMissaoDaApi(missao, campanha) {
  return {
    id: missao.id,
    titulo: missao.titulo,
    descricao: missao.descricao,
    status: 'PENDENTE',
    dataLimite: deDataIso(missao.dataLimite),
    prazoLabel: deDataIso(missao.dataLimite),
    prazoCompleto: deDataIso(missao.dataLimite),
    dificuldade: missao.dificuldade.toUpperCase(),
    pontos: missao.pontuacao,
    horarioIso: missao.horario,
    concluidaEm: missao.concluidaEm ?? null,
    recorrencia: null,
    campanha,
    corDestaque: colors.typeAccentB,
    progresso: null,
    recompensaLabel: `${missao.pontuacao} pontos`,
  };
}

export function MissionsProvider({ children, initialMissions = MOCK_MISSIONS }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const [missions, setMissions] = useState(initialMissions);

  const addMission = useCallback(
    async (formValues) => {
      const resposta = await criarMissao({
        usuarioId: sessao.usuarioId,
        requisitarAutenticado,
        dados: {
          campanhaId: formValues.atribuirCampanha === 'Sim' ? formValues.campanha.id : null,
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          beneficio: null,
          dificuldade: formValues.dificuldade.toLowerCase(),
          dataLimite: formValues.dataLimite ? paraDataIso(formValues.dataLimite) : null,
          horario: null,
        },
      });
      const mission = mapearMissaoDaApi(resposta, formValues.atribuirCampanha === 'Sim' ? formValues.campanha : null);

      setMissions((current) => [mission, ...current]);
      return mission;
    },
    [sessao, requisitarAutenticado],
  );

  const updateMission = useCallback(
    async (missionId, formValues) => {
      const missaoAtual = missions.find((mission) => mission.id === missionId);
      const resposta = await atualizarMissao({
        usuarioId: sessao.usuarioId,
        missaoId: missionId,
        requisitarAutenticado,
        dados: {
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          beneficio: null,
          dificuldade: formValues.dificuldade.toLowerCase(),
          dataLimite: formValues.dataLimite ? paraDataIso(formValues.dataLimite) : null,
          // Sem campo de horário no formulário: reenvia o horário já existente, senão a API
          // resetaria para 09:00 por omissão.
          horario: horarioParaApi(missaoAtual?.horarioIso),
        },
      });
      // Edição não re-vincula a campanha (fora de escopo aqui): mantém a já carregada localmente.
      const camposAtualizados = mapearMissaoDaApi(resposta, missaoAtual?.campanha ?? null);

      setMissions((current) =>
        current.map((mission) => (mission.id === missionId ? camposAtualizados : mission)),
      );
    },
    [missions, sessao, requisitarAutenticado],
  );

  const getMissionById = useCallback(
    (missionId) => missions.find((mission) => mission.id === missionId) ?? null,
    [missions],
  );

  // Missão gerada pela IA no onboarding — já vem com id e pontuação reais do backend. O
  // status de execução (PENDENTE/ATRASADA/CONCLUIDA) é local; o ciclo que a API devolve
  // (RASCUNHO/ATIVA/INATIVA) é outra coisa (ver StatusMissao no backend), por isso não é
  // reaproveitado aqui — toda missão nasce PENDENTE, igual à criação manual.
  const hidratarDoOnboarding = useCallback((missao, campanha) => {
    const missaoHidratada = mapearMissaoDaApi(missao, campanha);

    setMissions((current) => [missaoHidratada, ...current]);
    return missaoHidratada;
  }, []);

  // Credita pontos ao usuário e, se a missão tiver campanha mensurável, soma ao valor atual
  // dela (RF-04.6). Idempotente no backend: concluir de novo não credita pontos de novo.
  const concluirMissao = useCallback(
    async (missionId) => {
      const resposta = await concluirMissaoNaApi({ usuarioId: sessao.usuarioId, missaoId: missionId, requisitarAutenticado });
      setMissions((current) =>
        current.map((mission) => (mission.id === missionId ? { ...mission, concluidaEm: resposta.concluidaEm } : mission)),
      );
      return resposta;
    },
    [sessao, requisitarAutenticado],
  );

  // Substitui a lista inteira pelas missões reais do usuário — chamado uma vez ao abrir o app.
  // epicosDoServidor traz as vinculadas (aninhadas em GET /usuarios/{id}/epicos);
  // missoesAvulsasDoServidor traz as sem campanha (GET /usuarios/{id}/missoes), que não
  // aparecem em nenhum grafo de épico.
  const carregarLista = useCallback((epicosDoServidor, missoesAvulsasDoServidor = []) => {
    const vinculadas = epicosDoServidor.flatMap((epico) =>
      (epico.campanhas ?? []).flatMap((campanha) =>
        (campanha.missoes ?? []).map((missao) =>
          mapearMissaoDaApi(missao, { id: campanha.id, titulo: campanha.titulo }),
        ),
      ),
    );
    const avulsas = missoesAvulsasDoServidor.map((missao) => mapearMissaoDaApi(missao, null));

    setMissions([...avulsas, ...vinculadas]);
  }, []);

  const value = useMemo(
    () => ({ missions, addMission, updateMission, getMissionById, hidratarDoOnboarding, carregarLista, concluirMissao }),
    [missions, addMission, updateMission, getMissionById, hidratarDoOnboarding, carregarLista, concluirMissao],
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
