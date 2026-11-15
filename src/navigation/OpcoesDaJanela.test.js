import { AccessibilityInfo, AppState, Keyboard, Platform, Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';

import { OpcoesDaJanelaProvider, useOpcoesDaJanela } from './OpcoesDaJanela';

let eventos, remover;
const plataformaOriginal = Platform.OS;
const estadoOriginal = AppState.currentState;

function Visor() {
  const opcoes = useOpcoesDaJanela();
  return <Text testID="janela">{JSON.stringify(opcoes)}</Text>;
}

function montar() {
  return render(
    <OpcoesDaJanelaProvider>
      <Visor />
    </OpcoesDaJanelaProvider>,
  );
}

async function montarPronto() {
  const tela = montar();
  await act(async () => {});
  return tela;
}

function opcoes() {
  return JSON.parse(screen.getByTestId('janela').props.children);
}

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
  AppState.currentState = 'active';
  eventos = {};
  remover = jest.fn();
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
  jest.spyOn(Keyboard, 'isVisible').mockReturnValue(false);
  for (const [objeto, metodo] of [
    [AccessibilityInfo, 'addEventListener'],
    [AppState, 'addEventListener'],
    [Keyboard, 'addListener'],
  ]) {
    jest.spyOn(objeto, metodo).mockImplementation((evento, ouvir) => {
      eventos[evento] = ouvir;
      return { remove: remover };
    });
  }
});

afterEach(() => {
  jest.restoreAllMocks();
  Platform.OS = plataformaOriginal;
  AppState.currentState = estadoOriginal;
});

it('aguarda a consulta de acessibilidade antes de ocultar a barra inferior', async () => {
  let responder;
  AccessibilityInfo.isScreenReaderEnabled.mockImplementationOnce(
    () =>
      new Promise((resolver) => {
        responder = resolver;
      }),
  );
  montar();
  expect(opcoes().navigationBarHidden).toBe(false);
  await act(async () => responder(false));
  expect(opcoes()).toEqual({ headerShown: false, navigationBarHidden: true });
});

it('mantém os controles do sistema visíveis com teclado e restaura a ocultação ao fechá-lo', async () => {
  await montarPronto();
  expect(opcoes().navigationBarHidden).toBe(true);
  act(() => eventos.keyboardDidShow());
  expect(opcoes().navigationBarHidden).toBe(false);
  act(() => eventos.keyboardDidHide());
  expect(opcoes().navigationBarHidden).toBe(true);
});

it('respeita um teclado já aberto na montagem', async () => {
  Keyboard.isVisible.mockReturnValueOnce(true);
  await montarPronto();
  expect(opcoes().navigationBarHidden).toBe(false);
});

it('reativa os controles do sistema se um leitor de tela for ligado durante o uso', async () => {
  await montarPronto();
  act(() => eventos.screenReaderChanged(true));
  expect(opcoes().navigationBarHidden).toBe(false);
  act(() => eventos.screenReaderChanged(false));
  expect(opcoes().navigationBarHidden).toBe(true);
});

it('resposta inicial atrasada não sobrescreve a ativação mais recente do leitor de tela', async () => {
  let responder;
  AccessibilityInfo.isScreenReaderEnabled.mockImplementationOnce(
    () =>
      new Promise((resolver) => {
        responder = resolver;
      }),
  );
  montar();
  act(() => eventos.screenReaderChanged(true));
  await act(async () => responder(false));
  expect(opcoes().navigationBarHidden).toBe(false);
});

it('não oculta a barra se a consulta de acessibilidade falhar', async () => {
  AccessibilityInfo.isScreenReaderEnabled.mockRejectedValueOnce(new Error('Indisponível'));
  await montarPronto();
  expect(opcoes().navigationBarHidden).toBe(false);
});

it('reaplica ao retomar o aplicativo, respeitando o teclado ainda aberto', async () => {
  await montarPronto();
  act(() => eventos.change('background'));
  expect(opcoes().navigationBarHidden).toBe(false);
  act(() => {
    eventos.keyboardDidShow();
    eventos.change('active');
  });
  expect(opcoes().navigationBarHidden).toBe(false);
  act(() => eventos.keyboardDidHide());
  expect(opcoes().navigationBarHidden).toBe(true);
});

it('no iPhone só solicita a preferência de ocultação do indicador, preservando as áreas seguras', async () => {
  Platform.OS = 'ios';
  await montarPronto();
  expect(opcoes()).toEqual({ headerShown: false, autoHideHomeIndicator: true });
  act(() => eventos.screenReaderChanged(true));
  expect(opcoes().autoHideHomeIndicator).toBe(false);
});

it('outras plataformas mantêm a configuração sem opções nativas', () => {
  Platform.OS = 'web';
  montar();
  expect(opcoes()).toEqual({ headerShown: false });
  expect(AccessibilityInfo.isScreenReaderEnabled).not.toHaveBeenCalled();
});

it('remove todos os ouvintes e descarta a consulta pendente ao desmontar', async () => {
  let responder;
  AccessibilityInfo.isScreenReaderEnabled.mockImplementationOnce(
    () =>
      new Promise((resolver) => {
        responder = resolver;
      }),
  );
  const tela = montar();
  tela.unmount();
  expect(remover).toHaveBeenCalledTimes(4);
  await act(async () => responder(false));
  expect(tela.toJSON()).toBeNull();
});
