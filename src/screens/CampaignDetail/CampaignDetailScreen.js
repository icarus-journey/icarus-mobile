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

export function CampaignDetailScreen({ route, navigation }) {
  const { campaignId } = route.params;
  const { getCampaignById } = useCampaigns();
  const insets = useSafeAreaInsets();
  const campaign = getCampaignById(campaignId);

  if (!campaign) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe da campanha" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Esta campanha não está mais disponível.</Text>
      </View>
    );
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
            {
              label: 'Em andamento',
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

        {campaign.progresso ? (
          <DetailProgressCard
            title="Progresso desta campanha"
            subtitle={`${campaign.progresso.concluidas} de ${campaign.progresso.total} missões concluídas`}
            current={campaign.progresso.concluidas}
            total={campaign.progresso.total}
          />
        ) : null}

        <DetailRewardCard value={campaign.recompensaLabel} />

        <PrimaryButton
          label="Concluir campanha"
          onPress={() => {}}
          accessibilityHint="Ainda não disponível nesta versão"
        />
        <SecondaryButton
          label="Editar campanha"
          onPress={() => navigation.navigate('CampaignForm', { campaignId: campaign.id })}
          icon={<IconEdit width={24} height={24} />}
        />
      </ScrollView>

      <BottomNav onPressMissoes={() => navigation.popToTop()} />
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
});
