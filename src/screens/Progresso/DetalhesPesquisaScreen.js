import { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { estilosProgresso } from './estilosProgresso';

export function DetalhesPesquisaScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const pesquisa = route.params.pesquisa;
  const [erroFonte, setErroFonte] = useState('');
  async function abrirFonte() {
    setErroFonte('');
    try {
      await Linking.openURL(pesquisa.url);
    } catch {
      setErroFonte('Não foi possível abrir a publicação. Tente novamente.');
    }
  }
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Estudo e limites" onBack={() => navigation.goBack()} />
        <Text style={estilos.titulo}>{pesquisa.titulo}</Text>
        {[
          ['O que foi observado', pesquisa.achado],
          ['Quem participou', pesquisa.populacao],
          ['Como foi estudado', pesquisa.desenho],
          ['O que foi avaliado', pesquisa.desfecho],
          ['Limites', pesquisa.limites],
        ].map(([titulo, texto]) => (
          <View key={titulo} style={estilos.cartao}>
            <Text style={estilos.rotulo}>{titulo}</Text>
            <Text style={estilos.texto}>{texto}</Text>
          </View>
        ))}
        <Text style={estilos.pequeno}>
          {pesquisa.ano} · DOI {pesquisa.doi}
        </Text>
        {erroFonte ? (
          <Text style={estilos.erro} accessibilityRole="alert">
            {erroFonte}
          </Text>
        ) : null}
        <SecondaryButton label="Abrir publicação original" onPress={abrirFonte} />
      </ScrollView>
    </View>
  );
}
