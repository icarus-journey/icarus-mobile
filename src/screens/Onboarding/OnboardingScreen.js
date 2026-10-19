import { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingProgress } from '../../components/OnboardingProgress';
import { OptionCard } from '../../components/OptionCard';
import { PrimaryButton } from '../../components/Button';
import { QuestionPrompt } from '../../components/QuestionPrompt';
import { iniciarOnboarding, obterStatusOnboarding } from '../../services/onboarding';
import { useAuth } from '../../state/AuthContext';
import { useCampaigns } from '../../state/CampaignsContext';
import { useEpics } from '../../state/EpicsContext';
import { useMissions } from '../../state/MissionsContext';
import { useOnboarding } from '../../state/OnboardingContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { buildRespostasFromAnswers, getStepQuestion, TOTAL_ONBOARDING_STEPS } from './onboardingQuestions';

const INTERVALO_CONSULTA_MS = 2000;
const TENTATIVAS_MAXIMAS = 30; // ~60s no total

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function OnboardingScreen({ navigation }) {
  const { answers, setSingleAnswer, toggleMultiAnswer } = useOnboarding();
  const { usuarioId, accessToken } = useAuth();
  const { hidratarDoOnboarding: hidratarEpico } = useEpics();
  const { hidratarDoOnboarding: hidratarCampanha } = useCampaigns();
  const { hidratarDoOnboarding: hidratarMissao } = useMissions();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [gerando, setGerando] = useState(false);
  const [erroGeracao, setErroGeracao] = useState(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex > 0) {
        setStepIndex((current) => current - 1);
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [stepIndex]);

  const question = getStepQuestion(stepIndex, answers);
  const isLastStep = stepIndex === TOTAL_ONBOARDING_STEPS - 1;
  const isMulti = question.type === 'multi';
  const selectedValue = answers[question.id];
  const selectedValues = isMulti ? (selectedValue ?? []) : null;
  const isValid = isMulti ? selectedValues.length > 0 : Boolean(selectedValue);

  function handleSelect(value) {
    if (isMulti) {
      toggleMultiAnswer(question.id, value);
    } else {
      setSingleAnswer(question.id, value);
    }
  }

  function handleContinue() {
    if (isLastStep) {
      iniciarGeracaoDaJornada();
    } else {
      setStepIndex((current) => current + 1);
    }
  }

  async function iniciarGeracaoDaJornada() {
    setErroGeracao(null);
    setGerando(true);

    try {
      const respostas = buildRespostasFromAnswers(answers);
      const { jobId } = await iniciarOnboarding({ usuarioId, token: accessToken, respostas });
      const resultado = await aguardarConclusao(jobId);

      const epic = hidratarEpico(resultado.epico);
      const campaign = hidratarCampanha(resultado.epico.campanha, epic);
      resultado.epico.campanha.missoes.forEach((missao) => hidratarMissao(missao, campaign));

      navigation.replace('MissionList', { initialSegment: 'EPICO' });
    } catch {
      setErroGeracao('Não foi possível gerar sua jornada agora. Tente novamente.');
    } finally {
      setGerando(false);
    }
  }

  async function aguardarConclusao(jobId) {
    for (let tentativa = 0; tentativa < TENTATIVAS_MAXIMAS; tentativa += 1) {
      const status = await obterStatusOnboarding({ usuarioId, token: accessToken, jobId });

      if (status.status === 'concluido') {
        return status;
      }
      if (status.status === 'falhou') {
        throw new Error(status.erro ?? 'Onboarding falhou.');
      }

      await aguardar(INTERVALO_CONSULTA_MS);
    }

    throw new Error('Tempo esgotado esperando a geração da jornada.');
  }

  if (gerando) {
    return (
      <View style={[styles.screen, styles.loadingScreen, { paddingTop: insets.top + 12 }]}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.loadingText} accessibilityLiveRegion="polite">
          Gerando sua jornada...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <OnboardingProgress step={stepIndex + 1} totalSteps={TOTAL_ONBOARDING_STEPS} />

        <QuestionPrompt text={question.title} />

        <View style={styles.options}>
          {question.options.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              role={isMulti ? 'checkbox' : 'radio'}
              selected={
                isMulti ? selectedValues.includes(option.value) : selectedValue === option.value
              }
              onPress={() => handleSelect(option.value)}
            />
          ))}
        </View>

        {erroGeracao ? (
          <Text style={styles.errorBanner} accessibilityLiveRegion="polite">
            {erroGeracao}
          </Text>
        ) : null}

        <PrimaryButton
          label={isLastStep ? 'Preparar minha jornada' : 'Continuar'}
          onPress={handleContinue}
          disabled={!isValid}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  options: {
    width: '100%',
    gap: 12,
  },
  loadingScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  errorBanner: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
});
