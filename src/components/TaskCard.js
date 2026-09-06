import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function TaskCard({ mission, onPress }) {
  const accessibilityLabel = `${mission.titulo}, ${mission.prazoLabel}, ${
    mission.status === 'ATRASADA' ? 'atrasada' : 'pendente'
  }, mais ${mission.pontos} pontos`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={[styles.accent, { backgroundColor: mission.corDestaque }]} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {mission.titulo}
        </Text>
        <Text style={styles.subtitle}>{mission.prazoLabel}</Text>
      </View>
      <Text style={styles.points}>+{mission.pontos} XP</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 66,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.85,
  },
  accent: {
    width: 4,
    height: 34,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textPrimaryStrong,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondaryAlt,
  },
  points: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondaryAlt,
  },
});
