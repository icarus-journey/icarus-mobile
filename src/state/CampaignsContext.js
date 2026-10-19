import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { criarCampanha, atualizarCampanha, concluirCampanha as concluirCampanhaNaApi } from '../services/campanhas';
import { colors } from '../theme';
import { deDataIso, paraDataIso } from '../utils/dateInput';
import { useSessao } from './SessaoContext';
import { MOCK_CAMPAIGNS } from './campaignMockData';

const CampaignsContext = createContext(null);

function mapearCampanhaDaApi(campanha, epico) {
  return {
    id: campanha.id,
    titulo: campanha.titulo,
    descricao: campanha.descricao,
    dataLimite: deDataIso(campanha.prazoFim),
    prazoLabel: deDataIso(campanha.prazoFim),
    prazoInicio: campanha.prazoInicio,
    areaDaVida: campanha.areaDaVida,
    dificuldade: campanha.dificuldade.toUpperCase(),
    pontos: campanha.pontuacao,
    pontosAtuais: campanha.valorAtual ?? 0,
    valorMensurado: campanha.valorMensurado ?? null,
    unidade: campanha.unidade ?? null,
    recompensaCurta: null,
    recompensaLabel: `${campanha.pontuacao} pontos`,
    estado: campanha.estado,
    missoesAtribuidas: [],
    progresso: null,
    epico,
    corDestaque: colors.typeAccentC,
  };
}

export function CampaignsProvider({ children, initialCampaigns = MOCK_CAMPAIGNS }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const addCampaign = useCallback(
    async (formValues) => {
      const resposta = await criarCampanha({
        usuarioId: sessao.usuarioId,
        requisitarAutenticado,
        dados: {
          epicoId: formValues.epico.id,
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          dificuldade: formValues.dificuldade.toLowerCase(),
          prazoInicio: null,
          prazoFim: paraDataIso(formValues.dataLimite),
          valorMensurado: null,
          unidade: null,
        },
      });
      const campaign = mapearCampanhaDaApi(resposta, formValues.epico);

      setCampaigns((current) => [...current, campaign]);
      return campaign;
    },
    [sessao, requisitarAutenticado],
  );

  const updateCampaign = useCallback(
    async (campaignId, formValues) => {
      const campanhaAtual = campaigns.find((campaign) => campaign.id === campaignId);
      const resposta = await atualizarCampanha({
        usuarioId: sessao.usuarioId,
        campanhaId: campaignId,
        requisitarAutenticado,
        dados: {
          titulo: formValues.titulo,
          descricao: formValues.descricao || null,
          dificuldade: formValues.dificuldade.toLowerCase(),
          prazoInicio: campanhaAtual?.prazoInicio,
          prazoFim: paraDataIso(formValues.dataLimite),
          valorMensurado: campanhaAtual?.valorMensurado ?? null,
          unidade: campanhaAtual?.unidade ?? null,
        },
      });
      // Edição não re-vincula o épico (RF-03): mantém o épico já carregado localmente.
      const camposAtualizados = mapearCampanhaDaApi(resposta, campanhaAtual?.epico ?? null);

      setCampaigns((current) =>
        current.map((campaign) =>
          campaign.id === campaignId
            ? { ...camposAtualizados, missoesAtribuidas: campaign.missoesAtribuidas }
            : campaign,
        ),
      );
    },
    [campaigns, sessao, requisitarAutenticado],
  );

  const getCampaignById = useCallback(
    (campaignId) => campaigns.find((campaign) => campaign.id === campaignId) ?? null,
    [campaigns],
  );

  // Campanha gerada pela IA no onboarding — já vem com id e pontuação reais do backend.
  const hidratarDoOnboarding = useCallback((campanha, epico) => {
    const campanhaHidratada = mapearCampanhaDaApi(campanha, epico);

    setCampaigns((current) => [...current, campanhaHidratada]);
    return campanhaHidratada;
  }, []);

  // Conclusão manual (RF-03.7) — atingir o valor mensurado não conclui por si só.
  const concluirCampanha = useCallback(
    async (campaignId) => {
      const resposta = await concluirCampanhaNaApi({ usuarioId: sessao.usuarioId, campanhaId: campaignId, requisitarAutenticado });
      setCampaigns((current) =>
        current.map((campaign) => (campaign.id === campaignId ? { ...campaign, estado: resposta.estado } : campaign)),
      );
      return resposta;
    },
    [sessao, requisitarAutenticado],
  );

  // Substitui a lista inteira pelas campanhas reais do usuário, extraídas do grafo aninhado
  // devolvido por GET /usuarios/{id}/epicos — chamado uma vez ao abrir o app.
  const carregarLista = useCallback((epicosDoServidor) => {
    const campanhasMapeadas = epicosDoServidor.flatMap((epico) =>
      (epico.campanhas ?? []).map((campanha) =>
        mapearCampanhaDaApi(campanha, { id: epico.id, titulo: epico.titulo }),
      ),
    );
    setCampaigns(campanhasMapeadas);
  }, []);

  const value = useMemo(
    () => ({ campaigns, addCampaign, updateCampaign, getCampaignById, hidratarDoOnboarding, carregarLista, concluirCampanha }),
    [campaigns, addCampaign, updateCampaign, getCampaignById, hidratarDoOnboarding, carregarLista, concluirCampanha],
  );

  return <CampaignsContext.Provider value={value}>{children}</CampaignsContext.Provider>;
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (!context) {
    throw new Error('useCampaigns deve ser usado dentro de um CampaignsProvider');
  }
  return context;
}
