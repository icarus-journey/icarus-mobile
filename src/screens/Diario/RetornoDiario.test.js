import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { DiariosProvider } from '../../state/DiariosContext';
import { DiarioScreen } from './DiarioScreen';

const mockRequisitar = jest.fn();
let mockFocar;
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: 'pessoa-a' },
    requisitarAutenticado: mockRequisitar,
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) =>
    require('react').useEffect(() => {
      mockFocar = callback;
      return callback();
    }, [callback]),
}));
const antiga = {
  id: 1,
  tipo: 'reflexao',
  texto: 'Respeitei meu ritmo.',
  dataRegistro: '2026-11-01',
  criadaEm: '2026-11-01T18:00:00Z',
};
function tela() {
  return (
    <DiariosProvider>
      <DiarioScreen navigation={{ navigate: jest.fn() }} />
    </DiariosProvider>
  );
}
function pendente() {
  let resolver;
  const promessa = new Promise((r) => {
    resolver = r;
  });
  return { promessa, resolver: (valor) => resolver(valor) };
}
beforeEach(() => {
  jest.useFakeTimers();
  mockRequisitar.mockReset().mockResolvedValue([antiga]);
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it('permite registrar enquanto consulta o histórico pela primeira vez', async () => {
  const consulta = pendente();
  mockRequisitar.mockReturnValueOnce(consulta.promessa);
  render(tela());
  expect(screen.getByLabelText('Registrar reflexão')).toBeEnabled();
  expect(screen.getByText('Carregando histórico…')).toBeTruthy();
  await act(async () => consulta.resolver([antiga]));
  expect(screen.queryByLabelText('Atualizar histórico')).toBeNull();
});

it.each([true, false])(
  'mantém o histórico e o botão estáveis durante atualização (com entradas: %s)',
  async (temEntradas) => {
    mockRequisitar.mockResolvedValueOnce(temEntradas ? [antiga] : []);
    render(tela());
    const texto = temEntradas ? antiga.texto : 'Seu diário começa aqui';
    await screen.findByText(texto);
    const consulta = pendente();
    mockRequisitar.mockReturnValueOnce(consulta.promessa);
    act(() => mockFocar());
    expect(screen.getByText(texto)).toBeTruthy();
    expect(screen.getByLabelText('Registrar reflexão')).toBeEnabled();
    expect(screen.queryByText('Carregando histórico…')).toBeNull();
    expect(screen.queryByLabelText('Atualizar histórico')).toBeNull();
    await act(async () => consulta.resolver(temEntradas ? [antiga] : []));
  },
);

it('salva durante a primeira consulta e recupera o restante do histórico sem aceitar a resposta antiga', async () => {
  const consulta = pendente();
  const nova = { ...antiga, id: 2, texto: 'Terminei com calma.' };
  mockRequisitar
    .mockReturnValueOnce(consulta.promessa)
    .mockResolvedValueOnce(nova)
    .mockResolvedValueOnce([nova, antiga]);
  render(tela());
  const sinal = mockRequisitar.mock.calls[0][1].signal;
  fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), nova.texto);
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  await screen.findByText('Entrada salva no seu diário.');
  await screen.findByText(antiga.texto);
  expect(sinal.aborted).toBe(true);
  expect(screen.getByText(nova.texto)).toBeTruthy();
  await act(async () => consulta.resolver([antiga]));
  expect(screen.getByText(nova.texto)).toBeTruthy();
  await waitFor(() => expect(mockRequisitar).toHaveBeenCalledTimes(3));
});
