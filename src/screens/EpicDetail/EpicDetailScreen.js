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
import { useEpics } from '../../state/EpicsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const DIFICULDADE_LABELS = {
  TRIVIAL: 'Trivial',
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
};

export function EpicDetailScreen({ route, navigation }) {
  const { epicId } = route.params;
  const { getEpicById } = useEpics();
  const insets = useSafeAreaInsets();
  const epic = getEpicById(epicId);

  if (!epic) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe do épico" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Este épico não está mais disponível.</Text>
      </View>
    );
  }

  const quantidadeCampanhas = epic.campanhasAtribuidas?.length ?? 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      >
        <ScreenHeader title="Detalhe do épico" onBack={() => navigation.goBack()} />

        <DetailSummaryCard
          accentColor={epic.corDestaque}
          title={epic.titulo}
          description={epic.descricao}
          chips={[
            { label: 'Épico', backgroundColor: colors.dangerSoft, textColor: colors.dangerText },
            {
              label: 'Em andamento',
              backgroundColor: colors.softPurpleAlt,
              textColor: colors.brandDark,
            },
            epic.pontos
              ? {
                  label: `+${epic.pontos} pts`,
                  backgroundColor: colors.softPurpleAlt,
                  textColor: colors.brandDark,
                }
              : null,
          ].filter(Boolean)}
        />

        <DetailInfoCard
          rows={[
            { label: 'Prazo', value: epic.prazoLabel },
            { label: 'Dificuldade', value: DIFICULDADE_LABELS[epic.dificuldade] },
            {
              label: 'Campanhas',
              value: quantidadeCampanhas > 0 ? `${quantidadeCampanhas} atribuídas` : null,
            },
            { label: 'Status', value: 'Em andamento' },
          ]}
        />

        {epic.progresso ? (
          <DetailProgressCard
            title="Progresso deste épico"
            subtitle={`${epic.progresso.concluidas} de ${epic.progresso.total} campanhas concluídas`}
            current={epic.progresso.concluidas}
            total={epic.progresso.total}
          />
        ) : null}

        <DetailRewardCard value={epic.recompensaLabel} />

        <PrimaryButton
          label="Concluir épico"
          onPress={() => {}}
          accessibilityHint="Ainda não disponível nesta versão"
        />
        <SecondaryButton
          label="Editar épico"
          onPress={() => navigation.navigate('EpicForm', { epicId: epic.id })}
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
