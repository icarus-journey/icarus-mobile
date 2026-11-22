import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import {
  RelatarProblemaScreen,
  RelatoEnviadoScreen,
} from '../screens/Suporte/RelatarProblemaScreen';
import { DetalheRelatoScreen, MeusRelatosScreen } from '../screens/Suporte/MeusRelatosScreen';
import { useSessao } from '../state/SessaoContext';
import { AbasPrincipais } from './AbasPrincipais';
import { useOpcoesDaJanela } from './OpcoesDaJanela';

const Stack = createNativeStackNavigator();

export function RootNavigator({ initialRouteName }) {
  const { sessao, novaConta } = useSessao();
  const opcoesDaJanela = useOpcoesDaJanela();
  if (!sessao) {
    return (
      <Stack.Navigator key="visitante" screenOptions={opcoesDaJanela}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }
  return (
    <Stack.Navigator
      key={sessao.usuarioId}
      screenOptions={opcoesDaJanela}
      initialRouteName={
        initialRouteName === 'Onboarding' || (!initialRouteName && novaConta)
          ? 'Onboarding'
          : 'AreaPrincipal'
      }
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="AreaPrincipal"
        component={AbasPrincipais}
        initialParams={{
          telaInicial: initialRouteName === 'Onboarding' ? undefined : initialRouteName,
        }}
      />
      <Stack.Screen name="RelatarProblema" component={RelatarProblemaScreen} />
      <Stack.Screen name="RelatoEnviado" component={RelatoEnviadoScreen} />
      <Stack.Screen name="MeusRelatos" component={MeusRelatosScreen} />
      <Stack.Screen name="DetalheRelato" component={DetalheRelatoScreen} />
    </Stack.Navigator>
  );
}
