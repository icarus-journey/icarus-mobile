import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { GraficoConclusoes } from './GraficoConclusoes';
import { IconeAnalise } from './IconeAnalise';
import { estilosPainel as painel } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

export function ResumoEvolucaoPessoal({ dados }) {
  const { width, fontScale } = useWindowDimensions();
  const [maisNumeros, setMaisNumeros] = useState(false);
  const indicadores = dados.indicadores;
  if (!indicadores || indicadores.quantidadeRegistros === 0)
    return (
      <View style={painel.cartao}>
        <View style={painel.icone}>
          <IconeAnalise nome="grafico" />
        </View>
        <Text style={painel.titulo}>Seu próximo passo aparece aqui</Text>
        <Text style={painel.texto}>{dados.mensagem}</Text>
      </View>
    );
  const metricas = [
    [
      'calendario',
      'Dias com missões feitas',
      indicadores.concluidas != null ? indicadores.diasComConclusao : null,
    ],
    ['pontos', 'Pontos ganhos', indicadores.pontosGanhos],
    ['presente', 'Recompensas resgatadas', indicadores.recompensasResgatadas],
    ['pontos', 'Pontos utilizados', indicadores.pontosUtilizados],
    ['confirmar', 'Taxa de conclusão', indicadores.taxaConclusao, '%'],
  ].filter(([, , valor]) => valor != null);
  return (
    <View style={painel.secao}>
      {indicadores.concluidas != null ? (
        <View style={estilos.principal}>
          <View style={estilos.resumo}>
            <View
              accessible
              accessibilityLabel={`${numeroPublico(indicadores.concluidas)} ${indicadores.concluidas === 1 ? 'missão feita' : 'missões feitas'}`}
            >
              <Text style={estilos.numero}>{numeroPublico(indicadores.concluidas)}</Text>
              <Text style={estilos.legenda}>
                {indicadores.concluidas === 1 ? 'missão feita' : 'missões feitas'}
              </Text>
            </View>
            {indicadores.diasComConclusao != null ? (
              <View style={estilos.dias}>
                <IconeAnalise nome="calendario" cor={colors.white} tamanho={15} />
                <Text style={estilos.diasTexto}>
                  Em {indicadores.diasComConclusao}{' '}
                  {indicadores.diasComConclusao === 1 ? 'dia' : 'dias'}
                </Text>
              </View>
            ) : null}
          </View>
          <GraficoConclusoes evolucao={dados.evolucao} />
        </View>
      ) : null}
      {metricas.length > 0 && indicadores.concluidas != null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver mais números"
          accessibilityState={{ expanded: maisNumeros }}
          onPress={() => setMaisNumeros(!maisNumeros)}
          style={painel.botaoTexto}
        >
          <Text style={painel.marca}>
            {maisNumeros ? 'Mostrar menos números' : 'Ver mais números'}
          </Text>
          <IconeAnalise nome="chevron" tamanho={18} />
        </Pressable>
      ) : null}
      {maisNumeros || indicadores.concluidas == null ? (
        <View style={estilos.grade}>
          {metricas.map(([icone, rotulo, valor, unidade]) => (
            <View
              key={rotulo}
              accessible
              accessibilityLabel={`${rotulo}: ${numeroPublico(valor)}${unidade ?? ''}`}
              style={[estilos.metrica, (width < 350 || fontScale > 1.4) && estilos.metricaInteira]}
            >
              <IconeAnalise nome={icone} tamanho={19} />
              <Text style={estilos.valor}>
                {numeroPublico(valor)}
                {unidade ?? ''}
              </Text>
              <Text style={painel.pequeno}>{rotulo}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  principal: { backgroundColor: colors.brand, borderRadius: 24, padding: 20, gap: 12 },
  numero: {
    fontFamily: fontFamily.bold,
    fontSize: 48,
    color: colors.white,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  legenda: { fontFamily: fontFamily.medium, fontSize: 15, color: colors.white },
  resumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dias: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  diasTexto: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.white },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metrica: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    padding: 16,
    gap: 8,
    borderRadius: 20,
  },
  metricaInteira: { flexBasis: '100%' },
  valor: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.textPrimaryStrong,
    fontVariant: ['tabular-nums'],
  },
});
