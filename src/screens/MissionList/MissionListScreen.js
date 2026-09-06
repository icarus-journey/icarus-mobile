import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { EmptyState } from '../../components/EmptyState';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TaskCard } from '../../components/TaskCard';
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const STATUS_ORDER = { ATRASADA: 0, PENDENTE: 1 };

export function MissionListScreen({ navigation }) {
  const { missions } = useMissions();
  const insets = useSafeAreaInsets();

  const orderedMissions = useMemo(
    () => [...missions].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [missions],
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text style={styles.title}>Missões</Text>
            <Text style={styles.subtitle}>Seus próximos passos.</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('MissionForm')}
            accessibilityRole="button"
            accessibilityLabel="Adicionar missão"
            style={styles.addButton}
          >
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </Pressable>
        </View>

        <SegmentedControl />

        <FlatList
          data={orderedMissions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TaskCard
              mission={item}
              onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState onCreateMission={() => navigation.navigate('MissionForm')} />
          }
        />
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
