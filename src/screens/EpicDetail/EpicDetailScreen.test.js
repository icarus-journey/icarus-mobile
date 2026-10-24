import { render, screen } from '@testing-library/react-native';

import { EpicsProvider } from '../../state/EpicsContext';
import { EpicDetailScreen } from './EpicDetailScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { goBack: jest.fn(), popToTop: jest.fn() };

function renderScreen(epicId, initialEpics) {
  return render(
    <EpicsProvider initialEpics={initialEpics}>
      <EpicDetailScreen navigation={navigation} route={{ params: { epicId } }} />
    </EpicsProvider>,
  );
}

const EPICO_BASE = {
  id: 'epico-1',
  titulo: 'Carreira em dados',
  descricao: 'Virar analista de dados.',
  dataLimite: '31/12/2026',
  prazoLabel: '31/12/2026',
  areaDaVida: 'PROFISSIONAL',
  dificuldade: 'DIFICIL',
  pontos: 60,
  recompensaLabel: '60 pontos',
  campanhasAtribuidas: [],
  progresso: null,
  corDestaque: '#7048d6',
};

describe('EpicDetailScreen', () => {
  it('mostra o botão de editar quando o épico ainda não foi concluído', () => {
    renderScreen('epico-1', [{ ...EPICO_BASE, estado: 'emAndamento' }]);

    expect(screen.getByText('Editar épico')).toBeTruthy();
  });

  it('esconde o botão de editar quando o épico já foi concluído (RF-03.8)', () => {
    renderScreen('epico-1', [{ ...EPICO_BASE, estado: 'concluido' }]);

    expect(screen.getAllByText('Concluído').length).toBeGreaterThan(0);
    expect(screen.queryByText('Editar épico')).toBeNull();
  });

  it('mostra mensagem segura quando o épico não é encontrado', () => {
    renderScreen('epico-inexistente', []);

    expect(screen.getByText('Este épico não está mais disponível.')).toBeTruthy();
  });
});
