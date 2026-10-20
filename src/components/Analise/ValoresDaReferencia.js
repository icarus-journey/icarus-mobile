import { Text, View } from 'react-native';
import { CartaoConexaoHabitos } from './CartaoConexaoHabitos';
import { estilosAnalise as estilos } from './estilosAnalise';
import { numeroPublico, resumoDaReferencia } from './formatarReferencia';

export function ValoresDaReferencia({ dados }) {
  if (dados.medida === 'associacao') return <CartaoConexaoHabitos valores={dados.valores} />;
  return (
    <View style={estilos.grupo}>
      <Text style={estilos.valor}>{resumoDaReferencia(dados)}</Text>
      {dados.valores.p25 != null && dados.valores.p75 != null ? (
        <Text style={estilos.texto}>
          P25–P75: {numeroPublico(dados.valores.p25)}–{numeroPublico(dados.valores.p75)} min.
          Dispersão observada, sem faixa ideal.
        </Text>
      ) : null}
      {dados.medida === 'distribuicao_periodos'
        ? [
            ['madrugada', 'Madrugada'],
            ['manha', 'Manhã'],
            ['tarde', 'Tarde'],
            ['noite', 'Noite'],
          ].map(([chave, rotulo]) => (
            <Text key={chave} style={estilos.texto}>
              {rotulo}: {numeroPublico(dados.valores[chave])}% dos minutos da atividade
            </Text>
          ))
        : null}
    </View>
  );
}
