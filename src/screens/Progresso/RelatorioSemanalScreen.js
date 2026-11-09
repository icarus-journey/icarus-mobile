import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/Button';
import { GraficoSemanas } from '../../components/Analise/GraficoSemanas';
import { PlanejamentoProgresso } from '../../components/Analise/PlanejamentoProgresso';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { useProgresso } from '../../hooks/useProgresso';
import { useRelatorioSemanal } from '../../hooks/useRelatorioSemanal';
import { periodoCurto } from '../../utils/formatarProgresso';
import { estilosProgresso } from './estilosProgresso';
import { colors } from '../../theme/colors';

// A síntese salva só interpreta o mesmo snapshot; alterações recentes não trocam o texto do histórico.
export function mesmaBaseSemanal(atual, salva) {
  if (!atual || !salva) return false;
  const base = (c) =>
    [c.semana, ...c.semanasAnteriores].map((s) => [
      s.periodo.inicio,
      s.periodo.fim,
      s.periodo.fusoHorario,
      s.estado,
      s.previstas,
      s.concluidas,
      s.taxaConclusao,
    ]);
  return JSON.stringify(base(atual)) === JSON.stringify(base(salva));
}
export function RelatorioSemanalScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const progresso = useProgresso('semanaAnterior');
  const leitura = useRelatorioSemanal();
  const comparacao = progresso.dados?.comparacaoSemanal;
  const relatorio = leitura.dados?.relatorio;
  const texto =
    relatorio?.versaoIndicadores === '1.2.0' &&
    mesmaBaseSemanal(comparacao, relatorio.comparacaoSemanal)
      ? relatorio.texto
      : null;
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Comparar semanas" onBack={() => navigation.goBack()} />
        <Text style={estilos.pequeno}>{periodoCurto(progresso.dados?.periodo)}</Text>
        <Text style={estilos.texto}>Feitas do planejamento até o fechamento de cada semana.</Text>
        {progresso.carregando && !progresso.dados ? (
          <ActivityIndicator color={colors.brand} />
        ) : null}
        {progresso.erro ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {progresso.erro}
          </Text>
        ) : null}
        {progresso.dados ? (
          <PlanejamentoProgresso dados={{ ...progresso.dados, comparacaoSemanal: null }} />
        ) : null}
        <GraficoSemanas comparacao={comparacao} />
        {texto ? (
          <View style={estilos.cartao}>
            <Text style={estilos.rotulo}>O que esse histórico mostra</Text>
            <Text style={estilos.titulo}>{texto.titulo}</Text>
            <Text style={estilos.texto}>{texto.resumo}</Text>
            {texto.proximoAjuste ? <Text style={estilos.texto}>{texto.proximoAjuste}</Text> : null}
            <Text style={estilos.pequeno}>Leitura sugerida por IA · baseada nos registros</Text>
          </View>
        ) : leitura.dados?.estado === 'processando' ? (
          <Text style={estilos.pequeno}>Preparando uma leitura dos seus registros…</Text>
        ) : null}
        {leitura.erro ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {leitura.erro}
          </Text>
        ) : null}
        {leitura.dados?.podeTentarNovamente ? (
          <PrimaryButton
            label="Tentar gerar a leitura"
            onPress={leitura.tentarNovamente}
            disabled={leitura.carregando}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
