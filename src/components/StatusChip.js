import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, fontSize } from '../theme/typography';
import { ValorComMoeda } from './Pontos/ValorComMoeda';

export function StatusChip({ label, backgroundColor, textColor, pontos }) {
  return (
    <View style={[styles.chip, { backgroundColor }]}>
      {pontos != null ? (
        <ValorComMoeda valor={pontos} comSinal tamanho="compacto" cor={textColor} rotulo={label} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
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
