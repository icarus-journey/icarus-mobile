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
  estado: 'planejada',
  prazoInicio: '2026-11-01',
  titulo: 'Campanha X',
  descricao: null,
  dataLimite: '31/12/2026',
  dificuldade: 'MEDIA',
  epico: { id: 1, titulo: 'Épico X' },
};

const MISSAO_VINCULADA = {
  id: 10,
  titulo: 'Missão vinculada',
  pontos: 30,
  campanha: { id: 1, titulo: 'Campanha X' },
};
const MISSAO_DE_OUTRA_CAMPANHA = {
  id: 11,
  titulo: 'Outra missão',
  pontos: 15,
  campanha: { id: 2, titulo: 'Outra campanha' },
};

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

describe('CampaignFormScreen — épico (RF-03.8)', () => {
  it('não oferece épico já concluído no seletor', () => {
    render(
      <EpicsProvider
        initialEpics={[
          { id: 1, titulo: 'Épico ativo', estado: 'emAndamento' },
          { id: 2, titulo: 'Épico concluído', estado: 'concluido' },
        ]}
      >
        <CampaignsProvider initialCampaigns={[]}>
          <MissionsProvider initialMissions={[]}>
            <CampaignFormScreen navigation={navigation} route={{ params: {} }} />
          </MissionsProvider>
        </CampaignsProvider>
      </EpicsProvider>,
    );

    fireEvent.press(screen.getByLabelText('Épico'));

    expect(screen.getByLabelText('Épico ativo')).toBeTruthy();
    expect(screen.queryByLabelText('Épico concluído')).toBeNull();
  });
});

describe('CampaignFormScreen — ciclo da campanha', () => {
  it.each(['emAndamento', 'concluida', 'excluida'])(
    'impede editar configuração em %s, inclusive pela rota direta',
    (estado) => {
      renderScreen({ initialCampaigns: [{ ...CAMPANHA, estado }] });
      expect(screen.queryByLabelText('Título')).toBeNull();
      expect(screen.queryByLabelText('Salvar alterações')).toBeNull();
      expect(screen.getByText(/Esta campanha/)).toBeTruthy();
    },
  );

  it('oferece a data inicial e mantém o épico de origem ao editar planejada', () => {
    renderScreen();
    expect(screen.getByDisplayValue('01/11/2026')).toBeTruthy();
    expect(screen.queryByLabelText('Escolher épico')).toBeNull();
    expect(screen.getByText('Épico X')).toBeTruthy();
  });

  it('rota com campanha indisponível não vira criação silenciosamente', () => {
    renderScreen({ initialCampaigns: [] });
    expect(screen.queryByLabelText('Salvar campanha')).toBeNull();
    expect(screen.getByText('Esta campanha não está disponível para edição.')).toBeTruthy();
  });
});
