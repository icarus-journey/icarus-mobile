import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MOCK_CAMPAIGNS } from '../../state/campaignMockData';
import { EpicsProvider } from '../../state/EpicsContext';
import { MOCK_EPICS } from '../../state/epicMockData';
import { MissionsProvider } from '../../state/MissionsContext';
import { MOCK_MISSIONS } from '../../state/mockData';
import { PlanningHubScreen } from './PlanningHubScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { navigate: jest.fn(), popToTop: jest.fn() };

function renderScreen({
  initialMissions = MOCK_MISSIONS,
  initialEpics = MOCK_EPICS,
  initialCampaigns = MOCK_CAMPAIGNS,
  params = {},
} = {}) {
  return render(
    <MissionsProvider initialMissions={initialMissions}>
      <EpicsProvider initialEpics={initialEpics}>
        <CampaignsProvider initialCampaigns={initialCampaigns}>
          <PlanningHubScreen navigation={navigation} route={{ params }} />
        </CampaignsProvider>
      </EpicsProvider>
    </MissionsProvider>,
  );
}

describe('PlanningHubScreen — aba Missão', () => {
  it('lista as missões atrasadas antes das pendentes', () => {
    renderScreen();

    const titles = screen.getAllByText('Fazer exercício de dados');
    expect(titles).toHaveLength(2);
    expect(screen.getByText('Atrasada')).toBeTruthy();
    expect(screen.getByText('Hoje')).toBeTruthy();
  });

  it('mostra o estado vazio quando não há missões', () => {
    renderScreen({ initialMissions: [] });

    expect(screen.getByText('Nenhuma missão por aqui')).toBeTruthy();
  });

  it('navega para o formulário ao tocar em adicionar missão', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));

    expect(navigation.navigate).toHaveBeenCalledWith('MissionForm');
  });

  it('separa missões concluídas numa seção própria, abaixo da lista ativa', () => {
    renderScreen({
      initialMissions: [
        ...MOCK_MISSIONS,
        {
          id: 'missao-concluida',
          titulo: 'Missão já feita',
          status: 'PENDENTE',
          prazoLabel: 'Ontem',
          pontos: 20,
          corDestaque: '#7048d6',
          concluidaEm: '2026-01-01T09:00:00+00:00',
        },
      ],
    });

    expect(screen.getByText('Concluídos')).toBeTruthy();
    expect(screen.getByText('Missão já feita')).toBeTruthy();
    expect(
      screen.getByLabelText('Missão já feita, Ontem, concluída, mais 20 pontos'),
    ).toBeTruthy();
  });

  it('separa missões com prazo vencido numa seção "Atrasados", mesmo sem status explícito', () => {
    renderScreen({
      initialMissions: [
        ...MOCK_MISSIONS,
        {
          id: 'missao-atrasada-por-data',
          titulo: 'Missão vencida',
          status: 'PENDENTE',
          prazoLabel: '01/01/2020',
          dataLimite: '01/01/2020',
          pontos: 15,
          corDestaque: '#7048d6',
          concluidaEm: null,
        },
      ],
    });

    expect(screen.getByText('Atrasados')).toBeTruthy();
    expect(screen.getByText('Missão vencida')).toBeTruthy();
    expect(
      screen.getByLabelText('Missão vencida, 01/01/2020, atrasada, mais 15 pontos'),
    ).toBeTruthy();
  });
});

