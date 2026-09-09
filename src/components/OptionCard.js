import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function OptionCard({ label, selected, onPress, role = 'radio' }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ selected, checked: role === 'checkbox' ? selected : undefined }}
      accessibilityLabel={label}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.onboardingOptionBorder,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderRadius: 16,
    borderColor: colors.onboardingOptionSelectedBorder,
    backgroundColor: colors.onboardingOptionSelectedBg,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.onboardingOptionSelectedText,
  },
});
