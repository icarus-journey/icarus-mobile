import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { requireOptionalNativeModule } from 'expo';

import { DitadoPorVoz } from './DitadoPorVoz';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (efeito) => require('react').useEffect(efeito, [efeito]),
}));
jest.mock('expo', () => {
  const modulo = {
    addListener: jest.fn(),
    abort: jest.fn(),
    stop: jest.fn(),
    start: jest.fn(),
    isRecognitionAvailable: jest.fn(),
    supportsOnDeviceRecognition: jest.fn(),
    requestMicrophonePermissionsAsync: jest.fn(),
  };
  return { requireOptionalNativeModule: jest.fn(() => modulo) };
});

const modulo = requireOptionalNativeModule.mock.results[0].value;
let ouvintes;
beforeEach(() => {
  jest.clearAllMocks();
  ouvintes = {};
  modulo.addListener.mockImplementation((evento, ouvir) => {
    ouvintes[evento] = ouvir;
    return {
      remove: () => {
        delete ouvintes[evento];
      },
    };
  });
  modulo.isRecognitionAvailable.mockReturnValue(true);
  modulo.supportsOnDeviceRecognition.mockReturnValue(true);
  modulo.requestMicrophonePermissionsAsync.mockResolvedValue({ granted: true });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it('transcreve em português no dispositivo e substitui resultados parciais sem duplicar texto', async () => {
  const alterar = jest.fn();
  const tela = render(<DitadoPorVoz textoAtual="Hoje estudei." onTextoChange={alterar} />);
  await act(async () => fireEvent.press(screen.getByLabelText('Ditar texto')));
  expect(modulo.start).toHaveBeenCalledWith(
    expect.objectContaining({
      lang: 'pt-BR',
      requiresOnDeviceRecognition: true,
      interimResults: true,
    }),
  );
  act(() => {
    ouvintes.start();
    ouvintes.result({ results: [{ transcript: 'Mais' }] });
  });
  expect(alterar).toHaveBeenLastCalledWith('Hoje estudei. Mais');
  tela.rerender(<DitadoPorVoz textoAtual="Hoje estudei. Mais" onTextoChange={alterar} />);
  act(() => ouvintes.result({ results: [{ transcript: 'Mais um módulo.' }] }));
  expect(alterar).toHaveBeenLastCalledWith('Hoje estudei. Mais um módulo.');
  fireEvent.press(screen.getByLabelText('Concluir ditado'));
  expect(modulo.stop).toHaveBeenCalledTimes(1);
});

it('não inicia o microfone quando a permissão é negada', async () => {
  modulo.requestMicrophonePermissionsAsync.mockResolvedValue({ granted: false });
  render(<DitadoPorVoz textoAtual="" onTextoChange={jest.fn()} />);
  await act(async () => fireEvent.press(screen.getByLabelText('Ditar texto')));
  expect(modulo.start).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(
    expect.any(String),
    'Permita o acesso ao microfone para usar o ditado.',
  );
});

it('mantém o texto e informa quando o reconhecimento local está indisponível', async () => {
  modulo.supportsOnDeviceRecognition.mockReturnValue(false);
  const alterar = jest.fn();
  render(<DitadoPorVoz textoAtual="Meu registro" onTextoChange={alterar} />);
  await act(async () => fireEvent.press(screen.getByLabelText('Ditar texto')));
  expect(modulo.start).not.toHaveBeenCalled();
  expect(alterar).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledWith(
    expect.any(String),
    expect.stringContaining('não está disponível'),
  );
});

it('aborta ao sair e ignora uma permissão concedida depois de fechar a tela', async () => {
  let permitir;
  modulo.requestMicrophonePermissionsAsync.mockReturnValue(
    new Promise((resolve) => {
      permitir = resolve;
    }),
  );
  const tela = render(<DitadoPorVoz textoAtual="" onTextoChange={jest.fn()} />);
  fireEvent.press(screen.getByLabelText('Ditar texto'));
  tela.unmount();
  await act(async () => permitir({ granted: true }));
  expect(modulo.abort).toHaveBeenCalled();
  expect(modulo.start).not.toHaveBeenCalled();
  expect(Object.keys(ouvintes)).toHaveLength(0);
});

it('respeita o limite do diário sem apagar o que já estava escrito', async () => {
  const alterar = jest.fn();
  const texto = 'a'.repeat(9998);
  render(<DitadoPorVoz textoAtual={texto} onTextoChange={alterar} />);
  await act(async () => fireEvent.press(screen.getByLabelText('Ditar texto')));
  act(() => ouvintes.result({ results: [{ transcript: 'novo texto' }] }));
  expect(alterar.mock.calls[0][0]).toHaveLength(10000);
  expect(alterar.mock.calls[0][0].startsWith(texto)).toBe(true);
});
