import { Text, View } from 'react-native';
import { estilosAnalise as estilos } from './estilosAnalise';

export function CartaoConquistaAVista({ situacao }) {
  if (situacao !== 'historico_mensurado_indisponivel') return null;
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Conquistas à vista
      </Text>
      <Text style={estilos.texto}>
        Ainda não há medições semanais comparáveis para construir um cenário de avanço. Concluir
        missões e ganhar pontos não informa, por si só, o resultado de um objetivo.
      </Text>
    </View>
  );
}
