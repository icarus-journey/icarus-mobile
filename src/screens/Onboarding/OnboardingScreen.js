import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingProgress } from '../../components/OnboardingProgress';
import { OptionCard } from '../../components/OptionCard';
import { PrimaryButton } from '../../components/Button';
import { QuestionPrompt } from '../../components/QuestionPrompt';
import { useOnboarding } from '../../state/OnboardingContext';
import { colors } from '../../theme/colors';
import { getStepQuestion, TOTAL_ONBOARDING_STEPS } from './onboardingQuestions';

export function OnboardingScreen({ navigation }) {
  const { answers, setSingleAnswer, toggleMultiAnswer } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);

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
      navigation.replace('MissionList', { initialSegment: 'MISSAO' });
    } else {
      setStepIndex((current) => current + 1);
    }
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
});
