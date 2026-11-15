import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

export const estilosAnalise = StyleSheet.create({
  cartao: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  destaque: { backgroundColor: colors.softPurple, borderColor: colors.softPurple },
  titulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimaryStrong,
  },
  texto: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  rotulo: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.brandDark },
  valor: { fontFamily: fontFamily.bold, fontSize: fontSize.screenTitle, color: colors.brand },
  aviso: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  erro: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.dangerText },
  grupo: { gap: 12 },
});
