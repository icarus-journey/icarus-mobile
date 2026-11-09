import { Text, View, Pressable } from 'react-native';
import { estilosPainel as estilos } from './estilosPainel';
import { colors } from '../../theme/colors';
import { numeroPublico } from './formatarReferencia';

export function PlanejamentoProgresso({ dados, aoComparar }) {
  const adesao = dados?.adesao;
  if (!adesao) return null;
  const disponivel = adesao.estado === 'disponivel';
  const diferenca = dados.diferencaFeitasSemanaAnterior;
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.rotulo}>Seu planejamento</Text>
      {disponivel ? (
        <>
          <Text style={estilos.titulo}>
            {adesao.concluidasDoPlanejamento} de {adesao.previstasRegistradas} missões feitas
          </Text>
          {diferenca != null ? (
            <Text style={estilos.texto}>
              {diferenca === 0
                ? 'A mesma quantidade de missões feitas que na semana anterior.'
                : `${Math.abs(diferenca)} ${Math.abs(diferenca) === 1 ? 'missão feita' : 'missões feitas'} a ${diferenca > 0 ? 'mais' : 'menos'} que na semana anterior.`}
            </Text>
          ) : null}
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Planejamento realizado"
            accessibilityValue={{ min: 0, max: 100, now: adesao.taxaConclusao }}
            style={{
              height: 8,
              borderRadius: 8,
              backgroundColor: colors.softPurple,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${adesao.taxaConclusao}%`,
                backgroundColor: colors.brand,
                borderRadius: 8,
              }}
            />
          </View>
          <Text style={estilos.pequeno}>
            {numeroPublico(adesao.taxaConclusao)}% do que você planejou
          </Text>
        </>
      ) : (
        <Text style={estilos.texto}>
          {adesao.estado === 'sem_planejamento'
            ? 'Sem missões planejadas neste período.'
            : 'O planejamento deste período tem registros incompletos. A proporção não pode ser calculada.'}
        </Text>
      )}
      {dados.comparacaoSemanal ? (
        <Pressable accessibilityRole="button" onPress={aoComparar} style={estilos.botaoTexto}>
          <Text style={estilos.marca}>Comparar semanas →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
