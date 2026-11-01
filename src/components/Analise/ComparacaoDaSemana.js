import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ResumoAdesao } from './ResumoAdesao';
import { IconeAnalise } from './IconeAnalise';
import { estilosPainel as painel } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

function LinhaDaSemana({ rotulo, semana }) {
  const disponivel = semana?.taxaConclusao != null;
  const valor = disponivel
    ? `${numeroPublico(semana.concluidas)} de ${numeroPublico(semana.previstas)} feitas`
    : semana?.estado === 'sem_planejamento'
      ? 'Sem planejamento'
      : 'Registros incompletos';
  return (
    <View
      accessible
      accessibilityLabel={`${rotulo}. ${valor}${disponivel ? `, ${numeroPublico(semana.taxaConclusao)}%.` : '.'}`}
      style={locais.linha}
    >
      <View style={painel.textoFlexivel}>
        <Text style={painel.marca}>{rotulo}</Text>
        <Text style={painel.pequeno}>{valor}</Text>
      </View>
      {disponivel ? <Text style={painel.marca}>{numeroPublico(semana.taxaConclusao)}%</Text> : null}
    </View>
  );
}

export function ComparacaoDaSemana({ comparacao, mostrarPlanejamento = true, estiloCartao }) {
  const [expandido, setExpandido] = useState(false);
  if (!comparacao) return null;
  const semana = comparacao.semana;
  const podeComparar =
    comparacao.podeCompararSemanaAnterior || comparacao.podeCompararMediaQuatroSemanas;
  return (
    <View style={painel.secao}>
      {mostrarPlanejamento ? (
        semana.estado === 'disponivel' ? (
          <ResumoAdesao
            adesao={{
              estado: semana.estado,
              previstasRegistradas: semana.previstas,
              concluidasDoPlanejamento: semana.concluidas,
              taxaConclusao: semana.taxaConclusao,
            }}
          />
        ) : (
          <View style={[painel.cartao, estiloCartao]}>
            <Text style={painel.rotulo}>Seu planejamento</Text>
            <Text style={painel.texto}>
              {semana.estado === 'sem_planejamento'
                ? 'Sem missões planejadas nesta semana.'
                : 'O planejamento desta semana tem registros incompletos.'}
            </Text>
          </View>
        )
      ) : null}
      {podeComparar ? (
        <View style={[painel.cartao, estiloCartao]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Comparar semanas"
            accessibilityState={{ expanded: expandido }}
            onPress={() => setExpandido(!expandido)}
            style={locais.controle}
          >
            <Text style={[painel.marca, painel.textoFlexivel]}>Comparar semanas</Text>
            <IconeAnalise nome="chevron" tamanho={18} />
          </Pressable>
          {expandido ? (
            <>
              <LinhaDaSemana rotulo="Semana do relatório" semana={semana} />
              <LinhaDaSemana rotulo="Semana anterior" semana={comparacao.semanasAnteriores[0]} />
              <LinhaDaSemana
                rotulo="Média das 4 anteriores"
                semana={comparacao.mediaQuatroSemanas}
              />
              <Text style={painel.pequeno}>
                Feitas do planejamento até o fim de cada semana. A média considera as quatro semanas
                completas.
              </Text>
              {!comparacao.podeCompararMediaQuatroSemanas ? (
                <Text style={painel.pequeno}>
                  Ainda falta histórico para a média das quatro semanas.
                </Text>
              ) : null}
            </>
          ) : null}
        </View>
      ) : (
        <Text style={painel.pequeno}>Ainda falta histórico para comparar as semanas.</Text>
      )}
    </View>
  );
}

const locais = StyleSheet.create({
  controle: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
});
