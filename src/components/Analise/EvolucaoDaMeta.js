import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { formatarValorProgresso as numero } from '../../utils/valorProgresso';
import { SecondaryButton } from '../Button';
import { estilosPainel as estilos } from './estilosPainel';

const explicacoes = {
  historico_insuficiente:
    'Registre seu total uma vez por semana. O cálculo precisa de cinco registros, separados por sete dias.',
  datas_duplicadas:
    'Há mais de um registro no mesmo dia. O cálculo usa cinco registros semanais, separados por sete dias, sem descartar revisões.',
  janela_semanal_incompleta:
    'Os cinco registros mais recentes precisam estar separados por sete dias para comparar quatro semanas.',
  medicoes_nao_comparaveis:
    'Uma revisão do valor interrompe a comparação. Novos registros semanais formam uma nova base.',
  ritmo_sem_estabilidade_para_projecao:
    'Seu avanço variou ou ficou parado. Ainda não há um ritmo estável para estimar quanto tempo falta.',
  historico_desatualizado_ou_futuro:
    'O último registro precisa ser dos últimos sete dias. Atualize seu progresso para retomar a comparação.',
  meta_alterada:
    'A quantidade ou a unidade da meta mudou. Registre o progresso para começar a acompanhar essa nova meta.',
  aguardando_novo_registro:
    'O valor da meta mudou fora do histórico. Faça um novo registro antes de comparar seu avanço.',
  fuso_nao_comparavel:
    'Os registros precisam usar o mesmo horário local para comparar as semanas. Novos registros formam uma nova base.',
  campanha_encerrada: 'O histórico continua disponível. Esta campanha já foi encerrada.',
  meta_alcancada:
    'O valor registrado já alcançou a meta. A conclusão da campanha continua sendo uma escolha sua.',
};

function dataCurta(data) {
  return `${data.slice(8, 10)}/${data.slice(5, 7)}`;
}

