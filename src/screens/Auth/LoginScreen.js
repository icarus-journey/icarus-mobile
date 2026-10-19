import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { useAuth } from '../../state/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { isAuthFormValid, validateLogin } from './authValidation';

function mensagemDeErroLogin(erro) {
  if (erro.status === 401) return 'E-mail ou senha inválidos.';
  if (erro.status === 429) return 'Muitas tentativas. Tente novamente mais tarde.';
  return 'Não foi possível entrar. Tente novamente.';
}

export function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { entrar } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [enviando, setEnviando] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleLogin() {
    const validationErrors = validateLogin(values);
    setErrors(validationErrors);

    if (!isAuthFormValid(validationErrors)) {
      return;
    }

    setEnviando(true);
    try {
      await entrar(values.email, values.password);
      navigation.replace('MissionList');
    } catch (erro) {
      setErrors({ geral: mensagemDeErroLogin(erro) });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.logoArea} accessible accessibilityLabel="Icarus">
          <Text style={styles.logoMark}>✦</Text>
          <Text style={styles.logoText}>icarus</Text>
        </View>

        <View style={styles.form}>
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
            label="Senha"
            required
            value={values.password}
            onChangeText={(text) => setField('password', text)}
            placeholder="••••••••"
            maxLength={128}
            secureTextEntry
            textContentType="password"
            autoCapitalize="none"
            error={errors.password}
          />

          <Pressable
            disabled
            accessibilityRole="button"
            accessibilityLabel="Esqueci minha senha"
            accessibilityHint="Ainda não disponível nesta versão"
            style={styles.forgotLink}
          >
            <Text style={styles.linkLabel}>Esqueci minha senha</Text>
          </Pressable>

          {errors.geral ? (
            <Text style={styles.errorBanner} accessibilityLiveRegion="polite">
              {errors.geral}
            </Text>
          ) : null}

          <PrimaryButton
            label={enviando ? 'Entrando...' : 'Entrar na minha jornada'}
            onPress={handleLogin}
            disabled={enviando}
          />

          <SecondaryButton
            label="Continuar com Google"
            onPress={() => {}}
            disabled
            accessibilityHint="Ainda não disponível nesta versão"
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Ainda não tem conta?</Text>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
            accessibilityLabel="Criar conta"
          >
            <Text style={styles.footerLink}>Criar conta</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 32,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 34,
  },
  logoMark: {
    marginRight: 2,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.brand,
  },
  logoText: {
    fontFamily: fontFamily.bold,
    fontSize: 34,
    color: colors.brand,
  },
  form: {
    gap: 14,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    minHeight: 32,
    justifyContent: 'center',
  },
  linkLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandLink,
  },
  errorBanner: {
    marginTop: -4,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 26,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandLink,
  },
});
