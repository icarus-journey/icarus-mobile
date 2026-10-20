import { Text, View } from 'react-native';
import { estilosAnalise as estilos } from './estilosAnalise';
import { numeroPublico } from './formatarReferencia';

export function ResumoEvolucaoPessoal({ dados }) {
  const indicadores = dados.indicadores;
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Seus registros
      </Text>
      <Text style={estilos.texto}>{dados.mensagem}</Text>
      {indicadores ? (
        <>
          {[
            [
              'Conclusões registradas',
              indicadores.concluidas == null
                ? 'Sem registros'
                : numeroPublico(indicadores.concluidas),
            ],
            [
              'Previstas',
              indicadores.previstas == null ? 'Indisponível' : numeroPublico(indicadores.previstas),
            ],
            [
              'Taxa de conclusão',
              indicadores.taxaConclusao == null
                ? 'Indisponível'
                : `${numeroPublico(indicadores.taxaConclusao)}%`,
            ],
            [
              'Pontos recebidos',
              indicadores.pontosGanhos == null
                ? 'Sem registros'
                : numeroPublico(indicadores.pontosGanhos),
            ],
            [
              'Pontos utilizados',
              indicadores.pontosUtilizados == null
                ? 'Sem registros'
                : numeroPublico(indicadores.pontosUtilizados),
            ],
          ].map(([rotulo, valor]) => (
            <View key={rotulo} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
              <Text style={estilos.rotulo}>{rotulo}</Text>
              <Text style={estilos.texto}>{valor}</Text>
            </View>
          ))}
          {indicadores.concluidas != null ? (
            <Text style={estilos.texto}>
              Conclusões registradas em {indicadores.diasComConclusao} dias do período. Esses
              registros não medem sua rotina inteira.
            </Text>
          ) : null}
          <Text style={estilos.texto}>
            Histórico insuficiente para comparação de previstas, concluídas e taxa juntas.
          </Text>
          <Text style={estilos.texto}>
            Previstas e taxa dependem de um histórico completo de planejamento e ainda não estão
            disponíveis.
          </Text>
        </>
      ) : null}
    </View>
  );
}
