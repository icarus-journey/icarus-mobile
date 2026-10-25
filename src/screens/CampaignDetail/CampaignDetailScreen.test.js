import { render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { CampaignDetailScreen } from './CampaignDetailScreen';

const mockRequisitar = jest.fn(async () => {
  throw new Error('Sem conexão');
});

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: 'usuario-teste' },
    requisitarAutenticado: mockRequisitar,
  }),
}));

const navigation = { goBack: jest.fn(), popToTop: jest.fn() };

function renderScreen(campaignId, initialCampaigns) {
  return render(
    <CampaignsProvider initialCampaigns={initialCampaigns}>
      <CampaignDetailScreen navigation={navigation} route={{ params: { campaignId } }} />
    </CampaignsProvider>,
  );
}

const CAMPANHA_BASE = {
  id: 'campanha-1',
  titulo: 'Capacitação em Python',
  descricao: 'Aprender Python do zero.',
  dataLimite: '31/12/2026',
  prazoLabel: '31/12/2026',
  dificuldade: 'MEDIA',
  pontos: 45,
  pontosAtuais: 0,
  valorMensurado: null,
  unidade: null,
  recompensaCurta: null,
  recompensaLabel: '45 pontos',
  missoesAtribuidas: [],
  progresso: null,
  epico: null,
  corDestaque: '#7048d6',
};

describe('CampaignDetailScreen', () => {
  it('mostra o botão de editar quando a campanha ainda não foi concluída', () => {
    renderScreen('campanha-1', [{ ...CAMPANHA_BASE, estado: 'emAndamento' }]);

    expect(screen.getByText('Editar campanha')).toBeTruthy();
  });

  it('esconde o botão de editar quando a campanha já foi concluída (RF-03.4)', () => {
    renderScreen('campanha-1', [{ ...CAMPANHA_BASE, estado: 'concluida' }]);

    expect(screen.getByText('Concluída')).toBeTruthy();
    expect(screen.queryByText('Editar campanha')).toBeNull();
  });

  it('mostra mensagem segura quando a campanha não é encontrada', () => {
    renderScreen('campanha-inexistente', []);

    expect(screen.getByText('Esta campanha não está mais disponível.')).toBeTruthy();
  });
});
