import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { PickerModal } from '../../components/PickerModal';
import { EmptyState } from '../../components/EmptyState';
import { useSessao } from '../../state/SessaoContext';
import { useHistoricoMissoes } from '../../hooks/useHistoricoMissoes';
import { periodoCurto } from '../../utils/formatarProgresso';
import { colors } from '../../theme/colors';
import { CartaoRegistroHistorico } from './CartaoRegistroHistorico';
import { FiltrosHistoricoMissoes } from './FiltrosHistoricoMissoes';
import {
  FILTROS_INICIAIS,
  opcoesDePeriodo,
  filtroDoPeriodo,
  dataDoRegistro,
} from './apresentacaoHistorico';
import { estilos as e } from './styles';

export function HistoricoMissoesScreen(props) {
  const { sessao } = useSessao();
  return <HistoricoDaSessao key={sessao?.usuarioId ?? 'visitante'} {...props} />;
}
function HistoricoDaSessao({ navigation }) {
  const insets = useSafeAreaInsets();
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS),
    [filtrando, setFiltrando] = useState(false),
    [periodoAberto, setPeriodoAberto] = useState(false);
  const historico = useHistoricoMissoes(filtros);
  const periodos = useMemo(
    () =>
      opcoesDePeriodo(historico.dados?.consultadoEm ?? new Date(), historico.dados?.fusoHorario),
    [historico.dados?.consultadoEm, historico.dados?.fusoHorario],
  );
  const quantidadeFiltros =
    Number(filtros.estado !== 'todos') + Number(Boolean(filtros.campanhaId || filtros.avulsas));
  const filtrado = quantidadeFiltros > 0 || filtros.periodo !== 'ultimos30';
  const secoes = useMemo(() => {
    const grupos = new Map();
    for (const r of historico.registros) {
      if (!grupos.has(r.dataPrevista)) grupos.set(r.dataPrevista, []);
      grupos.get(r.dataPrevista).push(r);
    }
    return [...grupos].map(([data, registros]) => ({
      title: dataDoRegistro(data),
      data: registros,
      key: data,
    }));
  }, [historico.registros]);
  return (
    <View style={[e.tela, { paddingTop: insets.top }]}>
      <View style={e.cabecalho}>
        <ScreenHeader title="Histórico de missões" onBack={() => navigation.goBack()} />
      </View>
      <SectionList
        sections={secoes}
        keyExtractor={(r) => String(r.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[e.conteudo, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={historico.carregando && Boolean(historico.dados)}
            onRefresh={historico.atualizar}
            tintColor={colors.brand}
          />
        }
        ListHeaderComponent={
          <View style={e.espaco}>
            <View style={e.linha}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Escolher período do histórico"
                style={[e.pill, e.flexivel]}
                onPress={() => setPeriodoAberto(true)}
              >
                <Text style={e.rotulo}>
                  {periodos.find((p) => p.id === filtros.periodo)?.titulo ?? 'Período selecionado'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Filtrar histórico"
                onPress={() => setFiltrando(true)}
                style={[e.pill, quantidadeFiltros > 0 && e.pillAtiva]}
              >
                <Text style={[e.rotulo, quantidadeFiltros > 0 && e.branco]}>
                  {quantidadeFiltros ? `Filtros · ${quantidadeFiltros}` : 'Filtros'}
                </Text>
              </Pressable>
            </View>
            <Text style={e.legenda}>
              {historico.dados
                ? `Datas previstas · ${periodoCurto(historico.dados.filtro)}`
                : 'Datas previstas'}
            </Text>
            {historico.dados?.historicoParcial ? (
              <Text style={e.legenda}>Alguns registros antigos não têm todos os detalhes.</Text>
            ) : null}
            {historico.carregando ? (
              <View style={e.processando}>
                <ActivityIndicator color={colors.brand} />
                <Text style={e.texto} accessibilityLiveRegion="polite">
                  Buscando seu histórico…
                </Text>
              </View>
            ) : null}
            {historico.erro ? (
              <View style={e.aviso}>
                <Text style={e.erro} accessibilityRole="alert">
                  {historico.erro}
                </Text>
                {!historico.expirada ? (
                  <SecondaryButton label="Tentar novamente" onPress={historico.atualizar} />
                ) : null}
              </View>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={e.legenda} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <CartaoRegistroHistorico
            registro={item}
            aoAbrir={() =>
              navigation.navigate('RegistroHistoricoMissao', { ocorrenciaId: item.id })
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !historico.carregando && !historico.erro ? (
            <EmptyState
              title={
                filtrado
                  ? 'Nada com esses filtros'
                  : historico.dados?.temRegistros
                    ? 'Nenhum registro neste período'
                    : 'Sua história começa aqui'
              }
              subtitle={
                filtrado || historico.dados?.temRegistros
                  ? 'Experimente outro período ou campanha.'
                  : 'Suas missões aparecerão aqui.'
              }
              buttonLabel={
                filtrado
                  ? 'Limpar filtros'
                  : historico.dados?.temRegistros
                    ? 'Alterar filtros'
                    : 'Voltar às missões'
              }
              onCreate={() =>
                filtrado
                  ? setFiltros(FILTROS_INICIAIS)
                  : historico.dados?.temRegistros
                    ? setFiltrando(true)
                    : navigation.goBack()
              }
            />
          ) : null
        }
        ListFooterComponent={
          historico.registros.length > 0 ? (
            <View style={e.rodape}>
              <Text style={e.legenda}>
                {historico.registros.length}{' '}
                {historico.registros.length === 1 ? 'registro carregado' : 'registros carregados'}
              </Text>
              {historico.erroMais ? (
                <View style={e.aviso}>
                  <Text style={e.erro} accessibilityRole="alert">
                    {historico.erroMais}
                  </Text>
                  <SecondaryButton label="Atualizar histórico" onPress={historico.atualizar} />
                </View>
              ) : null}
              {historico.dados?.proximoCursor ? (
                <SecondaryButton
                  label={
                    historico.carregandoMais
                      ? 'Buscando mais registros…'
                      : historico.erroMais
                        ? 'Tentar carregar mais'
                        : 'Ver mais registros'
                  }
                  disabled={historico.carregandoMais}
                  onPress={historico.carregarMais}
                />
              ) : (
                <Text style={e.legenda}>Você chegou ao fim.</Text>
              )}
            </View>
          ) : null
        }
      />
      <PickerModal
        visible={periodoAberto}
        title="Escolher período"
        items={periodos.filter((p) => p.id !== 'personalizado')}
        onClose={() => setPeriodoAberto(false)}
        onSelect={(p) => {
          setFiltros(filtroDoPeriodo(filtros, p));
          setPeriodoAberto(false);
        }}
      />
      {filtrando ? (
        <FiltrosHistoricoMissoes
          filtros={filtros}
          periodos={periodos}
          servico={historico.servico}
          aoFechar={() => setFiltrando(false)}
          aoAplicar={(r) => {
            setFiltros(r);
            setFiltrando(false);
          }}
        />
      ) : null}
    </View>
  );
}
