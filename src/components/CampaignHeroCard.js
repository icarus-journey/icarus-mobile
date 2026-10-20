import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function CampaignHeroCard({ campaign, onPress }) {
  const concluida = campaign.estado === 'concluida';
  const subtitle = campaign.progresso
    ? `${campaign.progresso.concluidas} de ${campaign.progresso.total} missões • ${campaign.pontosAtuais}/${campaign.pontos} XP`
    : 'Sua campanha está começando agora.';
  const recompensaLabel = campaign.recompensaCurta
    ? `Recompensa final: ${campaign.recompensaCurta}`
    : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${campaign.titulo}, ${subtitle}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {concluida ? <View style={styles.accent} /> : null}
      <Text style={styles.title}>{campaign.titulo}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {recompensaLabel ? <Text style={styles.reward}>{recompensaLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 111,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.onboardingOptionSelectedBorder,
    padding: 16,
    gap: 8,
    backgroundColor: colors.onboardingOptionSelectedBg,
  },
  cardPressed: {
    opacity: 0.9,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.textSecondary,
  },
  reward: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.brand,
  },
  accent: {
    position: 'absolute',
    left: 6,
    top: 16,
    bottom: 16,
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
});
