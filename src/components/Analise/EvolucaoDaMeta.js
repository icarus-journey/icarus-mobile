import { Text, View } from 'react-native';
import { estilosPainel as estilos } from './estilosPainel';
import { GraficoEvolucaoMeta } from './GraficoEvolucaoMeta';
import { CenarioDaMeta } from './CenarioDaMeta';
import { numeroPublico as numero } from './formatarReferencia';

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

export function EvolucaoDaMeta({
  dados,
  periodoSelecionado = null,
  baseDoAvanco = null,
  evolucaoDoPeriodo = null,
}) {
  const evolucao = dados?.evolucao;
  if (
    !evolucao ||
    ['meta_nao_definida', 'unidade_sem_resultado_mensurado'].includes(evolucao.estado)
  )
    return null;
  const avanco = (evolucaoDoPeriodo ?? evolucao).avancoRegistrado;
  return (
    <View style={estilos.secao}>
      {avanco != null ? (
        <Text style={estilos.marca}>
          {avanco > 0 ? '+' : ''}
          {numero(avanco)} {dados.unidade}{' '}
          {periodoSelecionado
            ? baseDoAvanco === 'primeiro_registro_do_periodo'
              ? 'entre registros do período'
              : 'no período'
            : 'desde o primeiro registro da meta'}
        </Text>
      ) : null}
      <GraficoEvolucaoMeta
        pontos={evolucao.pontos ?? []}
        unidade={dados.unidade}
        alvo={dados.valorMensurado}
      />
      {dados.cenario?.disponivel ? (
        <CenarioDaMeta cenario={dados.cenario} unidade={dados.unidade} />
      ) : (
        <Text style={estilos.pequeno}>
          {explicacoes[dados.cenario?.motivo] ??
            'Ainda não há uma base comparável para estimar o tempo. Seus registros continuam disponíveis.'}
        </Text>
      )}
    </View>
  );
}
