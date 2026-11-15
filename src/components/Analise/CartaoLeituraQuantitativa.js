import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { AcessoPesquisa } from './AcessoPesquisa';
import { BarraReferencia } from './BarraReferencia';
import { estilosPainel as estilos } from './estilosPainel';

export function CartaoLeituraQuantitativa({ leitura, aoAbrir }) {
  return (
    <View style={[estilos.cartao, locais.cartao]}>
      <Text style={estilos.titulo} accessibilityRole="header" accessibilityLiveRegion="polite">
        {leitura.titulo}
      </Text>
      <Text style={estilos.texto}>{leitura.medida}</Text>
      {leitura.grupos.map((grupo) => (
        <BarraReferencia
          key={grupo.rotulo}
          rotulo={grupo.rotulo}
          percentual={grupo.percentual}
          cor={colors.brand}
        />
      ))}
      <View style={estilos.entre} accessible={false}>
        <Text style={estilos.pequeno}>0%</Text>
        <Text style={estilos.pequeno}>100%</Text>
      </View>
      <Text style={[estilos.marca, locais.leitura]}>{leitura.leitura}</Text>
      <AcessoPesquisa rotulo="Ver dados e relação" aoAbrir={aoAbrir} />
    </View>
  );
}

const locais = StyleSheet.create({
  cartao: { borderColor: colors.borderDefault },
  leitura: { lineHeight: 20 },
});
