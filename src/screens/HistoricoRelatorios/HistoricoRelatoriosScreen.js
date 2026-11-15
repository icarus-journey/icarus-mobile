import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { SecondaryButton } from '../../components/Button';
import { useHistoricoRelatorios } from '../../hooks/useHistoricoRelatorios';
import { useSessao } from '../../state/SessaoContext';
import { colors } from '../../theme/colors';
import { CartaoRelatorio } from './CartaoRelatorio';
import { CabecalhoRelatorio } from './PaginaRelatorio';
import { mesDoRelatorio } from './apresentacaoRelatorios';
import { estilos as e } from './styles';
export function HistoricoRelatoriosScreen(props) {
  const { sessao } = useSessao();
  return <HistoricoDaSessao key={sessao?.usuarioId ?? 'visitante'} {...props} />;
}
function HistoricoDaSessao({ navigation }) {
  const h = useHistoricoRelatorios(),
    margens = useSafeAreaInsets();
  return (
    <View style={[e.tela, { paddingTop: margens.top }]}>
      <CabecalhoRelatorio titulo="Histórico" aoVoltar={() => navigation.goBack()} />
      <FlatList
        data={h.relatorios}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={[e.conteudo, { paddingBottom: margens.bottom + 32 }]}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={h.atualizar} tintColor={colors.brand} />
        }
        ListHeaderComponent={
          <View style={e.cabecalhoLista}>
            <Text style={e.titulo} accessibilityRole="header">
              Suas semanas, guardadas
            </Text>
            <Text style={e.legenda}>Revisite as reflexões que você já recebeu.</Text>
            {h.carregando ? (
              <View style={e.cartao}>
                <ActivityIndicator color={colors.brand} />
                <Text style={e.texto} accessibilityLiveRegion="polite">
                  Buscando suas semanas…
                </Text>
              </View>
            ) : null}
            {h.erro ? (
              <View style={e.cartao}>
                <Text style={e.erro} accessibilityRole="alert">
                  {h.erro}
                </Text>
                {!h.expirada ? (
                  <SecondaryButton
                    style={e.botao}
                    estiloRotulo={e.rotuloBotao}
                    label="Tentar novamente"
                    onPress={h.atualizar}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => (
          <View>
            {index === 0 ||
            mesDoRelatorio(item.periodo.fim) !==
              mesDoRelatorio(h.relatorios[index - 1].periodo.fim) ? (
              <Text style={e.mes} accessibilityRole="header">
                {mesDoRelatorio(item.periodo.fim)}
              </Text>
            ) : null}
            <CartaoRelatorio
              relatorio={item}
              aoAbrir={() => navigation.navigate('RelatorioSalvoScreen', { relatorioId: item.id })}
            />
          </View>
        )}
        ListEmptyComponent={
          !h.carregando && !h.erro ? (
            <EmptyState
              title="Sua história começa por aqui"
              message="Quando houver um relatório salvo, ele aparecerá aqui."
              buttonLabel="Voltar ao progresso"
              onCreate={() => navigation.goBack()}
            />
          ) : null
        }
        ListFooterComponent={
          h.relatorios.length ? (
            <View style={e.rodape}>
              {h.erroMais ? (
                <View style={e.espaco}>
                  <Text style={e.erro} accessibilityRole="alert">
                    {h.erroMais}
                  </Text>
                  <SecondaryButton
                    style={e.botao}
                    estiloRotulo={e.rotuloBotao}
                    label="Atualizar histórico"
                    onPress={h.atualizar}
                  />
                </View>
              ) : null}
              {h.dados?.proximoCursor ? (
                <SecondaryButton
                  style={e.botao}
                  estiloRotulo={e.rotuloBotao}
                  label={
                    h.carregandoMais
                      ? 'Buscando mais semanas…'
                      : h.erroMais
                        ? 'Tentar buscar mais semanas'
                        : 'Ver semanas anteriores'
                  }
                  onPress={h.carregarMais}
                  disabled={h.carregandoMais}
                />
              ) : (
                <Text style={e.legenda}>Você chegou ao fim dos relatórios salvos.</Text>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}
