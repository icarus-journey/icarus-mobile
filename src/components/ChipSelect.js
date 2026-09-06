import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function ChipSelect({ options, value, onSelect, accessibilityLabel }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
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
  chip: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.brandAccent,
    backgroundColor: colors.softPurpleAlt,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: '#514a5f',
  },
  labelSelected: {
    fontFamily: fontFamily.semiBold,
    color: colors.brandDark,
  },
});
