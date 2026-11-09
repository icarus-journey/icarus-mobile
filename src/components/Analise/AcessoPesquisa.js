import { Pressable, StyleSheet, Text } from 'react-native';

import IconeSeta from '../../assets/icons/icone-seta-pesquisa.svg';
import { estilosPainel as estilos } from './estilosPainel';

export function AcessoPesquisa({ rotulo, aoAbrir, estilo, acessibilidade, valor }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={acessibilidade ?? rotulo}
      accessibilityValue={valor ? { text: valor } : undefined}
      onPress={aoAbrir}
      style={[estilos.entre, locais.acesso, estilo]}
    >
      <Text style={[estilos.marca, estilos.textoFlexivel]}>{rotulo}</Text>
      <IconeSeta />
    </Pressable>
  );
}

const locais = StyleSheet.create({ acesso: { minHeight: 44, paddingVertical: 8 } });
