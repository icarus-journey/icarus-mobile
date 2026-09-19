import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function OnboardingProgress({ step, totalSteps }) {
  const percent = Math.min(100, (step / totalSteps) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        PASSO {step} DE {totalSteps}
      </Text>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: totalSteps, now: step }}
        accessibilityLabel={`Passo ${step} de ${totalSteps}`}
      >
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.onboardingBrand,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.onboardingProgressTrack,
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.onboardingProgressFill,
  },
});
