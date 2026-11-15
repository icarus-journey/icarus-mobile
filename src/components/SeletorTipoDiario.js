import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const TIPOS = [
  { value: 'REFLEXAO', label: 'Reflexão' },
  { value: 'DESLIZE', label: 'Deslize' },
];

export function SeletorTipoDiario({ value, onChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TIPOS.map((tipo) => {
        const isActive = value === tipo.value;

        return (
          <Pressable
            key={tipo.value}
            onPress={() => onChange(tipo.value)}
            accessibilityRole="tab"
            accessibilityLabel={tipo.label}
            accessibilityState={{ selected: isActive }}
            style={isActive ? styles.activeSegment : styles.segment}
          >
            <Text style={isActive ? styles.activeLabel : styles.label}>{tipo.label}</Text>
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
    height: 40,
    padding: 4,
    borderRadius: 20,
    backgroundColor: colors.softPurple,
  },
  activeSegment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.brand,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  activeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.white,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.brand,
  },
});
