import { Pressable, StyleSheet, Text, View } from 'react-native';

import IconRadioSelected from '../assets/icons/icon-radio-selected.svg';
import IconRadioUnselected from '../assets/icons/icon-radio-unselected.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function RadioBinary({ value, onChange, positiveLabel = 'Sim', negativeLabel = 'Não' }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      <Option label={positiveLabel} selected={value === 'Sim'} onPress={() => onChange('Sim')} />
      <Option label={negativeLabel} selected={value === 'Não'} onPress={() => onChange('Não')} />
    </View>
  );
}

function Option({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[styles.option, selected && styles.optionSelected]}
    >
      {selected ? (
        <IconRadioSelected width={20} height={20} />
      ) : (
        <IconRadioUnselected width={20} height={20} />
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
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
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderWidth: 2,
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
