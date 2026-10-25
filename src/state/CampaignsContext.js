import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  criarCampanha,
  atualizarCampanha,
  concluirCampanha as concluirCampanhaNaApi,
} from '../services/campanhas';
import { colors } from '../theme';
import { deDataIso, paraDataIso } from '../utils/dateInput';
import { useSessao } from './SessaoContext';
import { lerValorProgresso } from '../utils/valorProgresso';
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
    valorAtual: campanha.valorAtual ?? null,
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
  const { sessao } = useSessao();
  return (
    <DadosDasCampanhas key={sessao?.usuarioId ?? 'visitante'} initialCampaigns={initialCampaigns}>
      {children}
    </DadosDasCampanhas>
  );
}

function DadosDasCampanhas({ children, initialCampaigns }) {
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
          prazoInicio: paraDataIso(formValues.dataInicio),
          prazoFim: paraDataIso(formValues.dataLimite),
          valorMensurado: lerValorProgresso(formValues.valorMensurado),
          unidade: formValues.unidade?.trim() || null,
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
          prazoInicio: paraDataIso(formValues.dataInicio),
          prazoFim: paraDataIso(formValues.dataLimite),
          valorMensurado:
            formValues.valorMensurado === undefined
              ? (campanhaAtual?.valorMensurado ?? null)
              : lerValorProgresso(formValues.valorMensurado),
          unidade:
            formValues.unidade === undefined
              ? (campanhaAtual?.unidade ?? null)
              : formValues.unidade.trim() || null,
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
      const resposta = await concluirCampanhaNaApi({
        usuarioId: sessao.usuarioId,
        campanhaId: campaignId,
        requisitarAutenticado,
      });
      setCampaigns((current) =>
        current.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, estado: resposta.estado } : campaign,
        ),
      );
      return resposta;
    },
    [sessao, requisitarAutenticado],
  );

  // Reflete, sem round-trip à API, o crédito que ConcluirMissaoUseCase já aplicou no backend
  // ao valor_atual da campanha (RF-03.5) — chamado pela tela de missão na mesma ação de
  // concluir, já que missão e campanha vivem em Contexts separados. Somente a unidade
  // pontos é contador de gamificação; outras medidas não recebem crédito de pontos.
  const incrementarValorAtual = useCallback((campaignId, pontos) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId &&
        campaign.valorMensurado != null &&
        campaign.unidade?.toLowerCase() === 'pontos'
          ? { ...campaign, valorAtual: (campaign.valorAtual ?? 0) + pontos }
          : campaign,
      ),
    );
  }, []);

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

  const aplicarProgresso = useCallback((campanhaId, progresso) => {
    setCampaigns((atuais) =>
      atuais.map((campanha) =>
        campanha.id === campanhaId
          ? {
              ...campanha,
              valorAtual: progresso.valorAtual,
              valorMensurado: progresso.valorMensurado,
              unidade: progresso.unidade,
              estado: progresso.estado,
            }
          : campanha,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      campaigns,
      addCampaign,
      updateCampaign,
      getCampaignById,
      hidratarDoOnboarding,
      carregarLista,
      concluirCampanha,
      incrementarValorAtual,
      aplicarProgresso,
    }),
    [
      campaigns,
      addCampaign,
      updateCampaign,
      getCampaignById,
      hidratarDoOnboarding,
      carregarLista,
      concluirCampanha,
      incrementarValorAtual,
      aplicarProgresso,
    ],
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
