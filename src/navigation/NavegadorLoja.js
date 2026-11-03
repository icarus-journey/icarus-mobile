import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LojaScreen } from '../screens/Loja/LojaScreen';
import { ExtratoScreen } from '../screens/Extrato/ExtratoScreen';
import { MovimentoExtratoScreen } from '../screens/Extrato/MovimentoExtratoScreen';
import { FormularioRecompensaScreen } from '../screens/Loja/FormularioRecompensaScreen';
import { useOpcoesDaJanela } from './OpcoesDaJanela';

const Stack = createNativeStackNavigator();

export function NavegadorLoja({ route }) {
  const opcoesDaJanela = useOpcoesDaJanela();
  return (
    <Stack.Navigator
      initialRouteName={route.params?.telaInicial ?? 'LojaScreen'}
      screenOptions={opcoesDaJanela}
    >
      <Stack.Screen name="LojaScreen" component={LojaScreen} />
      <Stack.Screen name="Extrato" component={ExtratoScreen} />
      <Stack.Screen name="MovimentoExtrato" component={MovimentoExtratoScreen} />
      <Stack.Screen name="FormularioRecompensa" component={FormularioRecompensaScreen} />
    </Stack.Navigator>
  );
}
