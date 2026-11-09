import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ValorComMoeda } from '../../components/Pontos/ValorComMoeda';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { horarioMovimento, TIPOS_MOVIMENTO, tituloMovimento } from './apresentacaoExtrato';

export function CartaoMovimento({ movimento: m, fuso, aoAbrir }) {
  const { width, fontScale } = useWindowDimensions();
  const empilhar = width < 350 || fontScale > 1.3;
  const sinal = m.quantidade < 0 ? '−' : m.quantidade > 0 ? '+' : '·';
  const titulo = tituloMovimento(m);
  return (
    <Pressable
      onPress={aoAbrir}
      accessibilityRole="button"
      accessibilityLabel={`Ver movimento: ${titulo}. ${TIPOS_MOVIMENTO[m.tipo]}. ${m.quantidade < 0 ? 'Menos' : m.quantidade > 0 ? 'Mais' : ''} ${Math.abs(m.quantidade)} pontos. ${m.saldoApos == null ? 'Saldo após indisponível.' : `Saldo após ${m.saldoApos}.`}`}
      style={({ pressed }) => [e.cartao, pressed && e.pressionado]}
    >
      <View style={e.sinal}>
        <Text style={e.simbolo}>{sinal}</Text>
      </View>
      <View style={e.corpo}>
        <View style={e.origem}>
          <Text style={e.titulo}>{titulo}</Text>
          <Text style={e.descricao}>
            {TIPOS_MOVIMENTO[m.tipo]} · {horarioMovimento(m.registradoEm, fuso)}
          </Text>
        </View>
        <View style={[e.valores, empilhar && e.valoresEmLinha]}>
          <ValorComMoeda
            acessivel={false}
            valor={m.quantidade}
            comSinal
            cor={m.quantidade > 0 ? colors.brand : colors.textPrimary}
          />
          <Text style={e.descricao}>
            Saldo {m.saldoApos == null ? '—' : m.saldoApos.toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
const e = StyleSheet.create({
  cartao: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    alignItems: 'center',
  },
  pressionado: { opacity: 0.8 },
  sinal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simbolo: { fontFamily: fontFamily.semiBold, fontSize: 20, color: colors.brand },
  corpo: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  origem: { flex: 1, minWidth: 110, gap: 4 },
  titulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  descricao: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  valores: { minWidth: 88, maxWidth: '100%', alignItems: 'flex-end', gap: 4 },
  valoresEmLinha: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});
