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
import IconeVoltar from '../../assets/icons/icone-voltar-extrato.svg';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PickerModal } from '../../components/PickerModal';
import { CartaoSaldo } from '../../components/Pontos/CartaoSaldo';
import { useSessao } from '../../state/SessaoContext';
import { useExtratoPontos } from '../../hooks/useExtratoPontos';
import { colors } from '../../theme/colors';
import { CartaoMovimento } from './CartaoMovimento';
import {
  FILTROS_EXTRATO,
  NATUREZAS,
  opcoesPeriodoExtrato,
  selecionarPeriodoExtrato,
  diaMovimento,
} from './apresentacaoExtrato';
import { estilos as e } from './styles';

export function ExtratoScreen(props) {
  const { sessao } = useSessao();
  return <ExtratoDaSessao key={sessao?.usuarioId ?? 'visitante'} {...props} />;
}
function ExtratoDaSessao({ navigation }) {
  const margens = useSafeAreaInsets(),
    [filtros, setFiltros] = useState(FILTROS_EXTRATO),
    [periodo, setPeriodo] = useState(false);
  const extrato = useExtratoPontos(filtros);
  const periodos = useMemo(
    () =>
      opcoesPeriodoExtrato(extrato.dados?.consultadoEm ?? new Date(), extrato.dados?.fusoHorario),
    [extrato.dados?.consultadoEm, extrato.dados?.fusoHorario],
  );
  const secoes = useMemo(() => {
    const grupos = new Map();
    for (const m of extrato.movimentos) {
      if (!grupos.has(m.dataLocal)) grupos.set(m.dataLocal, []);
      grupos.get(m.dataLocal).push(m);
    }
    return [...grupos].map(([data, registros]) => ({
      key: data,
      title: diaMovimento(data, extrato.dados.consultadoEm, extrato.dados.fusoHorario),
      data: registros,
    }));
  }, [extrato.movimentos, extrato.dados]);
  const filtrado = filtros.natureza !== 'todos' || filtros.periodo !== 'ultimos30';
  return (
    <View style={[e.tela, { paddingTop: margens.top }]}>
      <View style={e.cabecalho}>
        <ScreenHeader
          title="Extrato"
          onBack={() => navigation.goBack()}
          corVoltar={colors.surface}
          IconeVoltar={IconeVoltar}
          estiloTitulo={e.tituloCabecalho}
          style={e.semMargem}
        />
      </View>
      <SectionList
        sections={secoes}
        keyExtractor={(m) => String(m.id)}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[e.conteudo, { paddingBottom: margens.bottom + 24 }]}
        refreshControl={
          <RefreshControl
            refreshing={extrato.carregando && Boolean(extrato.dados)}
            onRefresh={extrato.atualizar}
            tintColor={colors.brand}
          />
        }
        ListHeaderComponent={
          <View style={e.espaco}>
            <CartaoSaldo saldo={extrato.dados?.saldoAtual} carregando={extrato.carregando} />
            <SecondaryButton
              label={
                periodos.find((p) => p.id === filtros.periodo)?.titulo ?? 'Período selecionado'
              }
              onPress={() => setPeriodo(true)}
              accessibilityHint="Abre os períodos do extrato"
              style={e.pill}
            />
            <View style={e.filtros} accessibilityRole="tablist">
              {NATUREZAS.map((n) => (
                <Pressable
                  key={n.id}
                  accessibilityRole="tab"
                  accessibilityLabel={n.titulo}
                  accessibilityState={{ selected: filtros.natureza === n.id }}
                  onPress={() => setFiltros((f) => ({ ...f, natureza: n.id }))}
                  style={[e.pill, e.pillFiltro, filtros.natureza === n.id && e.pillAtiva]}
                >
                  <Text style={[e.rotulo, filtros.natureza === n.id && e.branco]}>{n.titulo}</Text>
                </Pressable>
              ))}
            </View>
            {extrato.carregando ? (
              <View style={e.processando}>
                <ActivityIndicator color={colors.brand} />
                <Text style={e.texto} accessibilityLiveRegion="polite">
                  Buscando seus movimentos…
                </Text>
              </View>
            ) : null}
            {extrato.erro ? (
              <View style={e.aviso}>
                <Text style={e.erro} accessibilityRole="alert">
                  {extrato.erro}
                </Text>
                {!extrato.expirada ? (
                  <SecondaryButton label="Tentar novamente" onPress={extrato.atualizar} />
                ) : null}
              </View>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[e.legenda, e.secaoDia]} accessibilityRole="header">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <CartaoMovimento
            movimento={item}
            fuso={extrato.dados.fusoHorario}
            aoAbrir={() => navigation.navigate('MovimentoExtrato', { movimentoId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          !extrato.carregando && !extrato.erro ? (
            <EmptyState
              title={
                extrato.dados?.temRegistros || filtrado
                  ? 'Sem movimentos neste período'
                  : 'Seu extrato começa aqui'
              }
              subtitle={
                extrato.dados?.temRegistros || filtrado
                  ? 'Escolha outro período para ver os movimentos.'
                  : 'Suas missões e resgates aparecem aqui.'
              }
              buttonLabel={
                extrato.dados?.temRegistros || filtrado ? 'Ver todo o histórico' : 'Voltar à Loja'
              }
              onCreate={() =>
                extrato.dados?.temRegistros || filtrado
                  ? setFiltros({ periodo: 'todoHistorico', natureza: 'todos', todoHistorico: true })
                  : navigation.goBack()
              }
            />
          ) : null
        }
        ListFooterComponent={
          extrato.movimentos.length ? (
            <View style={e.rodape}>
              {extrato.erroMais ? (
                <View style={e.aviso}>
                  <Text style={e.erro} accessibilityRole="alert">
                    {extrato.erroMais}
                  </Text>
                  <SecondaryButton label="Atualizar extrato" onPress={extrato.atualizar} />
                </View>
              ) : null}
              {extrato.dados?.proximoCursor ? (
                <SecondaryButton
                  label={
                    extrato.carregandoMais
                      ? 'Buscando mais movimentos…'
                      : extrato.erroMais
                        ? 'Tentar carregar mais'
                        : 'Ver mais movimentos'
                  }
                  disabled={extrato.carregandoMais}
                  onPress={extrato.carregarMais}
                />
              ) : (
                <Text style={e.legenda}>Você chegou ao fim dos registros.</Text>
              )}
            </View>
          ) : null
        }
      />
      <PickerModal
        visible={periodo}
        title="Escolher período"
        items={periodos}
        onClose={() => setPeriodo(false)}
        onSelect={(p) => {
          setFiltros((f) => selecionarPeriodoExtrato(f, p));
          setPeriodo(false);
        }}
      />
    </View>
  );
}
