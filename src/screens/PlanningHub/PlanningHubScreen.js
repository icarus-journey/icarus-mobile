import { CabecalhoSecaoMissoes } from './CabecalhoSecaoMissoes';
import { agruparMissoesPorDia } from './agruparMissoesPorDia';
import { SecondaryButton } from '../../components/Button';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IndicadoresJornada } from '../../components/Jornada/IndicadoresJornada';
import { DetalhesSequenciaModal } from '../../components/Jornada/DetalhesSequenciaModal';
import { useJornada } from '../../hooks/useJornada';
import { CampaignHeroCard } from '../../components/CampaignHeroCard';
import { EmptyState } from '../../components/EmptyState';
import { EpicHeroCard } from '../../components/EpicHeroCard';
import { SegmentedControl } from '../../components/SegmentedControl';
import IconeAcessoProgresso from '../../assets/icons/icone-acesso-progresso.svg';
import IconeAcessoHistorico from '../../assets/icons/icone-acesso-historico.svg';
import { TaskCard } from '../../components/TaskCard';
import { useCampaigns } from '../../state/CampaignsContext';
import { useCarregamentoPlanejamento } from '../../state/CarregadorPlanejamento';
import { useEpics } from '../../state/EpicsContext';
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import {
  formatDateDaysFromNow,
  isDataLimiteVencida,
  isValidDateString,
  paraDataIso,
} from '../../utils/dateInput';
import { focarElemento } from '../../utils/focarElemento';

function isMissaoAtrasada(mission, referencia) {
  return mission.status === 'ATRASADA' || isDataLimiteVencida(mission.dataLimite, referencia);
}

function compararMissoesPorData(primeira, segunda) {
  const primeiraData = isValidDateString(primeira.dataLimite)
    ? paraDataIso(primeira.dataLimite)
    : '9999-99-99';
  const segundaData = isValidDateString(segunda.dataLimite)
    ? paraDataIso(segunda.dataLimite)
    : '9999-99-99';
  return primeiraData.localeCompare(segundaData);
}

const HEADERS = {
  MISSAO: { title: 'Missões' },
  CAMPANHA: { title: 'Campanhas' },
  EPICO: { title: 'Épicos' },
};

const ADD_LABELS = {
  MISSAO: 'Adicionar missão',
  CAMPANHA: 'Adicionar campanha',
  EPICO: 'Adicionar épico',
};

const ADD_ROUTES = {
  MISSAO: 'MissionForm',
  CAMPANHA: 'CampaignForm',
  EPICO: 'EpicForm',
};

function SeparadorMissoes() {
  return <View style={styles.separadorMissoes} />;
}

