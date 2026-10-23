import { Pressable, Text, View } from 'react-native';

import { estilosPainel as estilos } from './estilosPainel';

export function AbasDeProgresso({ aba, onChange }) {
  return (
    <View style={estilos.controle} accessibilityRole="tablist">
      {[
        ['pessoal', 'Minha jornada'],
        ['publico', 'Pesquisas'],
      ].map(([id, titulo]) => (
        <Pressable
          key={id}
          accessibilityRole="tab"
          accessibilityLabel={titulo}
          accessibilityState={{ selected: aba === id }}
          onPress={() => onChange(id)}
          style={[estilos.opcao, aba === id && estilos.opcaoAtiva]}
        >
          <Text style={[estilos.opcaoTexto, aba === id && estilos.opcaoTextoAtivo]}>{titulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}
