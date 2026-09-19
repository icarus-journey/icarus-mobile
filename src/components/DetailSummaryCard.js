import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { StatusChip } from './StatusChip';

export function DetailSummaryCard({ accentColor, title, description, chips }) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <View style={styles.chipsRow}>
        {chips.map((chip) => (
          <StatusChip
            key={chip.label}
            label={chip.label}
            backgroundColor={chip.backgroundColor}
            textColor={chip.textColor}
          />
        ))}
      </View>
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
  accent: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.summaryTitle,
    color: colors.textPrimaryStrong,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    color: colors.textSecondaryAlt,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
});
