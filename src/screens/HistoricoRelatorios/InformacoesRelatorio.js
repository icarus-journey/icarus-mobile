import { Text, View } from 'react-native';
import { SecondaryButton } from '../../components/Button';
import { nomeDoFuso, periodoCurto } from '../../utils/formatarProgresso';
import { dataDaGeracao, resumoDoRelatorio } from './apresentacaoRelatorios';
import { estilos as e } from './styles';
function Campo({ rotulo, valor }) {
  return (
    <View style={e.grupo}>
      <Text style={e.legenda}>{rotulo}</Text>
      <Text style={e.rotulo}>{valor}</Text>
    </View>
  );
}
export function InformacoesRelatorio({ dados, configuracao = false, aoVerIA, aoVoltar }) {
  const { resumo: s, relatorio: r } = dados;
  if (configuracao)
    return (
      <>
        <View style={e.cartao}>
          <Text style={e.titulo}>Inteligência artificial</Text>
          <Text style={e.texto}>
            A IA escreveu a reflexão usando os indicadores daquela semana.
          </Text>
          <Campo rotulo="Serviço" valor={r.geracao.provedor} />
          <Campo rotulo="Modelo registrado" valor={r.geracao.modelo} />
          <Campo rotulo="Versão dos indicadores" valor={r.versaoIndicadores} />
        </View>
        <Text style={e.legenda}>Esta identificação pertence à geração original.</Text>
        <SecondaryButton
          style={e.botao}
          estiloRotulo={e.rotuloBotao}
          label="Voltar às informações"
          onPress={aoVoltar}
        />
      </>
    );
  return (
    <>
      <Text style={e.titulo} accessibilityRole="header">
        Sobre esta reflexão
      </Text>
      <Text style={e.legenda}>Informações guardadas quando o relatório foi criado.</Text>
      <View style={e.cartao}>
        <Campo rotulo="Semana" valor={periodoCurto(s.periodo)} />
        <Campo
          rotulo="Horário considerado"
          valor={s.periodo.fusoHorario ? nomeDoFuso(s.periodo.fusoHorario) : 'Fuso não registrado.'}
        />
        <Campo rotulo="Salvo em" valor={dataDaGeracao(s)} />
      </View>
      <View style={e.cartao}>
        <Text style={e.rotulo}>Registros usados</Text>
        <Text style={e.texto}>{resumoDoRelatorio(s)}</Text>
        {!s.planejamento || s.planejamento.estado !== 'disponivel' ? (
          <Text style={e.legenda}>
            {s.planejamento?.estado === 'sem_planejamento'
              ? 'Sem missões planejadas nesta semana.'
              : 'O planejamento não foi guardado de forma completa nesta versão.'}
          </Text>
        ) : null}
        {s.planejamento?.estado === 'disponivel' && s.concluidas != null ? (
          <Text style={e.legenda}>
            Atividade registrada: {s.concluidas}{' '}
            {s.concluidas === 1 ? 'missão realizada' : 'missões realizadas'}
            {s.diasComConclusao == null
              ? '.'
              : ` em ${s.diasComConclusao} ${s.diasComConclusao === 1 ? 'dia' : 'dias'}.`}
          </Text>
        ) : null}
        {r.comparacaoSemanal ? (
          <Text style={e.legenda}>
            {r.comparacaoSemanal.podeCompararMediaQuatroSemanas
              ? 'Compara com a semana anterior e a média das 4 anteriores.'
              : r.comparacaoSemanal.podeCompararSemanaAnterior
                ? 'Comparação com a semana anterior disponível.'
                : 'Ainda faltava histórico para comparar as semanas.'}
          </Text>
        ) : null}
      </View>
      <View style={e.cartao}>
        <Text style={e.rotulo}>Pesquisas usadas</Text>
        <Text style={e.texto}>Não há pesquisas registradas neste relatório.</Text>
      </View>
      <SecondaryButton
        style={e.botao}
        estiloRotulo={e.rotuloBotao}
        label="Sobre a inteligência artificial"
        onPress={aoVerIA}
      />
      <SecondaryButton
        style={e.botao}
        estiloRotulo={e.rotuloBotao}
        label="Voltar ao relatório"
        onPress={aoVoltar}
      />
    </>
  );
}
