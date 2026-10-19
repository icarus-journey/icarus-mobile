import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { CampaignFormScreen } from '../screens/CampaignForm/CampaignFormScreen';
import { DiarioScreen } from '../screens/Diario/DiarioScreen';
import { EpicDetailScreen } from '../screens/EpicDetail/EpicDetailScreen';
import { EpicFormScreen } from '../screens/EpicForm/EpicFormScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { MissionFormScreen } from '../screens/MissionForm/MissionFormScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { PlanningHubScreen } from '../screens/PlanningHub/PlanningHubScreen';
import { ContaScreen } from '../screens/Conta/ContaScreen';
import { useSessao } from '../state/SessaoContext';

const Stack = createNativeStackNavigator();

export function RootNavigator({ initialRouteName }) {
  const { sessao, novaConta } = useSessao();
  if (!sessao) {
    return (
      <Stack.Navigator key="visitante" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }
  return (
    <Stack.Navigator
      key={sessao.usuarioId}
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName ?? (novaConta ? 'Onboarding' : 'MissionList')}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MissionList" component={PlanningHubScreen} />
      <Stack.Screen name="Diario" component={DiarioScreen} />
      <Stack.Screen name="MissionForm" component={MissionFormScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="EpicForm" component={EpicFormScreen} />
      <Stack.Screen name="EpicDetail" component={EpicDetailScreen} />
      <Stack.Screen name="CampaignForm" component={CampaignFormScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <Stack.Screen name="Conta" component={ContaScreen} />
    </Stack.Navigator>
  );
}
