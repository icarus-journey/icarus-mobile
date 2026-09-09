import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function EpicHeroCard({ epic, onPress }) {
  const ano = epic.dataLimite?.split('/')?.[2];
  const quantidadeCampanhas = epic.campanhasAtribuidas?.length ?? 0;
  const subtitle = [ano ? `Meta para ${ano}` : null, `${quantidadeCampanhas} campanhas`]
    .filter(Boolean)
    .join(' • ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${epic.titulo}, ${subtitle}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Text style={styles.title}>{epic.titulo}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 96,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    backgroundColor: colors.brand,
  },
  cardPressed: {
    opacity: 0.9,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.summaryTitle,
    color: colors.white,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: '#f0e8ff',
  },
});
