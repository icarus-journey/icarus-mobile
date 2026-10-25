import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetalhesDosIndicadores } from '../../components/Analise/DetalhesDosIndicadores';
import { IconeAnalise } from '../../components/Analise/IconeAnalise';
import { ResumoEvolucaoPessoal } from '../../components/Analise/ResumoEvolucaoPessoal';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useRelatorioSemanal } from '../../hooks/useRelatorioSemanal';
import { colors } from '../../theme/colors';
import { nomeDoFuso, periodoCurto } from '../../utils/formatarProgresso';
import { estilosProgresso } from './estilosProgresso';

export function RelatorioSemanalScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { dados, carregando, erro, atualizar, tentarNovamente } = useRelatorioSemanal();
  const [resumo, setResumo] = useState(false);
  const [reflexao, setReflexao] = useState(false);
  const [detalhes, setDetalhes] = useState(false);
  const relatorio = dados?.relatorio;
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Minha semana" onBack={() => navigation.goBack()} />
        {dados?.periodo ? (
          <View style={estilos.linha}>
            <IconeAnalise nome="calendario" tamanho={18} />
            <View style={estilos.textoFlexivel}>
              <Text style={estilos.marca}>{periodoCurto(dados.periodo)}</Text>
              <Text style={estilos.pequeno}>{nomeDoFuso(dados.periodo.fusoHorario)}</Text>
            </View>
          </View>
        ) : null}
        {carregando ? (
          <View style={estilos.cartao}>
            <ActivityIndicator color={colors.brand} />
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              Consultando sua semana…
            </Text>
          </View>
        ) : null}
        {erro ? (
          <View style={estilos.cartao}>
            <Text style={estilos.erro} accessibilityRole="alert">
              {erro}
            </Text>
            <SecondaryButton
              label="Atualizar relatório"
              onPress={atualizar}
              disabled={carregando}
            />
          </View>
        ) : null}
        {relatorio ? (
          <>
            <Text style={estilos.rotulo}>REFLEXÃO COM INTELIGÊNCIA ARTIFICIAL</Text>
            <Text style={estilos.titulo} accessibilityRole="header">
              {relatorio.texto.titulo}
            </Text>
            <View style={[estilos.cartao, locais.ajuste]}>
              <View style={estilos.linha}>
                <IconeAnalise nome="brilho" />
                <Text style={[estilos.rotulo, estilos.textoFlexivel]}>
                  UM PRÓXIMO PASSO POSSÍVEL
                </Text>
              </View>
              <Text style={estilos.texto}>{relatorio.texto.proximoAjuste}</Text>
            </View>
            <View style={estilos.cartao}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ler resumo da semana"
                accessibilityState={{ expanded: resumo }}
                onPress={() => setResumo(!resumo)}
                style={[estilos.entre, locais.controle]}
              >
                <Text style={[estilos.marca, estilos.textoFlexivel]}>Sua semana em palavras</Text>
                <IconeAnalise nome="chevron" />
              </Pressable>
              {resumo ? <Text style={estilos.texto}>{relatorio.texto.resumo}</Text> : null}
              <View style={estilos.divisor} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Uma pergunta para refletir"
                accessibilityState={{ expanded: reflexao }}
                onPress={() => setReflexao(!reflexao)}
                style={[estilos.entre, locais.controle]}
              >
                <Text style={[estilos.marca, estilos.textoFlexivel]}>
                  Uma pergunta para refletir
                </Text>
                <IconeAnalise nome="chevron" />
              </Pressable>
              {reflexao ? <Text style={estilos.texto}>{relatorio.texto.reflexao}</Text> : null}
            </View>
            <Text style={estilos.pequeno}>
              É um convite para pensar. Você escolhe o que faz sentido para sua rotina.
            </Text>
            <ResumoEvolucaoPessoal
              dados={{
                indicadores: relatorio.indicadores,
                mensagem: 'Missões registradas nesta semana.',
              }}
            />
          </>
        ) : dados ? (
          <View style={estilos.cartao}>
            <IconeAnalise nome="brilho" tamanho={28} />
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              {dados.mensagem}
            </Text>
          </View>
        ) : null}
        {dados?.estado === 'processando' ? (
          <SecondaryButton label="Atualizar relatório" onPress={atualizar} disabled={carregando} />
        ) : null}
        {dados?.podeTentarNovamente ? (
          <PrimaryButton
            label="Tentar gerar novamente"
            onPress={tentarNovamente}
            disabled={carregando}
          />
        ) : null}
        <SecondaryButton
          label="Explorar pesquisas para minha rotina"
          onPress={() => navigation.push('ProgressoScreen', { aba: 'publico' })}
        />
        <Text style={estilos.pequeno}>
          As pesquisas mostram dados de outras pessoas. Elas ficam separadas desta reflexão sobre
          sua semana.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sobre estes números"
          onPress={() => setDetalhes(true)}
          style={estilos.botaoTexto}
        >
          <IconeAnalise nome="info" tamanho={18} />
          <Text style={estilos.marca}>Sobre estes números</Text>
        </Pressable>
      </ScrollView>
      <DetalhesDosIndicadores
        visivel={detalhes}
        onFechar={() => setDetalhes(false)}
        dados={{ periodo: dados?.periodo, indicadores: relatorio?.indicadores }}
      />
    </View>
  );
}

const locais = StyleSheet.create({
  controle: { minHeight: 44 },
  ajuste: { backgroundColor: colors.softPurple, borderColor: colors.softPurple },
});