export function EvolucaoDaMeta({ dados }) {
  const [detalhes, setDetalhes] = useState(false);
  const insets = useSafeAreaInsets();
  const evolucao = dados?.evolucao;
  const cenario = dados?.cenario;
  if (
    !evolucao ||
    evolucao.estado === 'unidade_sem_resultado_mensurado' ||
    evolucao.estado === 'meta_nao_definida'
  )
    return null;
  const pontos = evolucao.pontos ?? [];
  const recentes = pontos.slice(-6);
  const maximo = Math.max(1, ...recentes.map((ponto) => ponto.valor));
  const avanco = evolucao.avancoRegistrado;
  const semanas = cenario?.semanasAproximadas;
  const elegivel = cenario?.disponivel && Number.isInteger(semanas) && semanas > 0;
  return (
    <View style={locais.conteudo}>
      <View style={locais.resumo}>
        {avanco != null ? (
          <View style={locais.numero}>
            <Text style={estilos.pequeno}>Avanço registrado</Text>
            <Text style={locais.valor}>{`${avanco > 0 ? '+' : ''}${numero(avanco)}`}</Text>
            <Text style={estilos.pequeno}>{dados.unidade}</Text>
          </View>
        ) : null}
        <View style={locais.numero}>
          <Text style={estilos.pequeno}>
            {evolucao.faltante === 0 ? 'Meta alcançada' : 'Faltam'}
          </Text>
          <Text style={locais.valor}>{numero(evolucao.faltante)}</Text>
          <Text style={estilos.pequeno}>{dados.unidade}</Text>
        </View>
      </View>
      {recentes.length > 1 ? (
        <ScrollView
          horizontal
          contentContainerStyle={locais.grafico}
          accessibilityLabel="Evolução do resultado da meta"
        >
          {recentes.map((ponto) => (
            <View
              key={ponto.data}
              accessible
              accessibilityLabel={`${ponto.data}: ${numero(ponto.valor)} ${dados.unidade}${ponto.revisado ? ', valor revisado' : ''}`}
              style={locais.coluna}
            >
              <Text style={locais.rotulo}>{numero(ponto.valor)}</Text>
              <View style={locais.areaBarra}>
                <View style={[locais.barra, { height: (ponto.valor / maximo) * 52 }]} />
              </View>
              <Text style={locais.rotulo}>{dataCurta(ponto.data)}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
      {elegivel ? (
        <View style={locais.cenario}>
          <Text style={estilos.pequeno}>Se mantiver esse ritmo…</Text>
          <Text style={locais.destaque}>
            Cerca de {semanas} {semanas === 1 ? 'semana' : 'semanas'} para chegar lá
          </Text>
          <Text style={estilos.pequeno}>
            {numero(cenario.ritmoSemanal)} {dados.unidade} por semana
          </Text>
        </View>
      ) : evolucao.faltante !== 0 && dados.estado !== 'concluida' ? (
        <Text style={estilos.pequeno}>
          {avanco < 0
            ? 'Valor revisado. Vamos acompanhar os próximos passos.'
            : 'Seu ritmo aparece com os registros semanais.'}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Entender meu ritmo"
        onPress={() => setDetalhes(true)}
        style={locais.link}
      >
        <Text style={estilos.marca}>Entender meu ritmo</Text>
      </Pressable>
      <Modal
        visible={detalhes}
        transparent
        animationType="slide"
        onRequestClose={() => setDetalhes(false)}
      >
        <View style={locais.fundo}>
          <Pressable
            style={locais.fecharFundo}
            accessibilityLabel="Fechar detalhes do ritmo"
            onPress={() => setDetalhes(false)}
          />
          <View
            accessibilityViewIsModal
            style={[locais.folha, { paddingBottom: insets.bottom + 20 }]}
          >
            <ScrollView contentContainerStyle={estilos.secao}>
              <Text style={estilos.titulo} accessibilityRole="header">
                Seu ritmo, sem promessas
              </Text>
              <Text style={estilos.texto}>
                {elegivel
                  ? 'Usamos a média do avanço entre seus cinco registros semanais mais recentes. O tempo pode mudar se seu ritmo mudar; não é uma data garantida.'
                  : (explicacoes[cenario?.motivo] ??
                    'Ainda não há uma base comparável para estimar o tempo. Seus registros continuam disponíveis.')}
              </Text>
              <Text style={estilos.texto}>
                O gráfico mostra o último total registrado em cada dia, na mesma quantidade e
                unidade da meta atual. Revisar o valor para baixo também faz parte do histórico.
              </Text>
              <Text style={estilos.pequeno}>
                Este histórico acompanha a meta atual, independentemente do período de missões
                selecionado.
              </Text>
              {evolucao.fusoHorario ? (
                <Text style={estilos.pequeno}>Horário dos registros: {evolucao.fusoHorario}</Text>
              ) : null}
              {pontos.map((ponto) => (
                <Text key={ponto.data} style={estilos.texto}>
                  {ponto.data.split('-').reverse().join('/')}: {numero(ponto.valor)} {dados.unidade}
                  {ponto.revisado ? ' · valor revisado' : ''}
                </Text>
              ))}
              <SecondaryButton label="Entendi meu ritmo" onPress={() => setDetalhes(false)} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const locais = StyleSheet.create({
  conteudo: { gap: 12 },
  resumo: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  numero: { flex: 1, minWidth: 110, gap: 4 },
  valor: { fontFamily: fontFamily.bold, fontSize: 28, color: colors.brandDark },
  grafico: { flexGrow: 1, gap: 10, justifyContent: 'space-between' },
  coluna: { flex: 1, minWidth: 44, alignItems: 'center', gap: 5 },
  rotulo: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  areaBarra: {
    height: 52,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  barra: {
    width: 20,
    backgroundColor: colors.brand,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  cenario: { padding: 16, gap: 6, borderRadius: 16, backgroundColor: colors.softPurple },
  destaque: { fontFamily: fontFamily.semiBold, fontSize: 18, color: colors.brandDark },
  link: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(29,21,48,0.4)' },
  fecharFundo: { flex: 1 },
  folha: {
    maxHeight: '85%',
    padding: 24,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surface,
  },
});
