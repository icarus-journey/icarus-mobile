import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const INERT_OPTIONS = ['Campanha', 'Épico'];

export function SegmentedControl() {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      <View style={styles.activeSegment}>
        <Text style={styles.activeLabel}>Missão</Text>
      </View>
      {INERT_OPTIONS.map((label) => (
        <View
          key={label}
          style={styles.segment}
          accessible
          accessibilityLabel={`${label}, ainda não disponível nesta versão`}
        >
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
    height: 38,
    padding: 4,
    borderRadius: 18,
    width: '100%',
    backgroundColor: colors.softPurple,
  },
  activeSegment: {
    flex: 1,
    height: 30,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  activeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.white,
  },
  segment: {
    flex: 1,
    height: 29,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.brand,
  },
});
