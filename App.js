import { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';

import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/state/AuthContext';
import { CampaignsProvider } from './src/state/CampaignsContext';
import { DiariosProvider } from './src/state/DiariosContext';
import { EpicsProvider } from './src/state/EpicsContext';
import { MissionsProvider } from './src/state/MissionsContext';
import { OnboardingProvider } from './src/state/OnboardingContext';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AuthProvider>
        <OnboardingProvider>
          <MissionsProvider initialMissions={[]}>
            <EpicsProvider initialEpics={[]}>
              <CampaignsProvider initialCampaigns={[]}>
                <DiariosProvider initialEntries={[]}>
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                </DiariosProvider>
              </CampaignsProvider>
            </EpicsProvider>
          </MissionsProvider>
        </OnboardingProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