describe('PlanningHubScreen — aba Épico', () => {
  it('abre direto na aba Épico quando initialSegment é EPICO', () => {
    renderScreen({ params: { initialSegment: 'EPICO' } });

    expect(screen.getByText('Épicos')).toBeTruthy();
    expect(screen.getByText('Objetivos que movem sua jornada.')).toBeTruthy();
  });

  it('mostra todos os épicos como cards grandes', () => {
    renderScreen({ params: { initialSegment: 'EPICO' } });

    expect(screen.getByText('Ser promovido')).toBeTruthy();
    expect(screen.getByText('Meta para 2027 • 3 campanhas')).toBeTruthy();
    expect(screen.getByText('Melhorar comunicação')).toBeTruthy();
    expect(screen.getByText('Fortalecer presença profissional')).toBeTruthy();
  });

  it('alterna para a aba Épico ao tocar no controle segmentado', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Épico'));

    expect(screen.getByText('Épicos')).toBeTruthy();
  });

  it('mostra o estado vazio quando não há épicos', () => {
    renderScreen({ initialEpics: [], params: { initialSegment: 'EPICO' } });

    expect(screen.getByText('Nenhum épico por aqui')).toBeTruthy();
  });

  it('navega para o formulário ao tocar em adicionar épico', () => {
    renderScreen({ params: { initialSegment: 'EPICO' } });

    fireEvent.press(screen.getByLabelText('Adicionar épico'));

    expect(navigation.navigate).toHaveBeenCalledWith('EpicForm');
  });

  it('navega para o detalhe ao tocar em um épico', () => {
    renderScreen({ params: { initialSegment: 'EPICO' } });

    fireEvent.press(screen.getByLabelText(/Ser promovido/));

    expect(navigation.navigate).toHaveBeenCalledWith('EpicDetail', { epicId: 'epico-1' });
  });

  it('separa épicos concluídos numa seção própria, abaixo da lista ativa', () => {
    renderScreen({
      initialEpics: [
        ...MOCK_EPICS,
        {
          id: 'epico-concluido',
          titulo: 'Épico já feito',
          dataLimite: '31/12/2026',
          campanhasAtribuidas: [],
          estado: 'concluido',
        },
      ],
      params: { initialSegment: 'EPICO' },
    });

    expect(screen.getByText('Concluídos')).toBeTruthy();
    expect(screen.getByText('Épico já feito')).toBeTruthy();
  });

  it('separa épicos com prazo vencido numa seção "Atrasados"', () => {
    renderScreen({
      initialEpics: [
        ...MOCK_EPICS,
        {
          id: 'epico-atrasado',
          titulo: 'Épico vencido',
          dataLimite: '01/01/2020',
          campanhasAtribuidas: [],
          estado: 'emAndamento',
        },
      ],
      params: { initialSegment: 'EPICO' },
    });

    expect(screen.getByText('Atrasados')).toBeTruthy();
    expect(screen.getByText('Épico vencido')).toBeTruthy();
  });
});

describe('PlanningHubScreen — aba Campanha', () => {
  it('mostra todas as campanhas como cards grandes', () => {
    renderScreen({ params: { initialSegment: 'CAMPANHA' } });

    expect(screen.getByText('Campanhas')).toBeTruthy();
    expect(screen.getByText('Capacitação em Python')).toBeTruthy();
    expect(screen.getByText('4 de 5 missões • 320/500 XP')).toBeTruthy();
    expect(screen.getByText('Recompensa final: 300 pontos')).toBeTruthy();
    expect(screen.getByText('Leitura de 12 livros')).toBeTruthy();
  });

  it('alterna para a aba Campanha ao tocar no controle segmentado', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Campanha'));

    expect(screen.getByText('Campanhas')).toBeTruthy();
  });

  it('mostra o estado vazio quando não há campanhas', () => {
    renderScreen({ initialCampaigns: [], params: { initialSegment: 'CAMPANHA' } });

    expect(screen.getByText('Nenhuma campanha por aqui')).toBeTruthy();
  });

  it('navega para o formulário ao tocar em adicionar campanha', () => {
    renderScreen({ params: { initialSegment: 'CAMPANHA' } });

    fireEvent.press(screen.getByLabelText('Adicionar campanha'));

    expect(navigation.navigate).toHaveBeenCalledWith('CampaignForm');
  });

  it('navega para o detalhe ao tocar em uma campanha', () => {
    renderScreen({ params: { initialSegment: 'CAMPANHA' } });

    fireEvent.press(screen.getByLabelText(/Capacitação em Python/));

    expect(navigation.navigate).toHaveBeenCalledWith('CampaignDetail', {
      campaignId: 'campanha-1',
    });
  });

  it('separa campanhas concluídas numa seção própria, abaixo da lista ativa', () => {
    renderScreen({
      initialCampaigns: [
        ...MOCK_CAMPAIGNS,
        {
          id: 'campanha-concluida',
          titulo: 'Campanha já feita',
          progresso: null,
          pontosAtuais: 0,
          pontos: 45,
          recompensaCurta: null,
          estado: 'concluida',
        },
      ],
      params: { initialSegment: 'CAMPANHA' },
    });

    expect(screen.getByText('Concluídos')).toBeTruthy();
    expect(screen.getByText('Campanha já feita')).toBeTruthy();
  });

  it('separa campanhas com prazo vencido numa seção "Atrasados"', () => {
    renderScreen({
      initialCampaigns: [
        ...MOCK_CAMPAIGNS,
        {
          id: 'campanha-atrasada',
          titulo: 'Campanha vencida',
          dataLimite: '01/01/2020',
          progresso: null,
          pontosAtuais: 0,
          pontos: 30,
          recompensaCurta: null,
          estado: 'emAndamento',
        },
      ],
      params: { initialSegment: 'CAMPANHA' },
    });

    expect(screen.getByText('Atrasados')).toBeTruthy();
    expect(screen.getByText('Campanha vencida')).toBeTruthy();
  });
});
