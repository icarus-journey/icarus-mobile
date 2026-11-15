import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { MissionFormScreen } from './MissionFormScreen';

const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'titular' }, requisitarAutenticado: mockRequisitar }),
}));

const navegacao = { goBack: jest.fn() };
const missao = {
  id: 7,
  titulo: 'Estudar uma aula',
  dificuldade: 'FACIL',
  pontos: 137,
  dataLimite: '20/12/2026',
  campanha: null,
};

function montar(editando = false) {
  render(
    <CampaignsProvider initialCampaigns={[]}>
      <MissionsProvider initialMissions={editando ? [missao] : []}>
        <MissionFormScreen
          navigation={navegacao}
          route={{ params: editando ? { missionId: 7 } : {} }}
        />
      </MissionsProvider>
    </CampaignsProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequisitar.mockImplementation(async (_rota, { corpo }) => ({
    id: 7,
    ...corpo,
    status: 'ativa',
    recorrente: false,
  }));
});

it('cria com recompensa explícita sem preenchê-la ou alterá-la pela dificuldade', async () => {
  montar();
  expect(screen.getByLabelText('Recompensa').props.value).toBe('');
  fireEvent.changeText(screen.getByLabelText('Título'), 'Estudar uma aula');
  fireEvent.changeText(screen.getByLabelText('Data limite'), '20/12/2026');
  fireEvent.press(screen.getByLabelText('Fácil'));
  expect(screen.getByLabelText('Recompensa').props.value).toBe('');
  fireEvent.changeText(screen.getByLabelText('Recompensa'), '137');
  fireEvent.press(screen.getByLabelText('Difícil'));
  expect(screen.getByLabelText('Recompensa').props.value).toBe('137');
  fireEvent.press(screen.getByText('Salvar missão'));
  await waitFor(() => expect(navegacao.goBack).toHaveBeenCalledTimes(1));
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/missoes', {
    metodo: 'POST',
    corpo: expect.objectContaining({ pontuacao: 137, dificuldade: 'dificil' }),
  });
});

it('editar o título ou a dificuldade mantém a recompensa existente no envio', async () => {
  montar(true);
  expect(screen.getByLabelText('Recompensa').props.value).toBe('137');
  fireEvent.changeText(screen.getByLabelText('Título'), 'Revisar uma aula');
  fireEvent.press(screen.getByLabelText('Trivial'));
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => expect(navegacao.goBack).toHaveBeenCalledTimes(1));
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/missoes/7', {
    metodo: 'PATCH',
    corpo: expect.objectContaining({ pontuacao: 137, dificuldade: 'trivial' }),
  });
});

it('rejeita decimal colado sem enviar e preserva o valor após falha para nova tentativa', async () => {
  montar(true);
  fireEvent.changeText(screen.getByLabelText('Recompensa'), '1,5');
  fireEvent.press(screen.getByText('Salvar alterações'));
  expect(mockRequisitar).not.toHaveBeenCalled();
  expect(screen.getByText('Informe um valor inteiro entre 1 e 1.000.000.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Recompensa'), '211');
  mockRequisitar.mockRejectedValueOnce(new Error('Falha de rede'));
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => screen.getByText('Não foi possível salvar a missão. Tente novamente.'));
  expect(screen.getByLabelText('Recompensa').props.value).toBe('211');
  expect(navegacao.goBack).not.toHaveBeenCalled();
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => expect(navegacao.goBack).toHaveBeenCalledTimes(1));
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/titular/missoes/7', {
    metodo: 'PATCH',
    corpo: expect.objectContaining({ pontuacao: 211 }),
  });
});
