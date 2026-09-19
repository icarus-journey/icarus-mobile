import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const SEGMENTS = [
  { value: 'MISSAO', label: 'Missão' },
  { value: 'CAMPANHA', label: 'Campanha' },
  { value: 'EPICO', label: 'Épico' },
];

export function SegmentedControl({ value, onChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {SEGMENTS.map((segment) => {
        const isActive = segment.value === value;

        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={segment.label}
            style={isActive ? styles.activeSegment : styles.segment}
          >
            <Text style={isActive ? styles.activeLabel : styles.label}>{segment.label}</Text>
          </Pressable>
        );
      })}
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
