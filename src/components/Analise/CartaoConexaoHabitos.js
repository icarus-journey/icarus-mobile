import { Text, View } from 'react-native';

import { BarraReferencia } from './BarraReferencia';
import { estilosPainel as estilos } from './estilosPainel';

export function CartaoConexaoHabitos({ valores, compacto = false }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.rotulo}>Relação encontrada na pesquisa</Text>
      <BarraReferencia
        rotulo="Com atividade física suficiente no lazer"
        percentual={valores.grupoExpostoPercentual}
      />
      <BarraReferencia
        rotulo="Sem atividade física suficiente no lazer"
        percentual={valores.grupoNaoExpostoPercentual}
      />
      <Text style={estilos.pequeno}>
        {compacto
          ? 'A pesquisa encontrou essa relação, mas não prova que um hábito causou o outro.'
          : 'Os dois grupos são da mesma pesquisa e faixa de idade. A diferença não prova que o exercício causou o resultado e não prevê o que vai acontecer com você.'}
      </Text>
    </View>
  );
}
