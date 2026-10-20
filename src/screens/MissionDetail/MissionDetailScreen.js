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
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const DIFICULDADE_LABELS = {
  TRIVIAL: 'Trivial',
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
};

const RECORRENCIA_LABELS = {
  DIARIA: 'Diária',
  SEMANAL: 'Semanal',
  MENSAL: 'Mensal',
};

export function MissionDetailScreen({ route, navigation }) {
  const { missionId } = route.params;
  const { getMissionById, concluirMissao } = useMissions();
  const { incrementarValorAtual } = useCampaigns();
  const insets = useSafeAreaInsets();
  const mission = getMissionById(missionId);
  const [concluindo, setConcluindo] = useState(false);
  const [erro, setErro] = useState('');

  if (!mission) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe da missão" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Esta missão não está mais disponível.</Text>
      </View>
    );
  }

  const concluida = Boolean(mission.concluidaEm);

  async function handleConcluir() {
    setConcluindo(true);
    setErro('');
    try {
      const resultado = await concluirMissao(mission.id);
      // Missão e campanha vivem em Contexts separados — reflete aqui, sem round-trip à API,
      // o mesmo crédito que ConcluirMissaoUseCase já aplicou ao valor_atual no backend.
      if (mission.campanha) {
        incrementarValorAtual(mission.campanha.id, resultado.pontuacaoCreditada);
      }
    } catch {
      setErro('Não foi possível concluir a missão. Tente novamente.');
    } finally {
      setConcluindo(false);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <ScreenHeader title="Detalhe da missão" onBack={() => navigation.goBack()} />

        <DetailSummaryCard
          accentColor={mission.corDestaque}
          title={mission.titulo}
          description={mission.descricao}
          chips={[
            { label: 'Missão', backgroundColor: colors.dangerSoft, textColor: colors.dangerText },
            concluida
              ? { label: 'Concluída', backgroundColor: colors.successSoft, textColor: colors.success }
              : { label: 'Em andamento', backgroundColor: colors.softPurpleAlt, textColor: colors.brandDark },
            {
              label: `+${mission.pontos} pts`,
              backgroundColor: colors.softPurpleAlt,
              textColor: colors.brandDark,
            },
          ]}
        />

        <DetailInfoCard
          rows={[
            { label: 'Prazo', value: mission.prazoCompleto },
            { label: 'Dificuldade', value: DIFICULDADE_LABELS[mission.dificuldade] },
            { label: 'Recorrência', value: RECORRENCIA_LABELS[mission.recorrencia] },
            { label: 'Campanha', value: mission.campanha?.titulo },
          ]}
        />

        {mission.progresso ? (
          <DetailProgressCard
            title="Progresso desta missão"
            subtitle={`${mission.progresso.concluidos} de ${mission.progresso.total} registros concluídos`}
            current={mission.progresso.concluidos}
            total={mission.progresso.total}
          />
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relação hierárquica</Text>
          <Text style={styles.cardSubtitle}>
            {mission.campanha ? `Campanha · ${mission.campanha.titulo}` : 'Missão sem área'}
          </Text>
        </View>

        <DetailRewardCard value={mission.recompensaLabel} />

        {erro ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}

        <PrimaryButton
          label={concluida ? 'Missão concluída' : concluindo ? 'Concluindo...' : 'Concluir missão'}
          onPress={handleConcluir}
          disabled={concluida || concluindo}
        />
        {!concluida ? (
          <SecondaryButton
            label="Editar missão"
            onPress={() => navigation.navigate('MissionForm', { missionId: mission.id })}
            icon={<IconEdit width={24} height={24} />}
          />
        ) : null}
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
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.detailTitle,
    color: colors.textPrimaryStrong,
  },
  cardSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.textSecondaryAlt,
  },
});
