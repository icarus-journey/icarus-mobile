import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { vibrarConclusao } from '../../utils/haptics';

const DIFICULDADE_LABELS = {
  TRIVIAL: 'Trivial',
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
};

export function MissionDetailScreen({ route, navigation }) {
  const { missionId } = route.params;
  const { getMissionById, concluirMissao, pararMissao } = useMissions();
  const { incrementarValorAtual } = useCampaigns();
  const insets = useSafeAreaInsets();
  const mission = getMissionById(missionId);
  const [concluindo, setConcluindo] = useState(false);
  const [parando, setParando] = useState(false);
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
  const inativa = Boolean(mission.inativa);

  async function handleConcluir() {
    setConcluindo(true);
    setErro('');
    try {
      const resultado = await concluirMissao(mission.id);
      vibrarConclusao();
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

  function handleParar() {
    Alert.alert(
      'Parar esta missão?',
      'Ela deixa de gerar novos dias. Dias futuros ainda não vencidos são cancelados; os atrasados ficam no histórico.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Parar',
          style: 'destructive',
          onPress: async () => {
            setParando(true);
            setErro('');
            try {
              await pararMissao(mission.id);
            } catch {
              setErro('Não foi possível parar a missão. Tente novamente.');
            } finally {
              setParando(false);
            }
          },
        },
      ],
    );
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
            inativa
              ? { label: 'Parada', backgroundColor: colors.dangerSoft, textColor: colors.dangerText }
              : concluida
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
            { label: 'Recorrente', value: mission.recorrente ? 'Sim' : 'Não' },
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
          label={
            inativa ? 'Missão parada'
            : concluida ? 'Missão concluída'
            : concluindo ? 'Concluindo...'
            : 'Concluir missão'
          }
          onPress={handleConcluir}
          disabled={inativa || concluida || concluindo}
        />
        {!concluida && !inativa && !mission.recorrente ? (
          <SecondaryButton
            label="Editar missão"
            onPress={() => navigation.navigate('MissionForm', { missionId: mission.id })}
            icon={<IconEdit width={24} height={24} />}
          />
        ) : null}
        {mission.recorrente && !inativa ? (
          <SecondaryButton
            label={parando ? 'Parando...' : 'Parar missão'}
            onPress={handleParar}
            disabled={parando}
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
