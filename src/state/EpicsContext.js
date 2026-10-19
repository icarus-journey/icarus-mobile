import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { criarEpico, atualizarEpico } from '../services/epicos';
import { colors } from '../theme';
import { deDataIso, paraDataIso } from '../utils/dateInput';
import { useSessao } from './SessaoContext';
import { MOCK_EPICS } from './epicMockData';

const EpicsContext = createContext(null);

/** Mapeia a resposta da API (flat ou com campanhas aninhadas) para o formato local da tela. */
function mapearEpicoDaApi(epico) {
  return {
    id: epico.id,
    titulo: epico.titulo,
    descricao: epico.descricao,
    dataLimite: deDataIso(epico.prazoFim),
    prazoLabel: deDataIso(epico.prazoFim),
    prazoInicio: epico.prazoInicio,
    areaDaVida: epico.areaDaVida,
    dificuldade: epico.dificuldade.toUpperCase(),
    pontos: epico.pontuacao,
    recompensaLabel: `${epico.pontuacao} pontos`,
    campanhasAtribuidas: (epico.campanhas ?? []).map((campanha) => ({
      id: campanha.id,
      titulo: campanha.titulo,
      progresso: null,
    })),
    progresso: null,
    corDestaque: colors.typeAccentB,
  };
}

export function EpicsProvider({ children, initialEpics = MOCK_EPICS }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const [epics, setEpics] = useState(initialEpics);

  const addEpic = useCallback(
    async (formValues) => {
      const resposta = await criarEpico({
        usuarioId: sessao.usuarioId,
        requisitarAutenticado,
        dados: {
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          areaDaVida: formValues.areaDaVida,
          dificuldade: formValues.dificuldade.toLowerCase(),
          prazoInicio: null,
          prazoFim: paraDataIso(formValues.dataLimite),
        },
      });
      const epic = mapearEpicoDaApi(resposta);

      setEpics((current) => [...current, epic]);
      return epic;
    },
    [sessao, requisitarAutenticado],
  );

  const updateEpic = useCallback(
    async (epicId, formValues) => {
      const epicoAtual = epics.find((epic) => epic.id === epicId);
      const resposta = await atualizarEpico({
        usuarioId: sessao.usuarioId,
        epicoId: epicId,
        requisitarAutenticado,
        dados: {
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          dificuldade: formValues.dificuldade.toLowerCase(),
          prazoInicio: epicoAtual?.prazoInicio,
          prazoFim: paraDataIso(formValues.dataLimite),
        },
      });
      // A resposta de edição não traz campanhas aninhadas (RF-03.2: área e vínculos não mudam
      // aqui) — preserva o que já estava carregado localmente em vez de zerar.
      const camposAtualizados = mapearEpicoDaApi(resposta);

      setEpics((current) =>
        current.map((epic) =>
          epic.id === epicId ? { ...camposAtualizados, campanhasAtribuidas: epic.campanhasAtribuidas } : epic,
        ),
      );
    },
    [epics, sessao, requisitarAutenticado],
  );

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
      prazoInicio: epico.prazoInicio,
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

  // Chamado depois de hidratarDoOnboarding, quando a campanha gerada para este épico já existe
  // (a API devolve o épico antes da campanha, então o vínculo não pode nascer junto).
  const vincularCampanha = useCallback((epicId, campanha) => {
    setEpics((current) =>
      current.map((epic) =>
        epic.id === epicId
          ? {
              ...epic,
              campanhasAtribuidas: [
                ...epic.campanhasAtribuidas,
                { id: campanha.id, titulo: campanha.titulo, progresso: null },
              ],
            }
          : epic,
      ),
    );
  }, []);

  // Substitui a lista inteira pelos épicos reais do usuário (GET /usuarios/{id}/epicos), com
  // campanhas e missões já aninhadas — chamado uma vez ao abrir o app (ver CarregadorDeDados).
  const carregarLista = useCallback((epicosDoServidor) => {
    setEpics(epicosDoServidor.map(mapearEpicoDaApi));
  }, []);

  const value = useMemo(
    () => ({ epics, addEpic, updateEpic, getEpicById, hidratarDoOnboarding, vincularCampanha, carregarLista }),
    [epics, addEpic, updateEpic, getEpicById, hidratarDoOnboarding, vincularCampanha, carregarLista],
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
