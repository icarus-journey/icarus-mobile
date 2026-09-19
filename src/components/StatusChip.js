import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, fontSize } from '../theme/typography';

export function StatusChip({ label, backgroundColor, textColor }) {
  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
  },
});
