import { useExecucaoMissao } from '../../hooks/useExecucaoMissao';
import { useExclusaoPlanejamento } from '../../hooks/useExclusaoPlanejamento';
import { BotaoExcluirPlanejamento } from '../../components/BotaoExcluirPlanejamento';
import { useRef, useState } from 'react';
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
  const exclusao = useExclusaoPlanejamento({ tipo: 'missoes', id: missionId, navigation });
  const { getMissionById, concluirMissao, pararMissao, aplicarExecucao } = useMissions();
  const { incrementarValorAtual, getCampaignById } = useCampaigns();
  const insets = useSafeAreaInsets();
  const mission = getMissionById(missionId);
  const leitura = useExecucaoMissao(missionId, navigation, aplicarExecucao);
  const execucao = leitura.dados?.execucao;
  const [concluindo, setConcluindo] = useState(false);
  const envioEmCurso = useRef(false);
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

  const concluida = execucao ? execucao.concluida : Boolean(mission.concluidaEm);
  const campanha = mission.campanha ? getCampaignById(mission.campanha.id) : null;
  const campanhaEncerrada = ['concluida', 'excluida'].includes(campanha?.estado);
  const inativa = Boolean(mission.inativa) || (campanhaEncerrada && mission.recorrente);

  async function handleConcluir() {
    if (envioEmCurso.current || !execucao?.podeConcluir) return;
    envioEmCurso.current = true;
    setConcluindo(true);
    setErro('');
    try {
      const resultado = await concluirMissao(mission.id, execucao.ocorrenciaId);
      vibrarConclusao();
      // Missão e campanha vivem em Contexts separados — reflete aqui, sem round-trip à API,
      // o mesmo crédito que ConcluirMissaoUseCase já aplicou ao valor_atual no backend.
      if (mission.campanha && !resultado.repetida) {
        incrementarValorAtual(mission.campanha.id, resultado.pontuacaoCreditada);
      }
      leitura.atualizar();
    } catch (falha) {
      setErro(
        falha.status === 409
          ? 'A execução mudou. Atualize os dados antes de concluir.'
          : 'Não foi possível concluir a missão. Tente novamente.',
      );
      leitura.atualizar();
    } finally {
      envioEmCurso.current = false;
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
              leitura.atualizar();
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
              ? {
                  label: 'Parada',
                  backgroundColor: colors.dangerSoft,
                  textColor: colors.dangerText,
                }
              : concluida
                ? {
                    label: 'Concluída',
                    backgroundColor: colors.successSoft,
                    textColor: colors.success,
                  }
                : {
                    label: 'Em andamento',
                    backgroundColor: colors.softPurpleAlt,
                    textColor: colors.brandDark,
                  },
            {
              label: `+${execucao?.pontuacao ?? mission.pontos} pts`,
              backgroundColor: colors.softPurpleAlt,
              textColor: colors.brandDark,
            },
          ]}
        />

        <DetailInfoCard
          rows={[
            {
              label: execucao ? 'Execução' : 'Prazo',
              value: execucao?.dataPrevista
                ? execucao.dataPrevista.split('-').reverse().join('/')
                : mission.prazoCompleto,
            },
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

        <DetailRewardCard
          label={mission.recorrente ? 'Pontos desta execução' : 'Recompensa'}
          value={
            execucao?.pontuacao != null ? `${execucao.pontuacao} pontos` : mission.recompensaLabel
          }
        />

        {erro ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}

        {leitura.erro ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {leitura.erro}
          </Text>
        ) : null}
        <PrimaryButton
          label={
            leitura.carregando
              ? 'Carregando execução...'
              : concluida
                ? 'Missão concluída'
                : campanhaEncerrada
                  ? 'Campanha encerrada'
                  : inativa
                    ? 'Missão parada'
                    : execucao?.codigoBloqueio === 'campanha_nao_iniciada'
                      ? 'Campanha não iniciada'
                      : execucao?.codigoBloqueio === 'execucao_futura' && execucao.proximaData
                        ? `Disponível em ${execucao.proximaData.split('-').reverse().join('/')}`
                        : !execucao?.podeConcluir
                          ? 'Sem execução disponível'
                          : concluindo
                            ? 'Concluindo...'
                            : 'Concluir missão'
          }
          onPress={handleConcluir}
          disabled={
            leitura.carregando ||
            !execucao?.podeConcluir ||
            campanhaEncerrada ||
            inativa ||
            concluida ||
            concluindo ||
            exclusao.excluindo
          }
        />
        {leitura.erro || erro ? (
          <SecondaryButton
            label="Atualizar execução"
            onPress={() => {
              setErro('');
              leitura.atualizar();
            }}
          />
        ) : null}
        {!campanhaEncerrada && (!concluida || mission.recorrente) && !inativa ? (
          <SecondaryButton
            label="Editar missão"
            disabled={exclusao.excluindo}
            onPress={() => navigation.navigate('MissionForm', { missionId: mission.id })}
            icon={<IconEdit width={24} height={24} />}
          />
        ) : null}
        {mission.recorrente && !inativa ? (
          <SecondaryButton
            label={parando ? 'Parando...' : 'Parar missão'}
            onPress={handleParar}
            disabled={parando || exclusao.excluindo}
          />
        ) : null}
        {mission.recorrente || (!concluida && !inativa) ? (
          <BotaoExcluirPlanejamento
            nome="missão"
            hierarquia={false}
            aoExcluir={exclusao.excluir}
            excluindo={exclusao.excluindo}
            erro={exclusao.erro}
            disabled={concluindo || parando}
          />
        ) : null}
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
