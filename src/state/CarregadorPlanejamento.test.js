import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { CarregadorPlanejamento, useCarregamentoPlanejamento } from './CarregadorPlanejamento';
import { MissionsProvider, useMissions } from './MissionsContext';
import { EpicsProvider } from './EpicsContext';
import { CampaignsProvider } from './CampaignsContext';

const mockRequisitar = jest.fn();
jest.mock('./SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'titular' }, requisitarAutenticado: mockRequisitar }),
}));

function provedores({ children }) {
  return (
    <MissionsProvider initialMissions={[]}>
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={[]}>
          <CarregadorPlanejamento>{children}</CarregadorPlanejamento>
        </CampaignsProvider>
      </EpicsProvider>
    </MissionsProvider>
  );
}
const missao = { id: 7, titulo: 'Estudar um tópico', dificuldade: 'facil', pontuacao: 30 };
const useDadosDeTeste = () => ({ missoes: useMissions(), leitura: useCarregamentoPlanejamento() });
let eventoApp;
beforeEach(() => {
  mockRequisitar.mockReset();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    eventoApp = callback;
    return { remove: jest.fn() };
  });
});
afterEach(() => jest.restoreAllMocks());

it('uma leitura antiga não desfaz uma conclusão confirmada enquanto atualiza a lista', async () => {
  let liberarAntiga,
    liberarNova,
    quantidade = 0;
  const concluidaEm = '2026-11-07T15:00:00Z';
  mockRequisitar.mockImplementation((rota) => {
    if (rota.endsWith('/concluir')) return Promise.resolve({ concluidaEm });
    if (rota.endsWith('/epicos')) return Promise.resolve([]);
    quantidade++;
    if (quantidade === 1) return Promise.resolve([missao]);
    return new Promise((resolver) => {
      if (quantidade === 2) liberarAntiga = resolver;
      else liberarNova = resolver;
    });
  });
  const { result } = renderHook(useDadosDeTeste, { wrapper: provedores });
  await waitFor(() => expect(result.current.missoes.missions).toHaveLength(1));
  act(() => eventoApp('active'));
  await act(async () => result.current.missoes.concluirMissao(7, 9));
  await act(async () => liberarAntiga([missao]));
  expect(result.current.missoes.missions[0].concluidaEm).toBe(concluidaEm);
  expect(quantidade).toBe(3);
  await act(async () => liberarNova([{ ...missao, concluidaEm }]));
  expect(result.current.missoes.missions[0].concluidaEm).toBe(concluidaEm);
  expect(result.current.leitura.carregando).toBe(false);
});

it('agrupa retomadas durante a carga e permite repetir uma falha sem fingir lista vazia', async () => {
  let liberar;
  const consulta = new Promise((_, rejeitar) => (liberar = rejeitar));
  mockRequisitar.mockReturnValue(consulta);
  const { result } = renderHook(useDadosDeTeste, { wrapper: provedores });
  expect(result.current.leitura.carregando).toBe(true);
  act(() => {
    eventoApp('active');
    eventoApp('active');
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  await act(async () => liberar(new Error('Sem conexão')));
  expect(result.current.leitura.erro).toContain('Não foi possível');
  mockRequisitar.mockImplementation((rota) =>
    Promise.resolve(rota.endsWith('/epicos') ? [] : [missao]),
  );
  await act(async () => result.current.leitura.atualizar());
  expect(result.current.leitura.erro).toBe('');
  expect(result.current.missoes.missions).toHaveLength(1);
});

it('desmontagem cancela as duas leituras e impede hidratar outra sessão', () => {
  mockRequisitar.mockReturnValue(new Promise(() => {}));
  const { unmount } = renderHook(useDadosDeTeste, { wrapper: provedores });
  const sinais = mockRequisitar.mock.calls.map(([, opcoes]) => opcoes.signal);
  expect(sinais.every((signal) => !signal.aborted)).toBe(true);
  unmount();
  expect(sinais.every((signal) => signal.aborted)).toBe(true);
});
