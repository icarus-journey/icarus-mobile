import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { maskDateInput } from '../../utils/dateInput';
import { getPasswordChecks, isAuthFormValid, validateRegister } from './authValidation';

const INITIAL_VALUES = {
  name: '',
  email: '',
  birthDate: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

export function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const passwordChecks = getPasswordChecks(values.password);
  const passwordsMatch =
    values.password.length > 0 &&
    values.confirmPassword.length > 0 &&
    values.password === values.confirmPassword;

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleRegister() {
    const validationErrors = validateRegister(values);
    setErrors(validationErrors);

    if (isAuthFormValid(validationErrors)) {
      navigation.replace('Onboarding');
    }
  }

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 38, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <Text style={styles.title}>Crie seu espaço de evolução</Text>

        <InputField
          label="Como podemos chamar você?"
          required
          value={values.name}
          onChangeText={(text) => setField('name', text)}
          placeholder="Digite um nome"
          textContentType="name"
          error={errors.name}
        />

        <InputField
          label="E-mail"
          required
          value={values.email}
          onChangeText={(text) => setField('email', text)}
          placeholder="Digite um email"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoCapitalize="none"
          error={errors.email}
        />

        <InputField
          label="Data de nascimento"
          required
          value={values.birthDate}
          onChangeText={(text) => setField('birthDate', maskDateInput(text))}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.birthDate}
        />

        <InputField
          label="Senha"
          required
          value={values.password}
          onChangeText={(text) => setField('password', text)}
          placeholder="••••••••"
          maxLength={128}
          secureTextEntry
          textContentType="newPassword"
          autoCapitalize="none"
          error={errors.password}
        />

        <InputField
          label="Confirmar senha"
          required
          value={values.confirmPassword}
          onChangeText={(text) => setField('confirmPassword', text)}
          placeholder="••••••••"
          maxLength={128}
          secureTextEntry
          textContentType="newPassword"
          autoCapitalize="none"
          error={errors.confirmPassword}
        />
        <View style={styles.checkList} accessibilityLiveRegion="polite">
          <PasswordRule label="8 ou mais caracteres" checked={passwordChecks.minLength} />
          <PasswordRule label="No máximo 128 caracteres" checked={passwordChecks.maxLength} />
          <PasswordRule label="As senhas precisam coincidir" checked={passwordsMatch} />
        </View>

        {passwordsMatch ? <Text style={styles.successText}>As senhas coincidem</Text> : null}

        <Pressable
          onPress={() => setField('acceptedTerms', !values.acceptedTerms)}
          accessibilityRole="checkbox"
          accessibilityLabel="Li e aceito os Termos e a Política de Privacidade"
          accessibilityState={{ checked: values.acceptedTerms }}
          style={styles.termsRow}
        >
          <View style={[styles.checkbox, values.acceptedTerms && styles.checkboxChecked]}>
            {values.acceptedTerms ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>Li e aceito os Termos e a Política de Privacidade.</Text>
        </Pressable>
        {errors.acceptedTerms ? (
          <Text style={styles.errorText} accessibilityLiveRegion="polite">
            {errors.acceptedTerms}
          </Text>
        ) : null}

        <PrimaryButton label="Criar conta" onPress={handleRegister} />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Já tem uma conta?</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Entrar"
          >
            <Text style={styles.footerLink}>Entrar</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

function PasswordRule({ label, checked }) {
  return (
    <View
      style={styles.ruleRow}
      accessible
      accessibilityLabel={`${label}: ${checked ? 'ok' : 'pendente'}`}
    >
      <Text style={[styles.ruleIcon, checked && styles.ruleIconChecked]}>
        {checked ? '✓' : '○'}
      </Text>
      <Text style={[styles.ruleLabel, checked && styles.ruleLabelChecked]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    gap: 14,
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  title: {
    width: '82%',
    marginBottom: 12,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  checkList: {
    gap: 5,
    marginTop: -6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleIcon: {
    width: 12,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  ruleIconChecked: {
    color: colors.success,
  },
  ruleLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  ruleLabelChecked: {
    color: colors.success,
  },
  successText: {
    marginTop: -8,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.success,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  checkboxMark: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.white,
  },
  termsText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: -8,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.brandLink,
  },
  footerLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandLink,
  },
});
