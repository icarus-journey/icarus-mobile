import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [answers, setAnswers] = useState({});

  const setSingleAnswer = useCallback((questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }, []);

  const toggleMultiAnswer = useCallback((questionId, value) => {
    setAnswers((current) => {
      const selected = current[questionId] ?? [];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [questionId]: next };
    });
  }, []);

  const value = useMemo(
    () => ({ answers, setSingleAnswer, toggleMultiAnswer }),
    [answers, setSingleAnswer, toggleMultiAnswer],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding deve ser usado dentro de um OnboardingProvider');
  }
  return context;
}
