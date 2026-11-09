import { Pressable, Text, View } from 'react-native';
import { estilos as e } from './styles';
import { ROTULOS_ESTADO, ICONES_ESTADO } from './apresentacaoHistorico';
import { ValorComMoeda } from '../../components/Pontos/ValorComMoeda';
import { colors } from '../../theme/colors';
export function CartaoRegistroHistorico({ registro: r, aoAbrir }) {
  const campanha = r.campanha
    ? `${r.campanha.titulo}${r.campanha.removida ? ' · Removida' : ''}`
    : 'Missão avulsa';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver registro: ${r.titulo}, ${ROTULOS_ESTADO[r.estado]}`}
      onPress={aoAbrir}
      style={e.cartao}
    >
      <View style={e.icone} importantForAccessibility="no">
        <Text style={[e.rotulo, e.marca]}>{ICONES_ESTADO[r.estado]}</Text>
      </View>
      <View style={e.dados}>
        <Text style={e.rotulo}>{r.titulo}</Text>
        <Text style={e.legenda}>{campanha}</Text>
        <View style={e.estadoPontos}>
          <Text style={[e.legenda, e.marca]}>{ROTULOS_ESTADO[r.estado]}</Text>
          {r.pontosRecebidos !== null ? (
            <ValorComMoeda
              valor={r.pontosRecebidos}
              comSinal
              tamanho="compacto"
              cor={colors.textSecondary}
              acessivel={false}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
