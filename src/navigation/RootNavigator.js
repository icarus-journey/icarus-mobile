import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { MissionFormScreen } from '../screens/MissionForm/MissionFormScreen';
import { MissionListScreen } from '../screens/MissionList/MissionListScreen';
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator({ initialRouteName = 'Onboarding' }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MissionList" component={MissionListScreen} />
      <Stack.Screen name="MissionForm" component={MissionFormScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
    </Stack.Navigator>
  );
}
