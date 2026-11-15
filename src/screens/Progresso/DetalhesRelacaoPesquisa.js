import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconeVoltar from '../../assets/icons/icone-voltar-relatorio.svg';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { SecondaryButton } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';
import { colors } from '../../theme/colors';
import { estilosProgresso } from './estilosProgresso';

export function DetalhesRelacaoPesquisa({ navigation, leitura }) {
  const insets = useSafeAreaInsets();
  const [erro, setErro] = useState('');
  async function abrirFonte() {
    setErro('');
    try {
      if (!leitura.urlFonte?.startsWith('https://')) throw new Error('Fonte indisponível');
      await Linking.openURL(leitura.urlFonte);
    } catch {
      setErro('Não foi possível abrir a fonte. Tente novamente.');
    }
  }
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <View style={locais.cabecalho}>
        <ScreenHeader
          title="Dados da pesquisa"
          IconeVoltar={IconeVoltar}
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <Text style={estilos.titulo} accessibilityRole="header">
          {leitura.titulo}
        </Text>
        <View style={[estilos.cartao, locais.cartao]}>
          <Text style={estilos.titulo} accessibilityRole="header">
            {leitura.recomendacao.titulo}
          </Text>
          <Text style={estilos.texto}>{leitura.recomendacao.texto}</Text>
        </View>
        <View style={[estilos.cartao, locais.cartao]}>
          <Text style={estilos.titulo} accessibilityRole="header">
            Dados da pesquisa
          </Text>
          <Text style={estilos.texto}>{leitura.dadosDaPesquisa}</Text>
        </View>
        <Text style={estilos.pequeno}>{leitura.fonte}</Text>
        <SecondaryButton label="Ver fonte oficial" onPress={abrirFonte} />
        {erro ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const locais = StyleSheet.create({
  cabecalho: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  cartao: { borderColor: colors.borderDefault },
});
