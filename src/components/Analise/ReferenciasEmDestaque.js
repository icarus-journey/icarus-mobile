import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { CartaoReferenciaPublica } from './CartaoReferenciaPublica';
import { IconeAnalise } from './IconeAnalise';
import { estilosPainel as estilos } from './estilosPainel';

export function ReferenciasEmDestaque({ referencias, onEntender }) {
  const [indice, setIndice] = useState(0);
  const referencia = referencias[indice];
  if (!referencia) return null;
  return (
    <View style={estilos.secao}>
      {referencias.length > 1 ? (
        <View style={estilos.entre}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Referência anterior"
            disabled={indice === 0}
            accessibilityState={{ disabled: indice === 0 }}
            onPress={() => setIndice(indice - 1)}
            style={[locais.seta, indice === 0 && locais.desabilitado]}
          >
            <IconeAnalise nome="voltar" />
          </Pressable>
          <View style={locais.indicador}>
            <Text style={estilos.pequeno} accessibilityLiveRegion="polite">
              {indice + 1} de {referencias.length} referências
            </Text>
            <View style={locais.pontos} accessible={false}>
              {referencias.map((item, posicao) => (
                <View
                  key={item.dados.id}
                  style={[locais.ponto, posicao === indice && locais.pontoAtivo]}
                />
              ))}
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próxima referência"
            disabled={indice === referencias.length - 1}
            accessibilityState={{ disabled: indice === referencias.length - 1 }}
            onPress={() => setIndice(indice + 1)}
            style={[locais.seta, indice === referencias.length - 1 && locais.desabilitado]}
          >
            <IconeAnalise nome="proximo" />
          </Pressable>
        </View>
      ) : null}
      <CartaoReferenciaPublica referencia={referencia} onEntender={() => onEntender(referencia)} />
    </View>
  );
}

const locais = StyleSheet.create({
  seta: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.softPurple,
  },
  desabilitado: { opacity: 0.4 },
  indicador: { alignItems: 'center', gap: 8, flexShrink: 1 },
  pontos: { flexDirection: 'row', gap: 6 },
  ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  pontoAtivo: { width: 18, backgroundColor: colors.brand },
});
