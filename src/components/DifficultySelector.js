import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const OPTIONS = [
  { value: 'TRIVIAL', label: 'Trivial', stars: '★' },
  { value: 'FACIL', label: 'Fácil', stars: '★★' },
  { value: 'MEDIA', label: 'Média', stars: '★★★' },
  { value: 'DIFICIL', label: 'Difícil', stars: '★★★★' },
];

export function DifficultySelector({ value, onSelect }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.option, selected && styles.optionSelected]}
          >
            <Text style={[styles.stars, selected && styles.textSelected]}>{option.stars}</Text>
            <Text style={[styles.label, selected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  option: {
    flex: 1,
    height: 74,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.softPurpleLight,
  },
  optionSelected: {
    backgroundColor: colors.brandDark,
  },
  stars: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.brandDark,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textPrimaryStrong,
  },
  textSelected: {
    color: colors.white,
  },
});
