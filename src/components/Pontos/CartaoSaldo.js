import { Pressable, StyleSheet, Text, View } from 'react-native';
import SetaExtrato from '../../assets/icons/seta-extrato.svg';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { ValorComMoeda } from './ValorComMoeda';

export function CartaoSaldo({ saldo, carregando = false, aoVerExtrato }) {
  return (
    <View style={[e.cartao, aoVerExtrato && e.cartaoComAcesso]}>
      <Text style={e.rotulo}>Saldo disponível agora</Text>
      <View style={e.linha}>
        <ValorComMoeda
          valor={saldo}
          tamanho="grande"
          rotulo={carregando ? 'Consultando saldo' : 'Saldo disponível agora'}
          style={e.valor}
        />
        {aoVerExtrato ? (
          <Pressable
            onPress={aoVerExtrato}
            accessibilityRole="button"
            accessibilityLabel="Ver extrato"
            accessibilityHint="Abre o histórico de movimentos do seu saldo"
            style={({ pressed }) => [e.acesso, pressed && e.pressionado]}
          >
            <Text style={e.textoAcesso}>Ver extrato</Text>
            <SetaExtrato width={20} height={20} accessible={false} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
const e = StyleSheet.create({
  cartao: { padding: 16, borderRadius: 16, gap: 8, backgroundColor: colors.lojaSuave },
  cartaoComAcesso: { gap: 4 },
  rotulo: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.lojaTexto },
  linha: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: 8 },
  valor: { maxWidth: '100%' },
  acesso: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 104,
    minHeight: 44,
    marginLeft: 'auto',
  },
  textoAcesso: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    lineHeight: 20,
    color: colors.lojaTexto,
  },
  pressionado: { opacity: 0.85 },
});
