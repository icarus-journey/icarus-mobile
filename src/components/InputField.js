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
  acaoNoCampo,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? '*' : ''}
      </Text>
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          Boolean(error) && styles.fieldError,
        ]}
      >
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
            styles.input,
            multiline && styles.inputMultiline,
            acaoNoCampo && styles.inputComAcao,
          ]}
        />
        {acaoNoCampo ? (
          <View style={[styles.acaoNoCampo, multiline && styles.acaoNoCampoMultiline]}>
            {acaoNoCampo}
          </View>
        ) : null}
      </View>
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
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
  fieldMultiline: {
    height: 96,
  },
  inputMultiline: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputComAcao: {
    paddingRight: 52,
  },
  fieldError: {
    borderColor: colors.dangerText,
  },
  acaoNoCampo: {
    position: 'absolute',
    right: 6,
    top: 2,
  },
  acaoNoCampoMultiline: {
    top: 6,
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
