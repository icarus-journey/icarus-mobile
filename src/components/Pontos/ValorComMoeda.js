import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

const moeda = require('../../assets/jornada/moeda-com-asa.png');
const TAMANHOS = { pequeno: [16, 14, 20, 4], medio: [20, 20, 28, 8], grande: [36, 32, 40, 12] };
export function ValorComMoeda({
  valor,
  acessivel = true,
  comSinal = false,
  tamanho = 'pequeno',
  tamanhoMoeda,
  cor = colors.textPrimary,
  rotulo,
  style,
}) {
  const [diametro, fonte, altura, espaco] = TAMANHOS[tamanho];
  const conhecido = Number.isSafeInteger(valor);
  const sinal = conhecido && valor < 0 ? '−' : conhecido && comSinal && valor > 0 ? '+' : '';
  const numero = conhecido ? Math.abs(valor).toLocaleString('pt-BR') : '—';
  return (
    <View
      accessible={acessivel}
      accessibilityLabel={`${rotulo ? `${rotulo}: ` : ''}${conhecido ? `${sinal === '−' ? 'menos ' : sinal === '+' ? 'mais ' : ''}${numero} pontos` : 'Indisponível'}`}
      style={[e.linha, { gap: espaco }, style]}
    >
      {sinal ? (
        <Text
          style={[
            e.numero,
            {
              color: cor,
              fontSize: fonte,
              lineHeight: altura,
              fontFamily: tamanho === 'grande' ? fontFamily.bold : fontFamily.semiBold,
            },
          ]}
        >
          {sinal}
        </Text>
      ) : null}
      <Image
        source={moeda}
        accessible={false}
        style={{
          width: tamanhoMoeda ?? diametro,
          height: tamanhoMoeda ?? diametro,
          resizeMode: 'contain',
        }}
      />
      <Text
        style={[
          e.numero,
          {
            color: cor,
            fontSize: fonte,
            lineHeight: altura,
            fontFamily: tamanho === 'grande' ? fontFamily.bold : fontFamily.semiBold,
          },
        ]}
      >
        {numero}
      </Text>
    </View>
  );
}
const e = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  numero: { fontFamily: fontFamily.semiBold, fontVariant: ['tabular-nums'], flexShrink: 1 },
});
