import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function SelectField({ label, required, value, placeholder, onPress, error }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? '*' : ''}
      </Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Toque para escolher"
        style={[styles.field, Boolean(error) && styles.fieldError]}
      >
        <Text style={value ? styles.value : styles.placeholder}>{value ?? placeholder}</Text>
      </Pressable>
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textPrimary,
  },
  field: {
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  fieldError: {
    borderColor: colors.dangerText,
  },
  value: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
  placeholder: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
});
