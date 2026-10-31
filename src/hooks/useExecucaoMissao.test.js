import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useExecucaoMissao } from './useExecucaoMissao';

let mockUsuario = 'titular';
const mockRequisitar = jest.fn();
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: mockUsuario }, requisitarAutenticado: mockRequisitar }),
}));
const disponivel = { execucao: { ocorrenciaId: 40, podeConcluir: true, hoje: '2026-10-30' } };
let eventos;
let eventoApp;
let removerApp;
let navigation;
beforeEach(() => {
  mockUsuario = 'titular';
  mockRequisitar.mockReset().mockResolvedValue(disponivel);
  eventos = {};
  removerApp = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((tipo, callback) => {
    eventoApp = callback;
    return { remove: removerApp };
  });
  navigation = {
    isFocused: () => true,
    addListener: (tipo, callback) => {
      eventos[tipo] = callback;
      return jest.fn();
    },
  };
});
afterEach(() => jest.restoreAllMocks());

it('consulta a execução por HTTP autenticado e entrega metadados calculados pela API', async () => {
  const aoReceber = jest.fn();
  const { result } = renderHook(() => useExecucaoMissao(4, navigation, aoReceber));
  await waitFor(() => expect(result.current.dados).toEqual(disponivel));
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/missoes/4');
  expect(aoReceber).toHaveBeenCalledWith(4, disponivel);
});

it('falha sem execução no contrato e permite nova tentativa', async () => {
  mockRequisitar.mockResolvedValueOnce({ id: 4 });
  const { result } = renderHook(() => useExecucaoMissao(4, navigation));
  await waitFor(() => expect(result.current.erro).toContain('Tente novamente'));
  expect(result.current.dados).toBeNull();
  act(() => result.current.atualizar());
  expect(result.current.carregando).toBe(true);
  await waitFor(() => expect(result.current.dados).toEqual(disponivel));
});

it.each([401, 404, 409, 503])('não oferece execução após HTTP %s', async (status) => {
  mockRequisitar.mockRejectedValue({ status });
  const { result } = renderHook(() => useExecucaoMissao(4, navigation));
  await waitFor(() => expect(result.current.carregando).toBe(false));
  expect(result.current.dados).toBeNull();
  expect(result.current.erro).toBeTruthy();
});

it('descarta resposta da sessão anterior e limpa a execução na troca de conta', async () => {
  let responder;
  mockRequisitar.mockReturnValueOnce(
    new Promise((resolve) => {
      responder = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useExecucaoMissao(4, navigation));
  mockUsuario = 'outra-conta';
  mockRequisitar.mockResolvedValue({ execucao: { podeConcluir: false } });
  rerender({});
  await waitFor(() => expect(result.current.dados).toEqual({ execucao: { podeConcluir: false } }));
  await act(async () => responder(disponivel));
  expect(result.current.dados.execucao.podeConcluir).toBe(false);
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/outra-conta/missoes/4');
});

it('consulta ao voltar para a tela e ao retornar do segundo plano, removendo assinaturas', async () => {
  const { result, unmount } = renderHook(() => useExecucaoMissao(4, navigation));
  await waitFor(() => expect(result.current.carregando).toBe(false));
  act(() => eventos.blur());
  act(() => eventoApp('active'));
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  await act(async () => eventos.focus());
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  await act(async () => eventoApp('active'));
  expect(mockRequisitar).toHaveBeenCalledTimes(3);
  unmount();
  expect(removerApp).toHaveBeenCalledTimes(1);
});

it('atualiza após um minuto na tela ativa para atravessar a virada do dia', async () => {
  jest.useFakeTimers();
  const estadoAnterior = AppState.currentState;
  AppState.currentState = 'active';
  const { result, unmount } = renderHook(() => useExecucaoMissao(4, navigation));
  await act(async () => {});
  const amanha = { execucao: { podeConcluir: true, hoje: '2026-10-31' } };
  mockRequisitar.mockResolvedValue(amanha);
  await act(async () => jest.advanceTimersByTime(60000));
  expect(result.current.dados).toEqual(amanha);
  unmount();
  AppState.currentState = estadoAnterior;
  jest.useRealTimers();
});
