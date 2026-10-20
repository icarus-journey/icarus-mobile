import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { estilosAnalise as estilos } from '../../components/Analise/estilosAnalise';
import { ValoresDaReferencia } from '../../components/Analise/ValoresDaReferencia';
import { tipoDiaDaReferencia } from '../../components/Analise/formatarReferencia';
import { estilosProgresso } from './estilosProgresso';

function nomeDaOrigem(fonte) {
  return (
    {
      atus_activity: 'ATUS — atividades',
      atus_activity_summary: 'ATUS — resumo de atividades',
      atus_respondent: 'ATUS — participantes',
      vigitel_harmonizado: 'Vigitel',
    }[fonte] ?? 'Pesquisa pública'
  );
}

export function DetalhesDaReferenciaScreen({ navigation, route }) {
  const { referencia } = route.params;
  const { dados, recorte, origens } = referencia;
  const insets = useSafeAreaInsets();
  const [erro, setErro] = useState('');
  async function abrirFonte(url) {
    try {
      if (!url?.startsWith('https://')) throw new Error('Fonte indisponível');
      await Linking.openURL(url);
    } catch {
      setErro('Não foi possível abrir a fonte. Tente novamente.');
    }
  }
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Entender os dados" onBack={() => navigation.goBack()} />
        <Text style={estilos.rotulo}>
          {dados.fonte} · edição {dados.edicao} · {referencia.pais}
        </Text>
        <Text style={estilos.titulo} accessibilityRole="header">
          {dados.titulo}
        </Text>
        <ValoresDaReferencia dados={dados} />
        <Text style={estilos.texto}>{dados.populacao}</Text>
        <Text style={estilos.texto}>
          Faixa efetiva: {recorte.faixaEfetiva} anos. {tipoDiaDaReferencia(recorte.tipoDiaEfetivo)}.
        </Text>
        <Text style={estilos.texto}>
          Estudo:{' '}
          {recorte.filtrosEfetivos.estuda == null
            ? 'sem filtro'
            : recorte.filtrosEfetivos.estuda
              ? 'matriculados'
              : 'não matriculados'}
          . Trabalho:{' '}
          {recorte.filtrosEfetivos.trabalha == null
            ? 'sem filtro'
            : recorte.filtrosEfetivos.trabalha
              ? 'ocupados'
              : 'não ocupados'}
          .
        </Text>
        {recorte.avisos.map((aviso) => (
          <Text key={aviso} style={estilos.aviso}>
            {aviso}
          </Text>
        ))}
        <Text style={estilos.titulo} accessibilityRole="header">
          Como ler
        </Text>
        <Text style={estilos.texto}>{dados.denominador}</Text>
        <Text style={estilos.titulo} accessibilityRole="header">
          Limites da referência
        </Text>
        {dados.limitacoes.map((limite) => (
          <Text key={limite} style={estilos.texto}>
            {limite}
          </Text>
        ))}
        <Text style={estilos.titulo} accessibilityRole="header">
          Origem dos dados
        </Text>
        {origens.map((origem) => (
          <View key={origem.fonte} style={estilos.grupo}>
            <Text style={estilos.texto}>
              {nomeDaOrigem(origem.fonte)} · arquivo da edição {origem.edicao}
            </Text>
            <SecondaryButton
              label={`Abrir fonte: ${nomeDaOrigem(origem.fonte)}`}
              onPress={() => abrirFonte(origem.urlFonte)}
            />
          </View>
        ))}
        {erro ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
