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

import { CarregadorPlanejamento } from './src/state/CarregadorPlanejamento';

import { ExclusoesPlanejamentoProvider } from './src/state/ExclusoesPlanejamentoContext';
import { MedidorFluidez } from './src/components/MedidorFluidez';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OpcoesDaJanelaProvider } from './src/navigation/OpcoesDaJanela';
import { CampaignsProvider } from './src/state/CampaignsContext';
import { DiariosProvider } from './src/state/DiariosContext';
import { EpicsProvider } from './src/state/EpicsContext';
import { MissionsProvider } from './src/state/MissionsContext';
import { OnboardingProvider } from './src/state/OnboardingContext';
import { SessaoProvider, useSessao } from './src/state/SessaoContext';
import { SincronizadorDeFuso } from './src/state/SincronizadorDeFuso';
import { LojaProvider } from './src/state/LojaContext';
import { SessaoGate } from './src/navigation/SessaoGate';

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
      <OpcoesDaJanelaProvider>
        <SessaoProvider>
          <SessaoGate>
            <ConteudoDaSessao />
          </SessaoGate>
        </SessaoProvider>
      </OpcoesDaJanelaProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

export function ConteudoDaSessao() {
  const { sessao } = useSessao();
  return (
    <OnboardingProvider key={sessao?.usuarioId ?? 'visitante'}>
      <ExclusoesPlanejamentoProvider>
        <MissionsProvider initialMissions={[]}>
          <EpicsProvider initialEpics={[]}>
            <CampaignsProvider initialCampaigns={[]}>
              <DiariosProvider>
                <SincronizadorDeFuso>
                  <CarregadorPlanejamento>
                    <LojaProvider>
                      <NavigationContainer>
                        <MedidorFluidez>
                          <RootNavigator />
                        </MedidorFluidez>
                      </NavigationContainer>
                    </LojaProvider>
                  </CarregadorPlanejamento>
                </SincronizadorDeFuso>
              </DiariosProvider>
            </CampaignsProvider>
          </EpicsProvider>
        </MissionsProvider>
      </ExclusoesPlanejamentoProvider>
    </OnboardingProvider>
  );
}
