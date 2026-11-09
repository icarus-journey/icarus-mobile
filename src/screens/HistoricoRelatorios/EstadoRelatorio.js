import { ActivityIndicator, Text, View } from 'react-native';
import { SecondaryButton } from '../../components/Button';
import { colors } from '../../theme/colors';
import { estilos as e } from './styles';
export function EstadoRelatorio({ estado }) {
  if (estado.carregando)
    return (
      <View style={e.cartao}>
        <ActivityIndicator color={colors.brand} />
        <Text style={e.texto} accessibilityLiveRegion="polite">
          Buscando seu relatório…
        </Text>
      </View>
    );
  if (!estado.erro) return null;
  return (
    <View style={e.cartao}>
      <Text style={e.erro} accessibilityRole="alert">
        {estado.erro}
      </Text>
      {!estado.expirada ? (
        <SecondaryButton
          style={e.botao}
          estiloRotulo={e.rotuloBotao}
          label="Tentar novamente"
          onPress={estado.repetir}
        />
      ) : null}
    </View>
  );
}
