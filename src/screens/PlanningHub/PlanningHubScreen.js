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

const MISSION_STATUS_ORDER = { ATRASADA: 0, PENDENTE: 1 };

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

  const orderedMissions = useMemo(
    () =>
      [...missions].sort((a, b) => MISSION_STATUS_ORDER[a.status] - MISSION_STATUS_ORDER[b.status]),
    [missions],
  );

  const destaqueEpic = epics.find((epic) => epic.destaque) ?? null;
  const otherEpics = epics.filter((epic) => epic !== destaqueEpic);

  const destaqueCampaign = campaigns.find((campaign) => campaign.destaque) ?? null;
  const otherCampaigns = campaigns.filter((campaign) => campaign !== destaqueCampaign);

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
            data={orderedMissions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            renderItem={({ item }) => (
              <TaskCard
                mission={item}
                onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                title="Nenhuma missão por aqui"
                subtitle="Crie sua primeira missão para começar a acompanhar seus passos."
                buttonLabel="Criar missão"
                onCreate={() => navigation.navigate('MissionForm')}
              />
            }
          />
        ) : null}

        {segment === 'CAMPANHA' ? (
          <FlatList
            data={otherCampaigns}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            ListHeaderComponent={
              destaqueCampaign ? (
                <CampaignHeroCard
                  campaign={destaqueCampaign}
                  onPress={() =>
                    navigation.navigate('CampaignDetail', { campaignId: destaqueCampaign.id })
                  }
                />
              ) : null
            }
            renderItem={({ item }) => (
              <TaskCard
                mission={item}
                statusLabel="em andamento"
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
              />
            )}
            ListEmptyComponent={
              destaqueCampaign ? null : (
                <EmptyState
                  title="Nenhuma campanha por aqui"
                  subtitle="Crie sua primeira campanha para organizar suas missões."
                  buttonLabel="Criar campanha"
                  onCreate={() => navigation.navigate('CampaignForm')}
                />
              )
            }
          />
        ) : null}

        {segment === 'EPICO' ? (
          <FlatList
            data={otherEpics}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
            ListHeaderComponent={
              destaqueEpic ? (
                <EpicHeroCard
                  epic={destaqueEpic}
                  onPress={() => navigation.navigate('EpicDetail', { epicId: destaqueEpic.id })}
                />
              ) : null
            }
            renderItem={({ item }) => (
              <TaskCard
                mission={item}
                statusLabel="em andamento"
                onPress={() => navigation.navigate('EpicDetail', { epicId: item.id })}
              />
            )}
            ListEmptyComponent={
              destaqueEpic ? null : (
                <EmptyState
                  title="Nenhum épico por aqui"
                  subtitle="Crie seu primeiro épico para dar rumo à sua jornada."
                  buttonLabel="Criar épico"
                  onCreate={() => navigation.navigate('EpicForm')}
                />
              )
            }
          />
        ) : null}
      </View>

      <BottomNav onPressMissoes={() => navigation.popToTop()} />
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
});
