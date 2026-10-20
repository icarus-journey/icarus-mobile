import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { ResumoEvolucaoPessoal } from '../../components/Analise/ResumoEvolucaoPessoal';
import { estilosAnalise as estilos } from '../../components/Analise/estilosAnalise';
import { formatarPeriodo } from '../../components/Analise/formatarPeriodo';
import { useRelatorioSemanal } from '../../hooks/useRelatorioSemanal';
import { colors } from '../../theme/colors';
import { estilosProgresso } from './estilosProgresso';

export function RelatorioSemanalScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { dados, carregando, erro, atualizar, tentarNovamente } = useRelatorioSemanal();
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Minha semana" onBack={() => navigation.goBack()} />
        {dados?.periodo ? (
          <Text style={estilos.texto}>{formatarPeriodo(dados.periodo)}</Text>
        ) : null}
        {carregando ? (
          <>
            <ActivityIndicator color={colors.brand} />
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              Consultando sua semana…
            </Text>
          </>
        ) : null}
        {erro ? (
          <>
            <Text style={estilos.erro} accessibilityRole="alert">
              {erro}
            </Text>
            <SecondaryButton
              label="Atualizar relatório"
              onPress={atualizar}
              disabled={carregando}
            />
          </>
        ) : null}
        {dados ? (
          <>
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              {dados.mensagem}
            </Text>
            {dados.relatorio ? (
              <>
                <Text style={estilos.rotulo}>Síntese gerada com inteligência artificial</Text>
                <Text style={estilos.titulo} accessibilityRole="header">
                  {dados.relatorio.texto.titulo}
                </Text>
                <Text style={estilos.texto}>{dados.relatorio.texto.resumo}</Text>
                <Text style={estilos.titulo} accessibilityRole="header">
                  Seu próximo ajuste
                </Text>
                <Text style={estilos.texto}>{dados.relatorio.texto.proximoAjuste}</Text>
                <Text style={estilos.titulo} accessibilityRole="header">
                  Uma reflexão opcional
                </Text>
                <Text style={estilos.texto}>{dados.relatorio.texto.reflexao}</Text>
                <Text style={estilos.texto}>
                  Você pode ignorar a reflexão. Esta síntese usa apenas os registros disponíveis no
                  aplicativo.
                </Text>
                <ResumoEvolucaoPessoal
                  dados={{
                    indicadores: dados.relatorio.indicadores,
                    mensagem: 'Registros utilizados nesta síntese.',
                  }}
                />
              </>
            ) : null}
            {dados.estado === 'processando' ? (
              <SecondaryButton
                label="Atualizar relatório"
                onPress={atualizar}
                disabled={carregando}
              />
            ) : null}
            {dados.podeTentarNovamente ? (
              <PrimaryButton
                label="Tentar gerar novamente"
                onPress={tentarNovamente}
                disabled={carregando}
              />
            ) : null}
          </>
        ) : null}
        <Text style={estilos.titulo} accessibilityRole="header">
          Contexto público, separado da sua semana
        </Text>
        <Text style={estilos.texto}>
          As referências de 2024 não medem seus hábitos pessoais e não foram usadas para redigir
          esta síntese.
        </Text>
        <SecondaryButton
          label="Contexto para sua jornada"
          onPress={() => navigation.navigate('ProgressoScreen')}
        />
      </ScrollView>
    </View>
  );
}
