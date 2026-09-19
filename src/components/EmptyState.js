import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { PrimaryButton } from './Button';

export function EmptyState({
  title = 'Nenhuma missão por aqui',
  subtitle = 'Crie sua primeira missão para começar a acompanhar seus passos.',
  buttonLabel = 'Criar missão',
  onCreate,
}) {
  return (
    <View style={styles.container} accessible={false}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <PrimaryButton label={buttonLabel} onPress={onCreate} showIcon={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.detailTitle,
    color: colors.textPrimaryStrong,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.textSecondaryAlt,
    textAlign: 'center',
  },
});
