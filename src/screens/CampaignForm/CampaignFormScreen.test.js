import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { CampaignFormScreen } from './CampaignFormScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { goBack: jest.fn(), navigate: jest.fn() };

const CAMPANHA = {
  id: 1,
  titulo: 'Campanha X',
  descricao: null,
  dataLimite: '31/12/2026',
  dificuldade: 'MEDIA',
  epico: { id: 1, titulo: 'Épico X' },
};

const MISSAO_VINCULADA = { id: 10, titulo: 'Missão vinculada', pontos: 30, campanha: { id: 1, titulo: 'Campanha X' } };
const MISSAO_DE_OUTRA_CAMPANHA = { id: 11, titulo: 'Outra missão', pontos: 15, campanha: { id: 2, titulo: 'Outra campanha' } };

function renderScreen({
  campaignId = 1,
  initialMissions = [MISSAO_VINCULADA, MISSAO_DE_OUTRA_CAMPANHA],
  initialCampaigns = [CAMPANHA],
  initialEpics = [],
} = {}) {
  return render(
    <EpicsProvider initialEpics={initialEpics}>
      <CampaignsProvider initialCampaigns={initialCampaigns}>
        <MissionsProvider initialMissions={initialMissions}>
          <CampaignFormScreen navigation={navigation} route={{ params: { campaignId } }} />
        </MissionsProvider>
      </CampaignsProvider>
    </EpicsProvider>,
  );
}

describe('CampaignFormScreen — missões atribuídas', () => {
  it('mostra só as missões reais vinculadas a esta campanha', () => {
    renderScreen();

    expect(screen.getByText('Missões atribuídas')).toBeTruthy();
    expect(screen.getByText('Missão vinculada')).toBeTruthy();
    expect(screen.queryByText('Outra missão')).toBeNull();
  });

  it('navega para o formulário de missão com a campanha pré-selecionada ao tocar em "Adicionar missão"', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));

    expect(navigation.navigate).toHaveBeenCalledWith('MissionForm', {
      campanha: { id: 1, titulo: 'Campanha X' },
    });
  });

  it('não mostra "Adicionar missão" nem a seção de missões atribuídas ao criar uma campanha nova', () => {
    render(
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={[]}>
          <MissionsProvider initialMissions={[]}>
            <CampaignFormScreen navigation={navigation} route={{ params: {} }} />
          </MissionsProvider>
        </CampaignsProvider>
      </EpicsProvider>,
    );

    expect(screen.queryByLabelText('Adicionar missão')).toBeNull();
    expect(screen.queryByText('Missões atribuídas')).toBeNull();
  });
});
