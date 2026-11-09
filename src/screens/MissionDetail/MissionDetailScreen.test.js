import { render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { MissionDetailScreen } from './MissionDetailScreen';
jest.mock('../../hooks/useExecucaoMissao', () => ({
  useExecucaoMissao: () => ({ dados: null, carregando: false, erro: '', atualizar: jest.fn() }),
}));

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { goBack: jest.fn(), popToTop: jest.fn() };

function renderScreen(missionId, initialMissions, initialCampaigns = []) {
  return render(
    <CampaignsProvider initialCampaigns={initialCampaigns}>
      <MissionsProvider initialMissions={initialMissions}>
        <MissionDetailScreen navigation={navigation} route={{ params: { missionId } }} />
      </MissionsProvider>
    </CampaignsProvider>,
  );
}

describe('MissionDetailScreen', () => {
  it('mostra os dados essenciais de uma missão com campanha e progresso', () => {
    renderScreen('missao-1');

    expect(screen.getByText('Fazer exercício de dados')).toBeTruthy();
    expect(screen.getByText('Ontem, 18:00')).toBeTruthy();
    expect(screen.getByText('Média')).toBeTruthy();
    expect(screen.getByText('Recorrente')).toBeTruthy();
    expect(screen.getByText('Capacitação em Python')).toBeTruthy();
    expect(screen.getByText('3 de 5 registros concluídos')).toBeTruthy();
    expect(screen.getByText('Parar missão')).toBeTruthy(); // recorrente e ativa
    expect(screen.getByText('Editar missão')).toBeTruthy(); // recorrente ativa permite editar o planejamento futuro
  });

  it('missão não recorrente ativa mostra o botão de editar', () => {
    renderScreen('missao-nao-recorrente', [
      {
        id: 'missao-nao-recorrente',
        titulo: 'Ler dez páginas',
        descricao: null,
        prazoLabel: '10/10/2026',
        prazoCompleto: '10/10/2026',
        dificuldade: 'FACIL',
        pontos: 15,
        recorrente: false,
        campanha: null,
        corDestaque: '#7048d6',
        progresso: null,
        recompensaLabel: '15 pontos',
      },
    ]);

    expect(screen.getByText('Editar missão')).toBeTruthy();
  });

  it('não quebra quando campos opcionais estão ausentes', () => {
    renderScreen('missao-novo', [
      {
        id: 'missao-novo',
        titulo: 'Ler dez páginas',
        descricao: null,
        status: 'PENDENTE',
        prazoLabel: '10/10/2026',
        prazoCompleto: '10/10/2026',
        dificuldade: 'FACIL',
        pontos: 15,
        recorrente: false,
        campanha: null,
        corDestaque: '#7048d6',
        progresso: null,
        recompensaLabel: '15 pontos',
      },
    ]);

    expect(screen.getByText('Ler dez páginas')).toBeTruthy();
    expect(screen.getByText('Missão sem área')).toBeTruthy();
    expect(screen.queryByText('Campanha')).toBeNull();
    expect(screen.queryByText('Parar missão')).toBeNull(); // não recorrente
  });

  it('mostra mensagem segura quando a missão não é encontrada', () => {
    renderScreen('missao-inexistente', []);

    expect(screen.getByText('Esta missão não está mais disponível.')).toBeTruthy();
  });

  it('missão inativa mostra o chip "Parada" e some com os botões de concluir/parar/editar', () => {
    renderScreen('missao-parada', [
      {
        id: 'missao-parada',
        titulo: 'Beber água',
        descricao: null,
        prazoLabel: 'Hoje',
        prazoCompleto: 'Hoje, 09:00',
        dificuldade: 'TRIVIAL',
        pontos: 15,
        recorrente: true,
        inativa: true,
        campanha: null,
        corDestaque: '#7048d6',
        progresso: null,
        recompensaLabel: '15 pontos',
      },
    ]);

    expect(screen.getByText('Parada')).toBeTruthy();
    expect(screen.getByText('Missão parada')).toBeTruthy();
    expect(screen.queryByText('Parar missão')).toBeNull();
    expect(screen.queryByText('Editar missão')).toBeNull();
  });
});
