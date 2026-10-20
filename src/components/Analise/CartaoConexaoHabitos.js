import { Text, View } from 'react-native';
import { estilosAnalise as estilos } from './estilosAnalise';
import { numeroPublico } from './formatarReferencia';

export function CartaoConexaoHabitos({ valores }) {
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.rotulo}>Associação observada</Text>
      <Text style={estilos.texto}>No grupo com atividade física suficiente no lazer</Text>
      <Text style={estilos.valor}>{numeroPublico(valores.grupoExpostoPercentual)}%</Text>
      <Text style={estilos.texto}>
        No grupo que não atende ao indicador de atividade física no lazer
      </Text>
      <Text style={estilos.valor}>{numeroPublico(valores.grupoNaoExpostoPercentual)}%</Text>
      <Text style={estilos.texto}>
        Prevalências no mesmo recorte. A associação não demonstra que o exercício causou a diferença
        nem prevê conquistas pessoais.
      </Text>
    </View>
  );
}
