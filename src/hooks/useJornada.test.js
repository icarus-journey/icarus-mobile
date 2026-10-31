import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useJornada } from './useJornada';
import { jornadaDeTeste } from '../testUtils/dadosJornada';

let mockUsuario = 'titular';
const mockRequisitar = jest.fn();
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: mockUsuario }, requisitarAutenticado: mockRequisitar }),
}));
let eventos, eventoApp, removerApp, navigation;
beforeEach(() => {
  mockUsuario = 'titular';
  mockRequisitar.mockReset().mockResolvedValue(jornadaDeTeste());
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

it('carrega o saldo e a sequência calculados pela API', async () => {
  const { result } = renderHook(() => useJornada(navigation));
  await waitFor(() => expect(result.current.dados?.sequencia.diasAtuais).toBe(3));
  expect(result.current.dados.saldoPontos).toBe(1270);
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/jornada');
});

it('recupera uma falha sem deixar saldo ou sequência antigos na tela', async () => {
  mockRequisitar.mockRejectedValueOnce({ status: 503 });
  const { result } = renderHook(() => useJornada(navigation));
  await waitFor(() => expect(result.current.erro).toContain('Tente novamente'));
  expect(result.current.dados).toBeNull();
  act(() => result.current.atualizar());
  await waitFor(() => expect(result.current.dados?.saldoPontos).toBe(1270));
});

it('distingue sessão expirada de sequência zerada', async () => {
  mockRequisitar.mockRejectedValue({ status: 401 });
  const { result } = renderHook(() => useJornada(navigation));
  await waitFor(() => expect(result.current.erro).toContain('sessão terminou'));
  expect(result.current.dados).toBeNull();
});

it('ignora respostas antigas ao trocar de conta e após desfocar', async () => {
  let concluirA;
  mockRequisitar.mockReturnValueOnce(
    new Promise((resolve) => {
      concluirA = resolve;
    }),
  );
  const { result, rerender } = renderHook(() => useJornada(navigation));
  mockUsuario = 'outra';
  mockRequisitar.mockResolvedValue(jornadaDeTeste({ saldoPontos: 80 }));
  rerender({});
  await waitFor(() => expect(result.current.dados?.saldoPontos).toBe(80));
  await act(async () => concluirA(jornadaDeTeste({ saldoPontos: 99999 })));
  expect(result.current.dados.saldoPontos).toBe(80);
  let atrasada;
  mockRequisitar.mockReturnValueOnce(
    new Promise((resolve) => {
      atrasada = resolve;
    }),
  );
  act(() => eventos.focus());
  act(() => eventos.blur());
  await act(async () => atrasada(jornadaDeTeste({ saldoPontos: 99999 })));
  expect(result.current.dados).toBeNull();
});

it('atualiza ao voltar da conclusão ou loja e retomar o app, sem consultar fora de foco', async () => {
  const { result, unmount } = renderHook(() => useJornada(navigation));
  await waitFor(() => expect(result.current.carregando).toBe(false));
  act(() => eventos.blur());
  act(() => eventoApp('active'));
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  mockRequisitar.mockResolvedValue(jornadaDeTeste({ saldoPontos: 1290 }));
  await act(async () => eventos.focus());
  expect(result.current.dados.saldoPontos).toBe(1290);
  await act(async () => eventoApp('active'));
  expect(mockRequisitar).toHaveBeenCalledTimes(3);
  unmount();
  expect(removerApp).toHaveBeenCalled();
});

it('consulta a virada do dia sem incrementar a sequência por conta própria', async () => {
  jest.useFakeTimers();
  const anterior = AppState.currentState;
  AppState.currentState = 'active';
  const { result, unmount } = renderHook(() => useJornada(navigation));
  await act(async () => {});
  const base = jornadaDeTeste();
  mockRequisitar.mockResolvedValue(
    jornadaDeTeste({ sequencia: { ...base.sequencia, hoje: '2026-11-01', realizouHoje: false } }),
  );
  await act(async () => jest.advanceTimersByTime(60000));
  expect(result.current.dados.sequencia.diasAtuais).toBe(3);
  expect(result.current.dados.sequencia.realizouHoje).toBe(false);
  unmount();
  AppState.currentState = anterior;
  jest.useRealTimers();
});
