import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

export const estilosPainel = StyleSheet.create({
  secao: { gap: 16 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entre: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  cartao: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
  },
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
  pequeno: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  rotulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandDark,
    letterSpacing: 0.5,
  },
  marca: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.brand },
  textoFlexivel: { flex: 1, flexShrink: 1 },
  botaoTexto: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  icone: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.softPurple,
  },
  controle: {
    padding: 4,
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: colors.softPurple,
    gap: 4,
  },
  opcao: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  opcaoAtiva: { backgroundColor: colors.brand },
  opcaoTexto: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.brandDark,
    textAlign: 'center',
  },
  opcaoTextoAtivo: { color: colors.white },
  divisor: { height: 1, backgroundColor: colors.borderDefaultAlt },
  erro: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.dangerText,
    lineHeight: 21,
  },
});
