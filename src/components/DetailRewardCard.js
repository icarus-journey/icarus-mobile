import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { ValorComMoeda } from './Pontos/ValorComMoeda';

export function DetailRewardCard({ label = 'Recompensa', valor }) {
  if (!Number.isSafeInteger(valor)) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{label}</Text>
      <ValorComMoeda valor={valor} rotulo={label} cor={colors.textSecondaryAlt} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 18,
    padding: 18,
    gap: 10,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.detailTitle,
    color: colors.textPrimaryStrong,
  },
});
