import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { DetailInfoCard } from '../../components/DetailInfoCard';
import { DetailProgressCard } from '../../components/DetailProgressCard';
import { DetailRewardCard } from '../../components/DetailRewardCard';
import { DetailSummaryCard } from '../../components/DetailSummaryCard';
import { ScreenHeader } from '../../components/ScreenHeader';
import IconEdit from '../../assets/icons/icon-edit.svg';
import { useCampaigns } from '../../state/CampaignsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const DIFICULDADE_LABELS = {
  TRIVIAL: 'Trivial',
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
};

const ESTADO_CAMPANHA_LABELS = {
  planejada: 'Planejada',
  emAndamento: 'Em andamento',
  concluida: 'Concluída',
  excluida: 'Excluída',
};

export function CampaignDetailScreen({ route, navigation }) {
  const { campaignId } = route.params;
  const { getCampaignById, concluirCampanha } = useCampaigns();
  const insets = useSafeAreaInsets();
  const campaign = getCampaignById(campaignId);
  const [concluindo, setConcluindo] = useState(false);
  const [erro, setErro] = useState('');

  if (!campaign) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe da campanha" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Esta campanha não está mais disponível.</Text>
      </View>
    );
  }

  const concluida = campaign.estado === 'concluida';
  const estadoLabel = ESTADO_CAMPANHA_LABELS[campaign.estado] ?? 'Em andamento';

  async function handleConcluir() {
    setConcluindo(true);
    setErro('');
    try {
      await concluirCampanha(campaign.id);
    } catch {
      setErro('Não foi possível concluir a campanha. Tente novamente.');
    } finally {
      setConcluindo(false);
    }
  }

  const quantidadeMissoes = campaign.missoesAtribuidas?.length ?? 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <ScreenHeader title="Detalhe da campanha" onBack={() => navigation.goBack()} />

        <DetailSummaryCard
          accentColor={campaign.corDestaque}
          title={campaign.titulo}
          description={campaign.descricao}
          chips={[
            {
              label: 'Campanha',
              backgroundColor: colors.dangerSoft,
              textColor: colors.dangerText,
            },
            concluida
              ? {
                  label: estadoLabel,
                  backgroundColor: colors.successSoft,
                  textColor: colors.success,
                }
              : {
                  label: estadoLabel,
                  backgroundColor: colors.softPurpleAlt,
                  textColor: colors.brandDark,
                },
            campaign.recompensaCurta
              ? {
                  label: `+${campaign.recompensaCurta}`,
                  backgroundColor: colors.softPurpleAlt,
                  textColor: colors.brandDark,
                }
              : null,
          ].filter(Boolean)}
        />

        <DetailInfoCard
          rows={[
            { label: 'Prazo', value: campaign.prazoLabel },
            { label: 'Dificuldade', value: DIFICULDADE_LABELS[campaign.dificuldade] },
            {
              label: 'Missões',
              value: quantidadeMissoes > 0 ? `${quantidadeMissoes} atribuídas` : null,
            },
            { label: 'Épico', value: campaign.epico?.titulo },
          ]}
        />

        {campaign.valorMensurado != null ? (
          <DetailProgressCard
            title="Progresso desta campanha"
            subtitle={`${campaign.pontosAtuais} de ${campaign.valorMensurado} ${campaign.unidade ?? 'pontos'}`}
            current={campaign.pontosAtuais}
            total={campaign.valorMensurado}
          />
        ) : campaign.progresso ? (
          <DetailProgressCard
            title="Progresso desta campanha"
            subtitle={`${campaign.progresso.concluidas} de ${campaign.progresso.total} missões concluídas`}
            current={campaign.progresso.concluidas}
            total={campaign.progresso.total}
          />
        ) : null}

        <DetailRewardCard value={campaign.recompensaLabel} />

        {erro ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}

        <PrimaryButton
          label={
            concluida ? 'Campanha concluída' : concluindo ? 'Concluindo...' : 'Concluir campanha'
          }
          onPress={handleConcluir}
          disabled={concluida || concluindo}
        />
        <SecondaryButton
          label="Editar campanha"
          onPress={() => navigation.navigate('CampaignForm', { campaignId: campaign.id })}
          icon={<IconEdit width={24} height={24} />}
        />
      </ScrollView>

      <BottomNav
        onPressLoja={() => navigation.navigate('Loja')}
        onPressMissoes={() => navigation.popToTop()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  notFound: {
    marginHorizontal: 24,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
});
