import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

export function BarraReferencia({ rotulo, percentual }) {
  const valido = percentual != null && Number.isFinite(Number(percentual));
  const valor = valido ? `${numeroPublico(percentual)}%` : 'Sem valor publicado';
  return (
    <View
      style={locais.grupo}
      accessible
      accessibilityLabel={`${rotulo ? `${rotulo}: ` : ''}${valor}`}
    >
      {rotulo ? (
        <View style={estilos.entre}>
          <Text style={[estilos.pequeno, estilos.textoFlexivel]}>{rotulo}</Text>
          <Text style={estilos.marca}>{valor}</Text>
        </View>
      ) : null}
      <View style={locais.trilho}>
        {valido ? (
          <View
            style={[locais.barra, { width: `${Math.max(0, Math.min(100, Number(percentual)))}%` }]}
          />
        ) : null}
      </View>
    </View>
  );
}

const locais = StyleSheet.create({
  grupo: { gap: 8 },
  trilho: { height: 9, backgroundColor: colors.progressTrack, borderRadius: 5, overflow: 'hidden' },
  barra: { height: '100%', backgroundColor: colors.brandAccent, borderRadius: 5 },
});
