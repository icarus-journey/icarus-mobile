import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function ReadonlyField({ label, value }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={styles.field}
        accessible
        accessibilityRole="text"
        accessibilityLabel={`${label}: ${value}`}
      >
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textPrimary,
  },
  field: {
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  value: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
});
