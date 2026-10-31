import { useExclusaoPlanejamento } from '../../hooks/useExclusaoPlanejamento';
import { BotaoExcluirPlanejamento } from '../../components/BotaoExcluirPlanejamento';
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
import { useEpics } from '../../state/EpicsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { vibrarConclusao } from '../../utils/haptics';

const DIFICULDADE_LABELS = {
  TRIVIAL: 'Trivial',
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
};

const ESTADO_EPICO_LABELS = {
  emAndamento: 'Em andamento',
  concluido: 'Concluído',
  excluido: 'Excluído',
};

export function EpicDetailScreen({ route, navigation }) {
  const { epicId } = route.params;
  const exclusao = useExclusaoPlanejamento({ tipo: 'epicos', id: epicId, navigation });
  const { getEpicById, concluirEpico } = useEpics();
  const insets = useSafeAreaInsets();
  const epic = getEpicById(epicId);
  const [concluindo, setConcluindo] = useState(false);
  const [erro, setErro] = useState('');

  if (!epic) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
        <ScreenHeader title="Detalhe do épico" onBack={() => navigation.goBack()} />
        <Text style={styles.notFound}>Este épico não está mais disponível.</Text>
      </View>
    );
  }

  const concluido = epic.estado === 'concluido';
  const estadoLabel = ESTADO_EPICO_LABELS[epic.estado] ?? 'Em andamento';

  async function handleConcluir() {
    setConcluindo(true);
    setErro('');
    try {
      await concluirEpico(epic.id);
      vibrarConclusao();
    } catch {
      setErro('Não foi possível concluir o épico. Tente novamente.');
    } finally {
      setConcluindo(false);
    }
  }

  const quantidadeCampanhas = epic.campanhasAtribuidas?.length ?? 0;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <ScreenHeader title="Detalhe do épico" onBack={() => navigation.goBack()} />

        <DetailSummaryCard
          accentColor={epic.corDestaque}
          title={epic.titulo}
          description={epic.descricao}
          chips={[
            { label: 'Épico', backgroundColor: colors.dangerSoft, textColor: colors.dangerText },
            concluido
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
            { label: 'Status', value: estadoLabel },
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

        {erro ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}

        <PrimaryButton
          label={concluido ? 'Épico concluído' : concluindo ? 'Concluindo...' : 'Concluir épico'}
          onPress={handleConcluir}
          disabled={concluido || concluindo || exclusao.excluindo}
        />
        {!concluido ? (
          <SecondaryButton
            label="Editar épico"
            disabled={exclusao.excluindo}
            onPress={() => navigation.navigate('EpicForm', { epicId: epic.id })}
            icon={<IconEdit width={24} height={24} />}
          />
        ) : null}
        {true ? (
          <BotaoExcluirPlanejamento
            nome="épico"
            hierarquia={true}
            aoExcluir={exclusao.excluir}
            excluindo={exclusao.excluindo}
            erro={exclusao.erro}
            disabled={concluindo}
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
});
