import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { rotuloDoPonto, intervaloDoPonto } from '../../utils/formatarProgresso';

export function GraficoConclusoes({ evolucao }) {
  const { fontScale, width } = useWindowDimensions();
  if (!evolucao?.pontos?.length) return null;
  const maximo = Math.max(1, ...evolucao.pontos.map((ponto) => ponto.concluidas));
  return (
    <View style={estilos.conteudo}>
      <Text style={estilos.titulo} accessibilityRole="header">
        {{ dia: 'Dia a dia', semana: 'Ao longo do mês', mes: 'Mês a mês' }[evolucao.granularidade]}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={width < 360 || fontScale > 1.3}
        contentContainerStyle={estilos.grafico}
        accessibilityLabel="Gráfico de missões feitas"
      >
        {evolucao.pontos.map((ponto) => (
          <View
            key={ponto.inicio}
            accessible
            accessibilityLabel={`${intervaloDoPonto(ponto)}: ${ponto.concluidas} ${ponto.concluidas === 1 ? 'missão feita' : 'missões feitas'}`}
            style={[estilos.coluna, { minWidth: fontScale > 1.3 ? 54 : 28 }]}
          >
            <Text style={estilos.quantidade}>{ponto.concluidas}</Text>
            <View style={estilos.areaBarra}>
              <View style={[estilos.barra, { height: (ponto.concluidas / maximo) * 56 }]} />
            </View>
            <Text style={estilos.rotulo}>{rotuloDoPonto(ponto, evolucao.granularidade)}</Text>
          </View>
        ))}
      </ScrollView>
      {width < 360 || fontScale > 1.3 ? (
        <Text style={estilos.titulo}>Deslize para ver o gráfico completo.</Text>
      ) : null}
      {evolucao.granularidade === 'semana' ? (
        <Text style={estilos.titulo}>Cada barra reúne até 7 dias.</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  conteudo: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  titulo: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.white },
  grafico: { flexGrow: 1, gap: 10, justifyContent: 'space-between' },
  coluna: { flex: 1, alignItems: 'center', gap: 6 },
  quantidade: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.white },
  areaBarra: {
    height: 56,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
  },
  barra: {
    width: 18,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: colors.white,
  },
  rotulo: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.white },
});
