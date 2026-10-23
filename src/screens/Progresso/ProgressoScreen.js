import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AbasDeProgresso } from '../../components/Analise/AbasDeProgresso';
import { DetalhesDosIndicadores } from '../../components/Analise/DetalhesDosIndicadores';
import { DistribuicaoPorArea } from '../../components/Analise/DistribuicaoPorArea';
import { IconeAnalise } from '../../components/Analise/IconeAnalise';
import { MetaEmFoco } from '../../components/Analise/MetaEmFoco';
import { ReferenciasEmDestaque } from '../../components/Analise/ReferenciasEmDestaque';
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
import { ProximoPassoDaSemana } from './ProximoPassoDaSemana';

const codigoDaArea = (area) => area?.replace(/([A-Z])/g, '_$1').toUpperCase();
const areas = AREA_DA_VIDA_OPTIONS.map((area) => ({ ...area, id: codigoDaArea(area.id) }));

export function ProgressoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { campaigns } = useCampaigns();
  const [aba, setAba] = useState(route?.params?.aba === 'publico' ? 'publico' : 'pessoal');
  const [area, setArea] = useState(null);
  const [periodo, setPeriodo] = useState('semanaAnterior');
  const [seletor, setSeletor] = useState(false);
  const [detalhes, setDetalhes] = useState(false);
  const pessoal = useProgresso(periodo);
  const publico = useReferenciasPublicas(area);
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
            refreshing={false}
            tintColor={colors.brand}
            onRefresh={aba === 'pessoal' ? pessoal.carregar : publico.carregar}
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
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sobre estes números"
                onPress={() => setDetalhes(true)}
                style={locais.info}
              >
                <IconeAnalise nome="info" />
              </Pressable>
            </View>
            {pessoal.carregando ? (
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
            {pessoal.dados ? <ResumoEvolucaoPessoal dados={pessoal.dados} /> : null}
            <MetaEmFoco
              campanhas={campaigns}
              onAbrir={(campaignId) => navigation.navigate('CampaignDetail', { campaignId })}
              onVerPesquisas={(codigo) => {
                setArea(codigoDaArea(codigo));
                setAba('publico');
              }}
            />
            <ProximoPassoDaSemana
              onVerSemana={() => navigation.navigate('RelatorioSemanalScreen')}
            />
            {pessoal.dados?.indicadores ? (
              <DistribuicaoPorArea indicadores={pessoal.dados.indicadores} />
            ) : null}
            <Text style={[estilos.pequeno, locais.rodape]}>
              Cada registro conta uma parte da sua jornada.
            </Text>
          </>
        ) : (
          <>
            <View style={estilos.secao}>
              <Text style={estilos.titulo} accessibilityRole="header">
                Um olhar para sua rotina
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escolher área das pesquisas"
              accessibilityValue={{
                text: areas.find((item) => item.id === areaEfetiva)?.titulo ?? 'Escolher área',
              }}
              onPress={() => setSeletor(true)}
              style={[estilos.cartao, estilos.entre, locais.escolhaArea]}
            >
              <View style={estilos.textoFlexivel}>
                <Text style={estilos.pequeno}>Escolha uma área</Text>
                <Text style={estilos.marca}>
                  {areas.find((item) => item.id === areaEfetiva)?.titulo ?? 'Explorar pesquisas'}
                </Text>
              </View>
              <IconeAnalise nome="chevron" />
            </Pressable>
            {publico.carregando ? (
              <View style={locais.carregando}>
                <ActivityIndicator color={colors.brand} />
                <Text style={estilos.texto} accessibilityLiveRegion="polite">
                  Buscando pesquisas…
                </Text>
              </View>
            ) : null}
            {publico.erro ? (
              <View style={estilos.cartao}>
                <Text style={estilos.erro} accessibilityRole="alert">
                  {publico.erro}
                </Text>
                <SecondaryButton label="Tentar novamente" onPress={publico.carregar} />
              </View>
            ) : null}
            {publico.dados?.referencias?.length ? (
              <ReferenciasEmDestaque
                key={`${areaEfetiva}:${publico.dados.versaoGold}`}
                referencias={publico.dados.referencias}
                onEntender={(referencia) =>
                  navigation.navigate('DetalhesDaReferenciaScreen', { referencia })
                }
              />
            ) : publico.dados && !publico.carregando ? (
              <View style={estilos.cartao}>
                <IconeAnalise nome="globo" tamanho={28} />
                <Text style={estilos.texto} accessibilityLiveRegion="polite">
                  {publico.dados.mensagem}
                </Text>
                {publico.dados.estado === 'indisponivel' ? (
                  <SecondaryButton label="Atualizar referências" onPress={publico.carregar} />
                ) : null}
              </View>
            ) : null}
            <Text style={estilos.pequeno}>
              Dados de outras pessoas, em pesquisas de 2024. Não são uma avaliação dos seus hábitos
              nem uma meta para você seguir.
            </Text>
          </>
        )}
      </ScrollView>
      <PickerModal
        visible={seletor}
        title="Escolha uma área"
        items={areas}
        onClose={() => setSeletor(false)}
        onSelect={(item) => {
          setArea(item.id);
          setSeletor(false);
        }}
      />
      <DetalhesDosIndicadores
        visivel={detalhes}
        onFechar={() => setDetalhes(false)}
        dados={pessoal.dados}
      />
    </View>
  );
}

const locais = StyleSheet.create({
  cabecalho: { paddingHorizontal: 24, paddingTop: 8, gap: 8, paddingBottom: 8 },
  info: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  carregando: { gap: 12, alignItems: 'center', padding: 24 },
  escolhaArea: { paddingVertical: 14, borderRadius: 18 },
  rodape: { textAlign: 'center', paddingVertical: 4 },
});
