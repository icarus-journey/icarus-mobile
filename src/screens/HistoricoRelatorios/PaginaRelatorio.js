import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconeVoltar from '../../assets/icons/icone-voltar-relatorio.svg';
import { ScreenHeader } from '../../components/ScreenHeader';
import { estilos as e } from './styles';
export function CabecalhoRelatorio({ titulo, aoVoltar }) {
  return (
    <View style={e.cabecalho}>
      <ScreenHeader
        title={titulo}
        onBack={aoVoltar}
        IconeVoltar={IconeVoltar}
        estiloTitulo={e.tituloCabecalho}
        style={e.semMargem}
      />
    </View>
  );
}
export function PaginaRelatorio({ titulo, aoVoltar, children }) {
  const margens = useSafeAreaInsets();
  return (
    <View style={[e.tela, { paddingTop: margens.top }]}>
      <CabecalhoRelatorio titulo={titulo} aoVoltar={aoVoltar} />
      <ScrollView contentContainerStyle={[e.conteudo, { paddingBottom: margens.bottom + 32 }]}>
        {children}
      </ScrollView>
    </View>
  );
}
