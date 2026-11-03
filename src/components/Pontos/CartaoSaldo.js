import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { ValorComMoeda } from './ValorComMoeda';

export function CartaoSaldo({ saldo, carregando = false }) {
  return (
    <View style={e.cartao}>
      <Text style={e.rotulo}>Saldo disponível agora</Text>
      <ValorComMoeda
        valor={saldo}
        tamanho="grande"
        rotulo={carregando ? 'Consultando saldo' : 'Saldo disponível agora'}
      />
    </View>
  );
}
const e = StyleSheet.create({
  cartao: { padding: 16, borderRadius: 16, gap: 8, backgroundColor: colors.lojaSuave },
  rotulo: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.lojaTexto },
});
