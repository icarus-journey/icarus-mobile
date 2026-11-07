import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useProgresso } from './useProgresso';
import { progressoDeTeste } from '../testUtils/dadosAnaliticos';

let mockUsuarioId = 'pessoa-a';
const mockRequisitar = jest.fn();
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    requisitarAutenticado: mockRequisitar,
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) => require('react').useEffect(callback, [callback]),
}));
const pendente = () => {
  let resolver;
  const promessa = new Promise((resolve) => {
    resolver = resolve;
  });
  return { promessa, resolver: (valor) => resolver(valor) };
};
beforeEach(() => {
  mockUsuarioId = 'pessoa-a';
  mockRequisitar.mockReset();
});

it('troca de sessão esconde os dados anteriores e ignora resposta atrasada', async () => {
  const a = pendente(),
    b = pendente();
  mockRequisitar.mockImplementation((rota) =>
    rota.includes('pessoa-a') ? a.promessa : b.promessa,
  );
  const { result, rerender } = renderHook(() => useProgresso('semanaAnterior'));
  mockUsuarioId = 'pessoa-b';
  rerender();
  expect(result.current.dados).toBeNull();
  await act(async () => {
    a.resolver(progressoDeTeste());
  });
  expect(result.current.dados).toBeNull();
  const dadosB = { ...progressoDeTeste(), mensagem: 'Registros da pessoa B' };
  await act(async () => {
    b.resolver(dadosB);
  });
  await waitFor(() => expect(result.current.dados).toBe(dadosB));
  expect(mockRequisitar).toHaveBeenLastCalledWith(
    '/api/usuarios/pessoa-b/progresso?periodo=semanaAnterior',
    expect.objectContaining({ signal: expect.anything() }),
  );
});

it('troca de período descarta o resultado anterior enquanto carrega o novo', async () => {
  const dados = progressoDeTeste(),
    mes = pendente();
  mockRequisitar.mockResolvedValueOnce(dados).mockImplementation(() => mes.promessa);
  const { result, rerender } = renderHook(({ periodo }) => useProgresso(periodo), {
    initialProps: { periodo: 'semanaAnterior' },
  });
  await waitFor(() => expect(result.current.dados).toBe(dados));
  rerender({ periodo: 'mesAnterior' });
  expect(result.current.dados).toBeNull();
  await act(async () => {
    mes.resolver({ ...dados, mensagem: 'Mês' });
  });
  expect(result.current.dados.mensagem).toBe('Mês');
});

it('sessão expirada e falha de conexão têm recuperação sem mostrar zeros', async () => {
  mockRequisitar.mockRejectedValueOnce({ status: 401 });
  const { result } = renderHook(() => useProgresso('semanaAnterior'));
  await waitFor(() => expect(result.current.erro).toMatch(/Sua sessão terminou/));
  expect(result.current.dados).toBeNull();
  mockRequisitar.mockResolvedValueOnce(progressoDeTeste());
  await act(async () => {
    await result.current.carregar();
  });
  expect(result.current.erro).toBe('');
  expect(result.current.dados).toBeTruthy();
});
