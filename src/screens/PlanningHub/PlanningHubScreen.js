import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { CampaignHeroCard } from '../../components/CampaignHeroCard';
import { EmptyState } from '../../components/EmptyState';
import { EpicHeroCard } from '../../components/EpicHeroCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TaskCard } from '../../components/TaskCard';
import { useCampaigns } from '../../state/CampaignsContext';
import { useEpics } from '../../state/EpicsContext';
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { isDataLimiteVencida } from '../../utils/dateInput';

function isMissaoAtrasada(mission) {
  return mission.status === 'ATRASADA' || isDataLimiteVencida(mission.dataLimite);
}

function SecaoExtra({ title, children }) {
  return (
    <View style={styles.extraSection}>
      <Text style={styles.extraTitle}>{title}</Text>
      <View style={styles.extraList}>{children}</View>
    </View>
  );
}

const HEADERS = {
  MISSAO: { title: 'Missões', subtitle: 'Seus próximos passos.' },
  CAMPANHA: { title: 'Campanhas', subtitle: 'Progresso das suas campanhas.' },
  EPICO: { title: 'Épicos', subtitle: 'Objetivos que movem sua jornada.' },
};

const ADD_LABELS = {
  MISSAO: 'Adicionar missão',
  CAMPANHA: 'Adicionar campanha',
  EPICO: 'Adicionar épico',
};

const ADD_ROUTES = {
  MISSAO: 'MissionForm',
  CAMPANHA: 'CampaignForm',
  EPICO: 'EpicForm',
};

