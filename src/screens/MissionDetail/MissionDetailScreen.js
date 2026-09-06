import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { StatusChip } from '../../components/StatusChip';
import IconEdit from '../../assets/icons/icon-edit.svg';
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
  const { getMissionById } = useMissions();
  const insets = useSafeAreaInsets();
  const mission = getMissionById(missionId);

  if (!mission) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe da missão" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Esta missão não está mais disponível.</Text>
      </View>
    );
  }

  const detailRows = [
    { label: 'Prazo', value: mission.prazoCompleto },
    { label: 'Dificuldade', value: DIFICULDADE_LABELS[mission.dificuldade] },
    { label: 'Recorrência', value: RECORRENCIA_LABELS[mission.recorrencia] },
    { label: 'Campanha', value: mission.campanha?.titulo },
  ].filter((row) => Boolean(row.value));

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      >
        <ScreenHeader title="Detalhe da missão" onBack={() => navigation.goBack()} />

        <View style={styles.card}>
          <View style={[styles.accent, { backgroundColor: mission.corDestaque }]} />
          <Text style={styles.missionTitle}>{mission.titulo}</Text>
          {mission.descricao ? (
            <Text style={styles.missionDescription}>{mission.descricao}</Text>
          ) : null}
          <View style={styles.chipsRow}>
            <StatusChip
              label="Missão"
              backgroundColor={colors.dangerSoft}
              textColor={colors.dangerText}
            />
            <StatusChip
              label="Em andamento"
              backgroundColor={colors.softPurpleAlt}
              textColor={colors.brandDark}
            />
            <StatusChip
              label={`+${mission.pontos} pts`}
              backgroundColor={colors.softPurpleAlt}
              textColor={colors.brandDark}
            />
          </View>
        </View>

        {detailRows.length > 0 ? (
          <View style={styles.card}>
            {detailRows.map((row) => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {mission.progresso ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progresso desta missão</Text>
            <Text style={styles.cardSubtitle}>
              {mission.progresso.concluidos} de {mission.progresso.total} registros concluídos
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      (mission.progresso.concluidos / mission.progresso.total) * 100,
                    )}%`,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Relação hierárquica</Text>
          <Text style={styles.cardSubtitle}>
            {mission.campanha ? `Campanha · ${mission.campanha.titulo}` : 'Missão sem área'}
          </Text>
        </View>

        {mission.recompensaLabel ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recompensa</Text>
            <Text style={styles.cardSubtitle}>{mission.recompensaLabel}</Text>
          </View>
        ) : null}

        <PrimaryButton
          label="Concluir missão"
          onPress={() => {}}
          accessibilityHint="Ainda não disponível nesta versão"
        />
        <SecondaryButton
          label="Editar missão"
          onPress={() => {}}
          icon={<IconEdit width={24} height={24} />}
          accessibilityHint="Ainda não disponível nesta versão"
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
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    backgroundColor: colors.surface,
  },
  accent: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  missionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.summaryTitle,
    color: colors.textPrimaryStrong,
  },
  missionDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.textSecondaryAlt,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondaryAlt,
  },
  detailValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.textPrimaryStrong,
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
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandAccent,
  },
});
