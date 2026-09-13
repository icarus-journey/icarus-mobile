import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function InputField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  helper,
  error,
  maxLength,
  multiline,
  keyboardType = 'default',
  secureTextEntry,
  textContentType,
  autoCapitalize,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? '*' : ''}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        maxLength={maxLength}
        multiline={multiline}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        accessibilityHint={helper}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          Boolean(error) && styles.fieldError,
        ]}
      />
      {error ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
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
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  fieldMultiline: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  fieldError: {
    borderColor: colors.dangerText,
  },
  helperText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
});