export function PlanningHubScreen({ navigation, route }) {
  const { missions } = useMissions();
  const planejamento = useCarregamentoPlanejamento();
  const { campaigns } = useCampaigns();
  const { epics } = useEpics();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState(route.params?.initialSegment ?? 'MISSAO');
  const jornada = useJornada(navigation);
  const hoje = formatDateDaysFromNow(0);
  const [sequenciaAberta, setSequenciaAberta] = useState(false);
  const referenciaSequencia = useRef(null);
  const { width, fontScale } = useWindowDimensions();
  const caracteresDosIndicadores =
    (jornada.dados?.saldoPontos?.toLocaleString('pt-BR').length ?? 1) +
    (jornada.dados?.sequencia?.diasAtuais?.toLocaleString('pt-BR').length ?? 1);
  const cabecalhoCompacto =
    width < 380 ||
    fontScale > 1.15 ||
    caracteresDosIndicadores > 7 ||
    (jornada.dados?.saldoPontos?.toLocaleString('pt-BR').length ?? 0) > 6 ||
    (jornada.dados?.sequencia?.diasAtuais ?? 0) >= 1000;
  const indicadores = (
    <IndicadoresJornada
      dados={jornada.dados}
      carregando={jornada.carregando}
      aoVerSequencia={() => setSequenciaAberta(true)}
      aoVerLoja={() => navigation.navigate('Loja')}
      referenciaSequencia={referenciaSequencia}
    />
  );

  const {
    ativas: missoesAtivas,
    atrasadas: missoesAtrasadas,
    concluidas: missoesConcluidas,
  } = useMemo(() => {
    const [dia, mes, ano] = hoje.split('/').map(Number);
    const referencia = new Date(ano, mes - 1, dia);
    const ordenadas = [...missions].sort(compararMissoesPorData);
    const concluidas = ordenadas.filter((m) => m.concluidaEm);
    const atrasadas = ordenadas.filter((m) => !m.concluidaEm && isMissaoAtrasada(m, referencia));
    const ativas = ordenadas.filter((m) => !m.concluidaEm && !isMissaoAtrasada(m, referencia));
    return { ativas, atrasadas, concluidas };
  }, [missions, hoje]);

  const {
    ativas: campanhasAtivas,
    atrasadas: campanhasAtrasadas,
    concluidas: campanhasConcluidas,
  } = useMemo(() => {
    const concluidas = campaigns.filter((c) => c.estado === 'concluida');
    const atrasadas = campaigns.filter(
      (c) => c.estado !== 'concluida' && isDataLimiteVencida(c.dataLimite),
    );
    const ativas = campaigns.filter(
      (c) => c.estado !== 'concluida' && !isDataLimiteVencida(c.dataLimite),
    );
    return { ativas, atrasadas, concluidas };
  }, [campaigns]);

  const {
    ativos: epicosAtivos,
    atrasados: epicosAtrasados,
    concluidos: epicosConcluidos,
  } = useMemo(() => {
    const concluidos = epics.filter((e) => e.estado === 'concluido');
    const atrasados = epics.filter(
      (e) => e.estado !== 'concluido' && isDataLimiteVencida(e.dataLimite),
    );
    const ativos = epics.filter(
      (e) => e.estado !== 'concluido' && !isDataLimiteVencida(e.dataLimite),
    );
    return { ativos, atrasados, concluidos };
  }, [epics]);

  const secoes = useMemo(() => {
    if (segment === 'MISSAO') {
      return [
        ...agruparMissoesPorDia(missoesAtivas, hoje),
        { key: 'atrasadas', titulo: 'Atrasados', tipo: 'estado', data: missoesAtrasadas },
        { key: 'concluidas', titulo: 'Concluídos', tipo: 'estado', data: missoesConcluidas },
      ].filter((secao) => secao.data.length);
    }
    const grupos =
      segment === 'CAMPANHA'
        ? [
            ['', campanhasAtivas],
            ['Atrasados', campanhasAtrasadas],
            ['Concluídos', campanhasConcluidas],
          ]
        : [
            ['', epicosAtivos],
            ['Atrasados', epicosAtrasados],
            ['Concluídos', epicosConcluidos],
          ];
    return grupos.filter(([, itens]) => itens.length).map(([titulo, data]) => ({ titulo, data }));
  }, [
    segment,
    hoje,
    missoesAtivas,
    missoesAtrasadas,
    missoesConcluidas,
    campanhasAtivas,
    campanhasAtrasadas,
    campanhasConcluidas,
    epicosAtivos,
    epicosAtrasados,
    epicosConcluidos,
  ]);

  const header = HEADERS[segment];

  function handleAdd() {
    navigation.navigate(ADD_ROUTES[segment]);
  }

  function fecharSequencia() {
    setSequenciaAberta(false);
    requestAnimationFrame(() => focarElemento(referenciaSequencia));
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTexts}>
            <Text
              style={styles.title}
              numberOfLines={cabecalhoCompacto ? undefined : 1}
              adjustsFontSizeToFit={!cabecalhoCompacto}
              minimumFontScale={0.8}
            >
              {header.title}
            </Text>
          </View>
          {!cabecalhoCompacto ? indicadores : null}
          <Pressable
            onPress={handleAdd}
            accessibilityRole="button"
            accessibilityLabel={ADD_LABELS[segment]}
            style={styles.addButton}
          >
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </Pressable>
        </View>
        {cabecalhoCompacto ? <View style={styles.indicadoresCompactos}>{indicadores}</View> : null}

        <SegmentedControl value={segment} onChange={setSegment} />
        <View style={styles.acessos}>
          <Pressable
            style={styles.acesso}
            accessibilityRole="button"
            accessibilityLabel="Meu progresso"
            onPress={() => navigation.navigate('ProgressoScreen')}
          >
            <IconeAcessoProgresso accessible={false} />
            <Text style={styles.textoAcesso}>Meu progresso</Text>
          </Pressable>
          {segment === 'MISSAO' ? (
            <Pressable
              style={styles.acesso}
              accessibilityRole="button"
              accessibilityLabel="Histórico"
              accessibilityHint="Consultar os registros de missões"
              onPress={() => navigation.navigate('HistoricoMissoes')}
            >
              <IconeAcessoHistorico accessible={false} />
              <Text style={styles.textoAcesso}>Histórico</Text>
            </Pressable>
          ) : null}
        </View>

        {planejamento.erro ? (
          <View>
            <Text style={styles.subtitle} accessibilityRole="alert">
              {planejamento.erro}
            </Text>
            <SecondaryButton label="Atualizar lista" onPress={planejamento.atualizar} />
          </View>
        ) : null}
        <SectionList
          key={segment}
          sections={secoes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.list,
            segment === 'MISSAO' && styles.listaMissoes,
            { paddingBottom: insets.bottom + 16 },
          ]}
          ItemSeparatorComponent={segment === 'MISSAO' ? SeparadorMissoes : undefined}
          stickySectionHeadersEnabled={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          renderSectionHeader={({ section }) =>
            !section.titulo ? null : segment === 'MISSAO' ? (
              <CabecalhoSecaoMissoes
                titulo={section.titulo}
                tipo={section.tipo}
                primeira={section.key === secoes[0]?.key}
              />
            ) : (
              <Text style={styles.extraTitle}>{section.titulo}</Text>
            )
          }
          renderItem={({ item }) =>
            segment === 'MISSAO' ? (
              <TaskCard
                mission={item}
                onPress={() => navigation.navigate('MissionDetail', { missionId: item.id })}
              />
            ) : segment === 'CAMPANHA' ? (
              <CampaignHeroCard
                campaign={item}
                onPress={() => navigation.navigate('CampaignDetail', { campaignId: item.id })}
              />
            ) : (
              <EpicHeroCard
                epic={item}
                onPress={() => navigation.navigate('EpicDetail', { epicId: item.id })}
              />
            )
          }
          ListEmptyComponent={
            planejamento.carregando ? (
              <ActivityIndicator
                color={colors.brand}
                accessibilityLabel="Carregando seus próximos passos"
              />
            ) : planejamento.erro ? null : segment === 'MISSAO' ? (
              <EmptyState
                title="Nenhuma missão por aqui"
                subtitle="Crie sua primeira missão para começar a acompanhar seus passos."
                buttonLabel="Criar missão"
                onCreate={() => navigation.navigate('MissionForm')}
              />
            ) : segment === 'CAMPANHA' ? (
              <EmptyState
                title="Nenhuma campanha por aqui"
                subtitle="Crie sua primeira campanha para organizar suas missões."
                buttonLabel="Criar campanha"
                onCreate={() => navigation.navigate('CampaignForm')}
              />
            ) : (
              <EmptyState
                title="Nenhum épico por aqui"
                subtitle="Crie seu primeiro épico para dar rumo à sua jornada."
                buttonLabel="Criar épico"
                onCreate={() => navigation.navigate('EpicForm')}
              />
            )
          }
        />
      </View>

      {sequenciaAberta ? (
        <DetalhesSequenciaModal
          key={jornada.usuarioId ?? 'sem-sessao'}
          jornada={jornada}
          espacoInferior={insets.bottom}
          aoFechar={fecharSequencia}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  acessos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    columnGap: 16,
    rowGap: 4,
    marginTop: -8,
    marginBottom: -8,
  },
  acesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  textoAcesso: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.brand,
    flexShrink: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerTexts: {
    flex: 1,
  },
  indicadoresCompactos: { alignSelf: 'flex-end', maxWidth: '100%' },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandStrong,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 18,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  plusVertical: {
    position: 'absolute',
    width: 2.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  list: {
    gap: 16,
    flexGrow: 1,
  },
  listaMissoes: { gap: 0 },
  separadorMissoes: { height: 12 },
  extraTitle: {
    marginTop: 24,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textSecondary,
  },
});
