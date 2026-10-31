import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
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

import { ExclusoesPlanejamentoProvider } from './src/state/ExclusoesPlanejamentoContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { listarEpicos } from './src/services/epicos';
import { listarMissoesAvulsas } from './src/services/missoes';
import { CampaignsProvider, useCampaigns } from './src/state/CampaignsContext';
import { DiariosProvider } from './src/state/DiariosContext';
import { EpicsProvider, useEpics } from './src/state/EpicsContext';
import { MissionsProvider, useMissions } from './src/state/MissionsContext';
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
      <SessaoProvider>
        <SessaoGate>
          <ConteudoDaSessao />
        </SessaoGate>
      </SessaoProvider>
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
                <CarregadorDeDados />
                <SincronizadorDeFuso />
                <LojaProvider>
                  <NavigationContainer>
                    <RootNavigator />
                  </NavigationContainer>
                </LojaProvider>
              </DiariosProvider>
            </CampaignsProvider>
          </EpicsProvider>
        </MissionsProvider>
      </ExclusoesPlanejamentoProvider>
    </OnboardingProvider>
  );
}

// Busca a jornada ao abrir a sessão e ao voltar ao aplicativo (GET
// /usuarios/{id}/epicos já devolve o grafo inteiro aninhado). Sem isso, tudo que não veio do
// onboarding ou foi criado nesta mesma sessão desapareceria a cada reabertura do app.
function CarregadorDeDados() {
  const { sessao, requisitarAutenticado } = useSessao();
  const { carregarLista: carregarEpicos } = useEpics();
  const { carregarLista: carregarCampanhas } = useCampaigns();
  const { carregarLista: carregarMissoes } = useMissions();

  useEffect(() => {
    if (!sessao?.usuarioId) return;
    let ativo = true;

    let requisicao = 0;
    function atualizar() {
      const numero = ++requisicao;
      Promise.all([
        listarEpicos({ usuarioId: sessao.usuarioId, requisitarAutenticado }),
        listarMissoesAvulsas({ usuarioId: sessao.usuarioId, requisitarAutenticado }),
      ])
        .then(([epicosDoServidor, missoesAvulsasDoServidor]) => {
          if (!ativo || numero !== requisicao) return;
          carregarEpicos(epicosDoServidor);
          carregarCampanhas(epicosDoServidor);
          carregarMissoes(epicosDoServidor, missoesAvulsasDoServidor);
        })
        .catch(() => {
          // Falha ao carregar não bloqueia o app — o usuário segue com a lista vazia e pode
          // tentar novamente mais tarde (ex.: criando um novo épico, que recarrega a tela).
        });
    }
    atualizar();
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });

    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, [
    sessao?.usuarioId,
    requisitarAutenticado,
    carregarEpicos,
    carregarCampanhas,
    carregarMissoes,
  ]);

  return null;
}
