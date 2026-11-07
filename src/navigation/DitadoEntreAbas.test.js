import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { requireOptionalNativeModule } from 'expo';

import { DiariosProvider } from '../state/DiariosContext';
import { AbasPrincipais } from './AbasPrincipais';

jest.mock('./NavegadorMissoes', () => ({
  NavegadorMissoes: () => {
    const { Text } = require('react-native');
    return <Text>Início das missões</Text>;
  },
}));
jest.mock('./NavegadorLoja', () => ({ NavegadorLoja: () => null }));
jest.mock('../screens/Conta/ContaScreen', () => ({ ContaScreen: () => null }));
const mockRequisitar = jest.fn(async () => []);
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'pessoa' }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('expo', () => ({
  requireOptionalNativeModule: jest.fn(() => ({
    addListener: jest.fn(),
    abort: jest.fn(),
    stop: jest.fn(),
    start: jest.fn(),
    isRecognitionAvailable: jest.fn(() => true),
    supportsOnDeviceRecognition: jest.fn(() => true),
    requestMicrophonePermissionsAsync: jest.fn(),
  })),
}));

const modulo = requireOptionalNativeModule.mock.results[0].value;
let ouvintes;
beforeEach(() => {
  jest.clearAllMocks();
  ouvintes = {};
  modulo.requestMicrophonePermissionsAsync.mockResolvedValue({ granted: true });
  modulo.addListener.mockImplementation((evento, ouvir) => {
    ouvintes[evento] = ouvir;
    return { remove: () => delete ouvintes[evento] };
  });
});

async function abrirDiario() {
  render(
    <NavigationContainer>
      <DiariosProvider>
        <AbasPrincipais route={{}} />
      </DiariosProvider>
    </NavigationContainer>,
  );
  fireEvent.press(screen.getByRole('tab', { name: 'Diário' }));
  await screen.findByText('Seu diário começa aqui');
}

it('trocar de aba aborta o microfone, ignora eventos tardios e preserva o rascunho', async () => {
  await abrirDiario();
  await act(async () => fireEvent.press(screen.getByLabelText('Ditar texto')));
  act(() => {
    ouvintes.start();
    ouvintes.result({ results: [{ transcript: 'Rascunho ditado' }] });
  });
  expect(screen.getByLabelText('Reflexão de hoje').props.value).toBe('Rascunho ditado');
  const resultadoAntigo = ouvintes.result;
  fireEvent.press(screen.getByRole('tab', { name: 'Missões' }));
  expect(modulo.abort).toHaveBeenCalledTimes(1);
  expect(ouvintes.result).toBeUndefined();
  act(() => resultadoAntigo({ results: [{ transcript: 'Evento recebido depois de sair' }] }));
  fireEvent.press(screen.getByRole('tab', { name: 'Diário' }));
  await screen.findByText('Seu diário começa aqui');
  act(() => resultadoAntigo({ results: [{ transcript: 'Evento do foco anterior' }] }));
  expect(screen.getByLabelText('Reflexão de hoje').props.value).toBe('Rascunho ditado');
  expect(screen.getByLabelText('Ditar texto')).toBeTruthy();
});

it('permissão concedida depois de trocar de aba não inicia o microfone', async () => {
  let autorizar;
  modulo.requestMicrophonePermissionsAsync.mockImplementationOnce(
    () =>
      new Promise((resolver) => {
        autorizar = resolver;
      }),
  );
  await abrirDiario();
  act(() => {
    fireEvent.press(screen.getByLabelText('Ditar texto'));
  });
  fireEvent.press(screen.getByRole('tab', { name: 'Missões' }));
  fireEvent.press(screen.getByRole('tab', { name: 'Diário' }));
  await act(async () => autorizar({ granted: true }));
  expect(modulo.start).not.toHaveBeenCalled();
});
