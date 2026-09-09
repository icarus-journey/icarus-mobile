import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { CampaignFormScreen } from '../screens/CampaignForm/CampaignFormScreen';
import { EpicDetailScreen } from '../screens/EpicDetail/EpicDetailScreen';
import { EpicFormScreen } from '../screens/EpicForm/EpicFormScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { MissionFormScreen } from '../screens/MissionForm/MissionFormScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { PlanningHubScreen } from '../screens/PlanningHub/PlanningHubScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator({ initialRouteName = 'Onboarding' }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MissionList" component={PlanningHubScreen} />
      <Stack.Screen name="MissionForm" component={MissionFormScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="EpicForm" component={EpicFormScreen} />
      <Stack.Screen name="EpicDetail" component={EpicDetailScreen} />
      <Stack.Screen name="CampaignForm" component={CampaignFormScreen} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
    </Stack.Navigator>
  );
}
