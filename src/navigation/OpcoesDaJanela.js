import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, AppState, Keyboard, Platform } from 'react-native';

const OpcoesDaJanelaContext = createContext({ headerShown: false });

export function OpcoesDaJanelaProvider({ children }) {
  const [leitorAtivo, setLeitorAtivo] = useState(null);
  const [tecladoVisivel, setTecladoVisivel] = useState(() => Keyboard.isVisible());
  const [estadoAplicativo, setEstadoAplicativo] = useState(() => AppState.currentState ?? 'active');

  useEffect(() => {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') return undefined;
    let ativo = true;
    let leitorMudou = false;
    const assinaturas = [
      AccessibilityInfo.addEventListener('screenReaderChanged', (habilitado) => {
        leitorMudou = true;
        setLeitorAtivo(habilitado);
      }),
      Keyboard.addListener('keyboardDidShow', () => setTecladoVisivel(true)),
      Keyboard.addListener('keyboardDidHide', () => setTecladoVisivel(false)),
      AppState.addEventListener('change', setEstadoAplicativo),
    ];

    Promise.resolve(AccessibilityInfo.isScreenReaderEnabled())
      .then((habilitado) => {
        if (ativo && !leitorMudou && typeof habilitado === 'boolean') setLeitorAtivo(habilitado);
      })
      .catch(() => {
        // Sem confirmação de acessibilidade, mantém os controles do sistema visíveis.
      });

    return () => {
      ativo = false;
      assinaturas.forEach((assinatura) => assinatura.remove());
    };
  }, []);

  const opcoes = useMemo(() => {
    const ocultar = leitorAtivo === false && !tecladoVisivel && estadoAplicativo === 'active';
    return {
      headerShown: false,
      ...(Platform.OS === 'android' ? { navigationBarHidden: ocultar } : {}),
      ...(Platform.OS === 'ios' ? { autoHideHomeIndicator: ocultar } : {}),
    };
  }, [leitorAtivo, tecladoVisivel, estadoAplicativo]);

  return <OpcoesDaJanelaContext.Provider value={opcoes}>{children}</OpcoesDaJanelaContext.Provider>;
}

export function useOpcoesDaJanela() {
  return useContext(OpcoesDaJanelaContext);
}
