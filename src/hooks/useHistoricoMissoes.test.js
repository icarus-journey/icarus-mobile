import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useHistoricoMissoes } from './useHistoricoMissoes';
import { paginaHistoricoDeTeste, registroHistoricoDeTeste } from '../testUtils/historicoMissoes';
const mockRequisitar = jest.fn();
let mockUsuario = 'a';
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: mockUsuario }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (c) => require('react').useEffect(c, [c]),
}));
const filtros = { estado: 'todos' };
beforeEach(() => {
  mockUsuario = 'a';
  mockRequisitar.mockReset();
});
it('carrega a próxima página uma vez por toque e remove repetições sem perder a lista', async () => {
  let resolver;
  mockRequisitar
    .mockResolvedValueOnce(paginaHistoricoDeTeste({ proximoCursor: 'proxima' }))
    .mockImplementation(
      () =>
        new Promise((r) => {
          resolver = r;
        }),
    );
  const { result } = renderHook(() => useHistoricoMissoes(filtros));
  await waitFor(() => expect(result.current.registros).toHaveLength(1));
  act(() => {
    result.current.carregarMais();
    result.current.carregarMais();
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  await act(async () =>
    resolver(
      paginaHistoricoDeTeste({
        registros: [
          registroHistoricoDeTeste(),
          registroHistoricoDeTeste({ id: 11, titulo: 'Anterior' }),
        ],
      }),
    ),
  );
  expect(result.current.registros.map((r) => r.id)).toEqual([12, 11]);
});
it('trocar filtros esconde dados anteriores e ignora resposta tardia', async () => {
  let resolver;
  mockRequisitar
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolver = r;
        }),
    )
    .mockResolvedValue(paginaHistoricoDeTeste({ registros: [] }));
  const { result, rerender } = renderHook(({ f }) => useHistoricoMissoes(f), {
    initialProps: { f: filtros },
  });
  rerender({ f: { estado: 'cancelada' } });
  await waitFor(() => expect(result.current.carregando).toBe(false));
  await act(async () => resolver(paginaHistoricoDeTeste()));
  expect(result.current.registros).toEqual([]);
});
it('trocar sessão durante paginação descarta a resposta e os títulos da conta anterior', async () => {
  let resolver;
  mockRequisitar
    .mockResolvedValueOnce(paginaHistoricoDeTeste({ proximoCursor: 'proxima' }))
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolver = r;
        }),
    )
    .mockResolvedValue(paginaHistoricoDeTeste({ registros: [] }));
  const { result, rerender } = renderHook(() => useHistoricoMissoes(filtros));
  await waitFor(() => expect(result.current.registros).toHaveLength(1));
  act(() => result.current.carregarMais());
  mockUsuario = 'b';
  rerender();
  expect(result.current.registros).toEqual([]);
  await act(async () => resolver(paginaHistoricoDeTeste()));
  await waitFor(() => expect(result.current.carregando).toBe(false));
  expect(result.current.registros).toEqual([]);
  expect(mockRequisitar.mock.calls.at(-1)[0]).toContain('/usuarios/b/');
});
it('falha ao buscar mais preserva a lista; sessão expirada a esconde', async () => {
  mockRequisitar
    .mockResolvedValueOnce(paginaHistoricoDeTeste({ proximoCursor: 'proxima' }))
    .mockRejectedValueOnce(new Error('conexão'))
    .mockRejectedValueOnce({ status: 401 });
  const { result } = renderHook(() => useHistoricoMissoes(filtros));
  await waitFor(() => expect(result.current.registros).toHaveLength(1));
  await act(() => result.current.carregarMais());
  expect(result.current.registros).toHaveLength(1);
  expect(result.current.erroMais).toMatch(/conexão/);
  await act(() => result.current.carregarMais());
  expect(result.current.registros).toEqual([]);
  expect(result.current.expirada).toBe(true);
});
