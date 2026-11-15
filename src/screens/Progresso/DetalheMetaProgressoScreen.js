import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { EvolucaoDaMeta } from '../../components/Analise/EvolucaoDaMeta';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { useProgresso } from '../../hooks/useProgresso';
import { numeroPublico } from '../../components/Analise/formatarReferencia';
import { estilosProgresso } from './estilosProgresso';
import { colors } from '../../theme/colors';

export function DetalheMetaProgressoScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { dados, carregando, erro } = useProgresso(route.params.periodo ?? 'semanaAnterior');
  const campanha = dados?.objetivos?.campanhas.find((c) => c.id === route.params.campanhaId);
  const r = campanha?.resultado;
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Ver minha meta" onBack={() => navigation.goBack()} />
        {carregando && !dados ? <ActivityIndicator color={colors.brand} /> : null}
        {erro ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
        {r ? (
          <>
            <View style={estilos.cartao}>
              <Text style={estilos.rotulo}>Sua meta em foco · Agora</Text>
              <Text style={estilos.titulo}>{campanha.titulo}</Text>
              <Text style={estilos.marca}>
                {numeroPublico(r.valorAtual)} de {numeroPublico(r.valorMensurado)} {r.unidade}
              </Text>
            </View>
            <View style={estilos.cartao}>
              <EvolucaoDaMeta
                dados={{
                  unidade: r.unidade,
                  valorMensurado: r.valorMensurado,
                  estado: campanha.estado,
                  evolucao: r.evolucaoAtual ?? r.evolucaoNoPeriodo,
                  cenario: r.cenarioAtual,
                }}
                periodoSelecionado={dados.periodo}
                baseDoAvanco={r.baseDoAvanco}
                evolucaoDoPeriodo={r.evolucaoNoPeriodo}
              />
            </View>
            <SecondaryButton
              label="Abrir campanha"
              onPress={() => navigation.navigate('CampaignDetail', { campaignId: campanha.id })}
            />
          </>
        ) : dados ? (
          <Text style={estilos.texto}>Esta meta não está disponível no período selecionado.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
