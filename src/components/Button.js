import { Pressable, StyleSheet, Text, View } from 'react-native';

import IconArrowRight from '../assets/icons/icon-arrow-right.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function PrimaryButton({ label, onPress, disabled, showIcon = true, accessibilityHint }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.primaryDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryLabel}>{label}</Text>
      {showIcon && <IconArrowRight width={24} height={24} />}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, icon, accessibilityHint }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [styles.secondary, pressed && !disabled && styles.pressed]}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    minWidth: 44,
    borderRadius: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.brand,
  },
  primaryDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  primaryLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.white,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    minWidth: 44,
    borderRadius: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.brandLink,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
