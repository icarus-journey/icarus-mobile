import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function ChipSelect({ options, value, onSelect, accessibilityLabel, multiple = false }) {
  const selectedValues = multiple ? value ?? [] : null;

  function handlePress(optionValue) {
    if (!multiple) {
      onSelect(optionValue);
      return;
    }
    const jaSelecionado = selectedValues.includes(optionValue);
    const proximo = jaSelecionado
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    onSelect(proximo);
  }

  return (
    <View
      style={[styles.row, multiple && styles.rowWrap]}
      accessibilityRole={multiple ? undefined : 'radiogroup'}
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = multiple ? selectedValues.includes(option.value) : option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => handlePress(option.value)}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ selected, checked: multiple ? selected : undefined }}
            accessibilityLabel={option.label}
            style={[styles.chip, multiple && styles.chipAuto, selected && styles.chipSelected]}
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
  rowWrap: {
    flexWrap: 'wrap',
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
  chipAuto: {
    flex: 0,
    paddingHorizontal: 14,
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
