import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

export function CabecalhoSecaoMissoes({ titulo, tipo, primeira }) {
  if (tipo === 'dia') {
    return (
      <Text accessibilityRole="header" style={[e.dia, primeira && e.primeira]}>
        {titulo}
      </Text>
    );
  }

  return (
    <View style={[e.grupo, primeira && e.primeira]}>
      <Text accessibilityRole="header" style={e.titulo}>
        {titulo}
      </Text>
      <View accessible={false} style={e.divisoria} />
    </View>
  );
}

const e = StyleSheet.create({
  dia: {
    marginTop: 24,
    marginBottom: 8,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.diaMissao,
    lineHeight: 16,
    color: colors.textoDiaMissao,
  },
  grupo: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  primeira: { marginTop: 16 },
  titulo: {
    flexShrink: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.label,
    lineHeight: 20,
    color: colors.textoGrupoMissao,
    includeFontPadding: false,
  },
  divisoria: { flex: 1, height: 1, backgroundColor: colors.borderDefault },
});