export function PlanningHubScreen({ navigation, route }) {
  const { missions } = useMissions();
  const { campaigns } = useCampaigns();
  const { epics } = useEpics();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState(route.params?.initialSegment ?? 'MISSAO');

  const { ativas: missoesAtivas, atrasadas: missoesAtrasadas, concluidas: missoesConcluidas } = useMemo(() => {
    const concluidas = missions.filter((m) => m.concluidaEm);
    const atrasadas = missions.filter((m) => !m.concluidaEm && isMissaoAtrasada(m));
    const ativas = missions.filter((m) => !m.concluidaEm && !isMissaoAtrasada(m));
    return { ativas, atrasadas, concluidas };
  }, [missions]);

  const {
    ativas: campanhasAtivas,
    atrasadas: campanhasAtrasadas,
    concluidas: campanhasConcluidas,
  } = useMemo(() => {
    const concluidas = campaigns.filter((c) => c.estado === 'concluida');
    const atrasadas = campaigns.filter((c) => c.estado !== 'concluida' && isDataLimiteVencida(c.dataLimite));
    const ativas = campaigns.filter((c) => c.estado !== 'concluida' && !isDataLimiteVencida(c.dataLimite));
    return { ativas, atrasadas, concluidas };
  }, [campaigns]);

  const { ativos: epicosAtivos, atrasados: epicosAtrasados, concluidos: epicosConcluidos } = useMemo(() => {
    const concluidos = epics.filter((e) => e.estado === 'concluido');
    const atrasados = epics.filter((e) => e.estado !== 'concluido' && isDataLimiteVencida(e.dataLimite));
    const ativos = epics.filter((e) => e.estado !== 'concluido' && !isDataLimiteVencida(e.dataLimite));
    return { ativos, atrasados, concluidos };
  }, [epics]);

  const header = HEADERS[segment];

  function handleAdd() {
    navigation.navigate(ADD_ROUTES[segment]);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>{header.title}</Text>
            <Text style={styles.subtitle}>{header.subtitle}</Text>
          </View>
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel={ADD_LABELS[segment]}
            style={styles.addButton}
          >
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </Pressable>
        </View>

        <SegmentedControl value={segment} onChange={setSegment} />

        {segment === 'MISSAO' ? (
          <FlatList
            data={missoesAtivas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            renderItem={({ item }) => (
              <TaskCard
                mission={item}
                onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
              />
            )}
            ListEmptyComponent={
              missoesAtrasadas.length === 0 && missoesConcluidas.length === 0 ? (
                <EmptyState
                  title="Nenhuma missão por aqui"
                  subtitle="Crie sua primeira missão para começar a acompanhar seus passos."
                  buttonLabel="Criar missão"
                  onCreate={() => navigation.navigate('MissionForm')}
                />
              ) : null
            }
            ListFooterComponent={
              <>
                {missoesAtrasadas.length > 0 ? (
                  <SecaoExtra title="Atrasados">
                    {missoesAtrasadas.map((item) => (
                      <TaskCard
                        key={item.id}
                        mission={item}
                        onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
                {missoesConcluidas.length > 0 ? (
                  <SecaoExtra title="Concluídos">
                    {missoesConcluidas.map((item) => (
                      <TaskCard
                        key={item.id}
                        mission={item}
                        onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
              </>
            }
          />
        ) : null}

        {segment === 'CAMPANHA' ? (
          <FlatList
            data={campanhasAtivas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            renderItem={({ item }) => (
              <CampaignHeroCard
                campaign={item}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
              />
            )}
            ListEmptyComponent={
              campanhasAtrasadas.length === 0 && campanhasConcluidas.length === 0 ? (
                <EmptyState
                  title="Nenhuma campanha por aqui"
                  subtitle="Crie sua primeira campanha para organizar suas missões."
                  buttonLabel="Criar campanha"
                  onCreate={() => navigation.navigate('CampaignForm')}
                />
              ) : null
            }
            ListFooterComponent={
              <>
                {campanhasAtrasadas.length > 0 ? (
                  <SecaoExtra title="Atrasados">
                    {campanhasAtrasadas.map((item) => (
                      <CampaignHeroCard
                        key={item.id}
                        campaign={item}
                        onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
                {campanhasConcluidas.length > 0 ? (
                  <SecaoExtra title="Concluídos">
                    {campanhasConcluidas.map((item) => (
                      <CampaignHeroCard
                        key={item.id}
                        campaign={item}
                        onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
              </>
            }
          />
        ) : null}

        {segment === 'EPICO' ? (
          <FlatList
            data={epicosAtivos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            renderItem={({ item }) => (
              <EpicHeroCard
                epic={item}
                onPress={() => navigation.navigate('EpicDetail', { epicId: item.id })}
              />
            )}
            ListEmptyComponent={
              epicosAtrasados.length === 0 && epicosConcluidos.length === 0 ? (
                <EmptyState
                  title="Nenhum épico por aqui"
                  subtitle="Crie seu primeiro épico para dar rumo à sua jornada."
                  buttonLabel="Criar épico"
                  onCreate={() => navigation.navigate('EpicForm')}
                />
              ) : null
            }
            ListFooterComponent={
              <>
                {epicosAtrasados.length > 0 ? (
                  <SecaoExtra title="Atrasados">
                    {epicosAtrasados.map((item) => (
                      <EpicHeroCard
                        key={item.id}
                        epic={item}
                        onPress={() => navigation.navigate('EpicDetail', { epicId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
                {epicosConcluidos.length > 0 ? (
                  <SecaoExtra title="Concluídos">
                    {epicosConcluidos.map((item) => (
                      <EpicHeroCard
                        key={item.id}
                        epic={item}
                        onPress={() => navigation.navigate('EpicDetail', { epicId: item.id })}
                      />
                    ))}
                  </SecaoExtra>
                ) : null}
              </>
            }
          />
        ) : null}
      </View>

      <BottomNav
        onPressLoja={() => navigation.navigate('Loja')}
        onPressMissoes={() => navigation.popToTop()}
        onPressDiario={() => navigation.navigate('Diario')}
        onPressPerfil={() => navigation.navigate('Conta')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerTexts: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandStrong,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  plusVertical: {
    position: 'absolute',
    width: 2.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  list: {
    gap: 16,
    flexGrow: 1,
  },
  extraSection: {
    marginTop: 24,
    gap: 12,
  },
  extraTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textSecondary,
  },
  extraList: {
    gap: 16,
  },
});
