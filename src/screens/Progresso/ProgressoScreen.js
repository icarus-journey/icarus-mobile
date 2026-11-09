import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AbasDeProgresso } from '../../components/Analise/AbasDeProgresso';
import { AcessoPesquisa } from '../../components/Analise/AcessoPesquisa';
import { FatoCampanhaPesquisa } from '../../components/Analise/FatoCampanhaPesquisa';
import { PesquisasDaRotina } from '../../components/Analise/PesquisasDaRotina';
import { PlanejamentoProgresso } from '../../components/Analise/PlanejamentoProgresso';
import { DistribuicaoPorArea } from '../../components/Analise/DistribuicaoPorArea';
import { IconeAnalise } from '../../components/Analise/IconeAnalise';
import { MetaEmFoco } from '../../components/Analise/MetaEmFoco';
import { ResumoObjetivos } from '../../components/Analise/Objetivos/ResumoObjetivos';
import { useAbrirObjetivo } from '../../hooks/useAbrirObjetivo';
import { ResumoEvolucaoPessoal } from '../../components/Analise/ResumoEvolucaoPessoal';
import { SeletorPeriodoProgresso } from '../../components/Analise/SeletorPeriodoProgresso';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { SecondaryButton } from '../../components/Button';
import { PickerModal } from '../../components/PickerModal';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useProgresso } from '../../hooks/useProgresso';
import { useReferenciasPublicas } from '../../hooks/useReferenciasPublicas';
import { useCampaigns } from '../../state/CampaignsContext';
import { colors } from '../../theme/colors';
import { periodoCurto } from '../../utils/formatarProgresso';
import { AREA_DA_VIDA_OPTIONS } from '../EpicForm/areaDaVidaOptions';
import { estilosProgresso } from './estilosProgresso';
import { EvolucaoDaMetaEmFoco } from './EvolucaoDaMetaEmFoco';

const codigoDaArea = (area) => area?.replace(/([A-Z])/g, '_$1').toUpperCase();
const areas = AREA_DA_VIDA_OPTIONS.map((area) => ({ ...area, id: codigoDaArea(area.id) }));

