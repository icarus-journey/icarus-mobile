import { Image, StyleSheet, View } from 'react-native';

const protecao = require('../assets/loja/protecao-sequencia.png');
const recompensa = require('../assets/loja/vale-recompensa.png');

export function IlustracaoRecompensa({ deveMostrarProtecao = false, tamanho = 56 }) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.quadro, { width: tamanho, height: tamanho }]}
    >
      <Image
        source={deveMostrarProtecao ? protecao : recompensa}
        accessible={false}
        style={[
          styles.imagem,
          { width: tamanho, height: tamanho },
          deveMostrarProtecao && styles.protecao,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  quadro: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: { resizeMode: 'contain' },
  protecao: { transform: [{ scale: 1.2 }] },
});
