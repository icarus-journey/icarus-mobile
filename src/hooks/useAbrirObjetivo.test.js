import { act, renderHook } from '@testing-library/react-native';
import { useAbrirObjetivo } from './useAbrirObjetivo';
let mockUsuarioId, mockExclusoes;
const mockRequisitar = jest.fn(),
  mockCampanha = jest.fn(),
  mockEpico = jest.fn();
const mockCarregarEpicos = jest.fn(),
  mockCarregarCampanhas = jest.fn(),
  mockCarregarMissoes = jest.fn();
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    requisitarAutenticado: mockRequisitar,
  }),
}));
jest.mock('../state/EpicsContext', () => ({
  useEpics: () => ({ getEpicById: mockEpico, carregarLista: mockCarregarEpicos }),
}));
jest.mock('../state/CampaignsContext', () => ({
  useCampaigns: () => ({ getCampaignById: mockCampanha, carregarLista: mockCarregarCampanhas }),
}));
jest.mock('../state/MissionsContext', () => ({
  useMissions: () => ({ carregarLista: mockCarregarMissoes }),
}));
jest.mock('../state/ExclusoesPlanejamentoContext', () => ({
  useExclusoesPlanejamento: () => ({ exclusoes: mockExclusoes }),
}));
const grafo = [{ id: 1, campanhas: [{ id: 12 }] }];
beforeEach(() => {
  jest.clearAllMocks();
  mockUsuarioId = 'pessoa-a';
  mockExclusoes = { epicos: [], campanhas: [], missoes: [] };
  mockCampanha.mockReturnValue(null);
  mockEpico.mockReturnValue(null);
  mockRequisitar.mockImplementation(async (rota) => (rota.endsWith('/epicos') ? grafo : []));
});
it('recarrega o grafo existente antes de abrir um objetivo ausente do cache', async () => {
  const navigate = jest.fn(),
    { result } = renderHook(() => useAbrirObjetivo({ navigate }));
  await act(() => result.current.abrirCampanha(12));
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/epicos');
  expect(mockCarregarEpicos).toHaveBeenCalledWith(grafo);
  expect(mockCarregarCampanhas).toHaveBeenCalledWith(grafo);
  expect(mockCarregarMissoes).toHaveBeenCalledWith(grafo, []);
  expect(navigate).toHaveBeenCalledWith('CampaignDetail', { campaignId: 12 });
});
it('abre épico já carregado sem novo HTTP', async () => {
  mockEpico.mockReturnValue({ id: 1 });
  const navigate = jest.fn(),
    { result } = renderHook(() => useAbrirObjetivo({ navigate }));
  await act(() => result.current.abrirEpico(1));
  expect(mockRequisitar).not.toHaveBeenCalled();
  expect(navigate).toHaveBeenCalledWith('EpicDetail', { epicId: 1 });
});
it.each(['sessao', 'exclusao'])('ignora resposta atrasada após mudança de %s', async (mudanca) => {
  let resolver;
  mockRequisitar.mockImplementation((rota) =>
    rota.endsWith('/epicos')
      ? new Promise((r) => {
          resolver = r;
        })
      : Promise.resolve([]),
  );
  const navigate = jest.fn(),
    { result, rerender } = renderHook(() => useAbrirObjetivo({ navigate }));
  let pedido;
  act(() => {
    pedido = result.current.abrirCampanha(12);
  });
  if (mudanca === 'sessao') mockUsuarioId = 'pessoa-b';
  else mockExclusoes = { ...mockExclusoes, campanhas: [12] };
  rerender();
  await act(async () => {
    resolver(grafo);
    await pedido;
  });
  expect(mockCarregarCampanhas).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});
it('falha recuperável não abre dados ausentes e permite nova tentativa', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('conexao'));
  const navigate = jest.fn(),
    { result } = renderHook(() => useAbrirObjetivo({ navigate }));
  await act(() => result.current.abrirCampanha(12));
  expect(result.current.erro).toMatch(/Não foi possível abrir/);
  expect(navigate).not.toHaveBeenCalled();
  await act(() => result.current.abrirCampanha(12));
  expect(result.current.erro).toBe('');
  expect(navigate).toHaveBeenCalled();
});
