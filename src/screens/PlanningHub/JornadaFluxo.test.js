import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { PlanningHubScreen } from './PlanningHubScreen';
import { MissionsProvider } from '../../state/MissionsContext';
import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { jornadaDeTeste } from '../../testUtils/dadosJornada';

const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'titular' }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('../../hooks/useRelatorioSemanal', () => ({
  useRelatorioSemanal: () => ({ dados: null, carregando: false }),
}));
let navigation, eventos;
beforeEach(() => {
  mockRequisitar.mockReset().mockResolvedValue(jornadaDeTeste());
  eventos = {};
  navigation = {
    navigate: jest.fn(),
    isFocused: () => true,
    addListener: (tipo, callback) => {
      eventos[tipo] = callback;
      return jest.fn();
    },
  };
});

function aplicativo() {
  return (
    <MissionsProvider initialMissions={[]}>
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={[]}>
          <PlanningHubScreen navigation={navigation} route={{ params: {} }} />
        </CampaignsProvider>
      </EpicsProvider>
    </MissionsProvider>
  );
}

it('mantém criação e progresso, abre calendário no fogo e loja no saldo', async () => {
  render(aplicativo());
  fireEvent.press(await screen.findByLabelText('Sequência de 3 dias. Hoje já contou.'));
  expect(screen.getByText('Sua sequência')).toBeTruthy();
  expect(screen.getByLabelText('31/10/2026. Missão realizada.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Voltar às missões'));
  expect(screen.queryByText('Sua sequência')).toBeNull();
  fireEvent.press(screen.getByLabelText('Saldo de pontos: 1.270. Abrir loja.'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('Loja');
  fireEvent.press(screen.getByLabelText('Adicionar missão'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('MissionForm');
  fireEvent.press(screen.getByLabelText('Meu progresso'));
  expect(navigation.navigate).toHaveBeenLastCalledWith('ProgressoScreen');
});

it('uma conclusão retroativa atualiza a sequência e o saldo vindos da API ao retornar', async () => {
  const base = jornadaDeTeste();
  mockRequisitar.mockResolvedValueOnce(
    jornadaDeTeste({ saldoPontos: 1250, sequencia: { ...base.sequencia, diasAtuais: 1 } }),
  );
  render(aplicativo());
  await screen.findByLabelText('Sequência de 1 dia. Hoje já contou.');
  act(() => eventos.blur());
  await act(async () => eventos.focus());
  await screen.findByLabelText('Sequência de 3 dias. Hoje já contou.');
  expect(screen.getByLabelText('Saldo de pontos: 1.270. Abrir loja.')).toBeTruthy();
});

it('falha é recuperada no calendário e não bloqueia as ações da rotina', async () => {
  mockRequisitar.mockRejectedValueOnce({ status: 503 });
  render(aplicativo());
  fireEvent.press(await screen.findByLabelText('Sequência indisponível. Ver detalhes.'));
  expect(
    screen.getByText('Não foi possível carregar sua sequência. Tente novamente.'),
  ).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await waitFor(() => expect(screen.getByText('3 dias seguidos')).toBeTruthy());
  fireEvent.press(screen.getByLabelText('Voltar às missões'));
  expect(screen.getByLabelText('Adicionar missão')).toBeTruthy();
});
