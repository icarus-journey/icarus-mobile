import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { colors } from '../theme';
import { MOCK_CAMPAIGNS } from './campaignMockData';

const CampaignsContext = createContext(null);

export function CampaignsProvider({ children, initialCampaigns = MOCK_CAMPAIGNS }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const addCampaign = useCallback((formValues) => {
    const campaign = {
      id: `campanha-${Date.now()}`,
      titulo: formValues.titulo,
      descricao: formValues.descricao || null,
      destaque: false,
      dataLimite: formValues.dataLimite,
      prazoLabel: formValues.dataLimite,
      dificuldade: formValues.dificuldade,
      pontos: null,
      pontosAtuais: 0,
      recompensaCurta: null,
      recompensaLabel: null,
      missoesAtribuidas: [],
      progresso: null,
      epico: formValues.atribuirEpico === 'Sim' ? formValues.epico : null,
      corDestaque: colors.typeAccentC,
    };

    setCampaigns((current) => [...current, campaign]);
    return campaign;
  }, []);

  const updateCampaign = useCallback((campaignId, formValues) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              titulo: formValues.titulo,
              descricao: formValues.descricao || null,
              dataLimite: formValues.dataLimite,
              prazoLabel: formValues.dataLimite,
              dificuldade: formValues.dificuldade,
              epico: formValues.atribuirEpico === 'Sim' ? formValues.epico : null,
            }
          : campaign,
      ),
    );
  }, []);

  const getCampaignById = useCallback(
    (campaignId) => campaigns.find((campaign) => campaign.id === campaignId) ?? null,
    [campaigns],
  );

  const value = useMemo(
    () => ({ campaigns, addCampaign, updateCampaign, getCampaignById }),
    [campaigns, addCampaign, updateCampaign, getCampaignById],
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
