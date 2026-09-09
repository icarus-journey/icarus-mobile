import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function DetailInfoCard({ rows }) {
  const visibleRows = rows.filter((row) => Boolean(row.value));

  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      {visibleRows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
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
    gap: 12,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondaryAlt,
  },
  value: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.textPrimaryStrong,
  },
});