export function ProgressoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { campaigns } = useCampaigns();
  const [aba, setAba] = useState(route?.params?.aba === 'publico' ? 'publico' : 'pessoal');
  const [area, setArea] = useState(null);
  const [periodo, setPeriodo] = useState('semanaAnterior');
  const [seletor, setSeletor] = useState(false);
  const [selecaoCampanha, setSelecaoCampanha] = useState(null);
  const pessoal = useProgresso(periodo);
  const abrirObjetivo = useAbrirObjetivo(navigation);
  const campanhas = pessoal.dados?.objetivos?.campanhas ?? [];
  const campanhaId =
    selecaoCampanha?.usuarioId === pessoal.usuarioId ? selecaoCampanha.campanhaId : null;
  const campanha =
    campanhas.find((c) => c.id === campanhaId) ??
    campanhas.find((c) => c.id === pessoal.dados?.objetivos?.campanhaEmDestaqueId);
  const podeConsultarPesquisas = !!pessoal.dados && (!campanhas.length || !!campanha);
  const publico = useReferenciasPublicas(
    campanha ? null : area,
    'todos',
    aba === 'publico' && podeConsultarPesquisas,
    campanha?.id,
  );
  const areaEfetiva = area ?? publico.dados?.areaDaVida;
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <View style={locais.cabecalho}>
        <ScreenHeader title="Meu progresso" onBack={() => navigation.goBack()} />
        <AbasDeProgresso aba={aba} onChange={setAba} />
      </View>
      <ScrollView
        key={aba}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={
              aba === 'pessoal' ? pessoal.atualizando : publico.atualizando || pessoal.atualizando
            }
            tintColor={colors.brand}
            onRefresh={
              aba === 'pessoal'
                ? pessoal.carregar
                : () => Promise.all([pessoal.carregar(), publico.carregar()])
            }
          />
        }
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        {aba === 'pessoal' ? (
          <>
            <SeletorPeriodoProgresso periodo={periodo} onChange={setPeriodo} />
            <View style={estilos.entre}>
              <View style={[estilos.linha, estilos.textoFlexivel]}>
                <IconeAnalise nome="calendario" tamanho={16} />
                <Text style={estilos.pequeno}>{periodoCurto(pessoal.dados?.periodo)}</Text>
              </View>
            </View>
            {pessoal.carregando && !pessoal.dados ? (
              <View style={locais.carregando}>
                <ActivityIndicator color={colors.brand} />
                <Text style={estilos.texto} accessibilityLiveRegion="polite">
                  Buscando seus passos…
                </Text>
              </View>
            ) : null}
            {pessoal.erro ? (
              <View style={estilos.cartao}>
                <Text style={estilos.erro} accessibilityRole="alert">
                  {pessoal.erro}
                </Text>
                <SecondaryButton label="Atualizar meus registros" onPress={pessoal.carregar} />
              </View>
            ) : null}

            {pessoal.dados?.objetivos ? (
              <ResumoObjetivos
                key={`${pessoal.usuarioId}:${periodo}`}
                dados={pessoal.dados.objetivos}
                periodo={pessoal.dados.periodo}
                campanhaSelecionadaId={
                  selecaoCampanha?.usuarioId === pessoal.usuarioId
                    ? selecaoCampanha.campanhaId
                    : null
                }
                aoSelecionarCampanha={(campanhaId) =>
                  setSelecaoCampanha({ usuarioId: pessoal.usuarioId, campanhaId })
                }
                aoAbrirCampanha={abrirObjetivo.abrirCampanha}
                aoVerMeta={(campanhaId) =>
                  navigation.navigate('DetalheMetaProgressoScreen', { campanhaId, periodo })
                }
                erroAbertura={abrirObjetivo.erro}
                abrindo={abrirObjetivo.carregando}
              />
            ) : (pessoal.dados || pessoal.carregando) &&
              /^1\.[012]\./.test(pessoal.dados?.versaoContrato ?? pessoal.versaoContrato) ? (
              <MetaEmFoco
                campanhas={campaigns}
                renderEvolucao={(campanhaId) => <EvolucaoDaMetaEmFoco campanhaId={campanhaId} />}
                onAbrir={(campaignId) => navigation.navigate('CampaignDetail', { campaignId })}
                onVerPesquisas={(codigo) => {
                  setArea(codigoDaArea(codigo));
                  setAba('publico');
                }}
              />
            ) : null}
            {pessoal.dados ? (
              <PlanejamentoProgresso
                dados={pessoal.dados}
                aoComparar={() => navigation.navigate('RelatorioSemanalScreen')}
              />
            ) : null}
            {pessoal.dados?.estado === 'sem_registros' ? (
              <Text style={estilos.texto}>{pessoal.dados.mensagem}</Text>
            ) : null}
            {pessoal.dados ? (
              <>
                <ResumoEvolucaoPessoal
                  dados={{ ...pessoal.dados, adesao: null }}
                  deveExibirMetricas={false}
                />
                <DistribuicaoPorArea indicadores={pessoal.dados.indicadores} />
              </>
            ) : null}
          </>
        ) : (
          <>
            <AcessoPesquisa
              acessibilidade={
                campanhas.length ? 'Escolher campanha das pesquisas' : 'Escolher área das pesquisas'
              }
              rotulo={
                campanhas.length
                  ? (campanha?.titulo ?? 'Escolha uma campanha')
                  : (areas.find((item) => item.id === areaEfetiva)?.titulo ?? 'Explorar pesquisas')
              }
              valor={
                campanhas.length
                  ? (campanha?.titulo ?? 'Escolha uma campanha')
                  : (areas.find((item) => item.id === areaEfetiva)?.titulo ?? 'Escolher área')
              }
              aoAbrir={() => setSeletor(true)}
              estilo={[estilos.cartao, locais.escolhaArea]}
            />
            {campanha ? (
              <FatoCampanhaPesquisa campanha={campanha} periodo={pessoal.dados?.periodo} />
            ) : null}
            {(pessoal.carregando && !pessoal.dados) ||
            (podeConsultarPesquisas && publico.carregando && !publico.dados) ? (
              <View style={locais.carregando}>
                <ActivityIndicator color={colors.brand} />
                <Text style={estilos.texto} accessibilityLiveRegion="polite">
                  Buscando pesquisas…
                </Text>
              </View>
            ) : null}
            {publico.erro || pessoal.erro ? (
              <View style={estilos.cartao}>
                <Text style={estilos.erro} accessibilityRole="alert">
                  {publico.erro || pessoal.erro}
                </Text>
                <SecondaryButton
                  label="Tentar novamente"
                  onPress={() => Promise.all([pessoal.carregar(), publico.carregar()])}
                />
              </View>
            ) : null}
            {podeConsultarPesquisas && publico.dados ? (
              <PesquisasDaRotina
                key={`${pessoal.usuarioId}:${campanha?.id}:${areaEfetiva}`}
                dados={publico.dados}
                aoVerReferencia={(leitura) =>
                  navigation.navigate('DetalhesDaReferenciaScreen', { leitura })
                }
              />
            ) : campanhas.length && !campanha ? (
              <Text style={estilos.texto}>
                Escolha uma campanha para conhecer as pesquisas relacionadas.
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>
      <PickerModal
        visible={seletor}
        title={campanhas.length ? 'Escolha uma campanha' : 'Escolha uma área'}
        items={
          campanhas.length ? campanhas.map((c) => ({ id: String(c.id), titulo: c.titulo })) : areas
        }
        onClose={() => setSeletor(false)}
        onSelect={(item) => {
          if (campanhas.length) {
            setSelecaoCampanha({ usuarioId: pessoal.usuarioId, campanhaId: Number(item.id) });
            setArea(null);
          } else setArea(item.id);
          setSeletor(false);
        }}
      />
    </View>
  );
}

const locais = StyleSheet.create({
  cabecalho: { paddingHorizontal: 24, paddingTop: 8, gap: 8, paddingBottom: 8 },
  info: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  carregando: { gap: 12, alignItems: 'center', padding: 24 },
  escolhaArea: { paddingVertical: 14, borderRadius: 18 },
});
