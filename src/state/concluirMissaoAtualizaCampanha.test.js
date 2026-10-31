import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';
import { vibrarConclusao } from '../utils/haptics';
import { CampaignsProvider } from './CampaignsContext';
import { MissionsProvider } from './MissionsContext';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (efeito) => require('react').useEffect(efeito, [efeito]),
}));

const mockRequisitar = jest.fn();
jest.mock('./SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: 'usuario-teste' },
    requisitarAutenticado: mockRequisitar,
  }),
}));

const mockConcluirMissao = jest.fn();
let mockJaConcluida = false;
let mockBloqueio = null;
jest.mock('../services/missoes', () => ({
  consultarMissao: async ({ missaoId }) => {
    const concluida = mockJaConcluida || mockConcluirMissao.mock.calls.length > 0;
    return {
      id: missaoId,
      status: 'ativa',
      recorrente: true,
      titulo: 'Fazer exercício de dados',
      dificuldade: 'media',
      pontuacao: 45,
      versao: 'versao-teste',
      configuracaoRecorrencia: { tipo: 'diaria', diasSemana: [], dataFim: null },
      execucao: {
        ocorrenciaId: 40,
        podeConcluir: !concluida && !mockBloqueio,
        codigoBloqueio: mockBloqueio,
        proximaData: '2026-11-02',
        concluida,
        concluidaEm: concluida ? '2026-10-30T12:00:00Z' : null,
        pontuacao: 45,
        hoje: '2026-10-30',
        dataPrevista: '2026-10-30',
      },
    };
  },
  concluirMissao: (...args) => mockConcluirMissao(...args),
}));

jest.mock('../utils/haptics', () => ({ vibrarConclusao: jest.fn() }));

beforeEach(() => {
  mockJaConcluida = false;
  mockBloqueio = null;
  mockConcluirMissao.mockReset();
  vibrarConclusao.mockClear();
});

const navigation = { goBack: jest.fn(), popToTop: jest.fn(), navigate: jest.fn() };

const CAMPANHA_MENSURAVEL = {
  id: 1,
  titulo: 'Campanha mensurável',
  descricao: null,
  dataLimite: '31/12/2026',
  prazoLabel: '31 dez.',
  dificuldade: 'MEDIA',
  pontos: 45,
  valorAtual: 10,
  valorMensurado: 100,
  unidade: 'pontos',
  recompensaCurta: null,
  recompensaLabel: '45 pontos',
  estado: 'emAndamento',
  missoesAtribuidas: [],
  progresso: null,
  epico: null,
  corDestaque: '#000000',
};

const MISSAO_VINCULADA = {
  id: 5,
  titulo: 'Missão vinculada',
  descricao: null,
  status: 'PENDENTE',
  dataLimite: null,
  prazoLabel: null,
  prazoCompleto: null,
  dificuldade: 'FACIL',
  pontos: 30,
  horarioIso: null,
  concluidaEm: null,
  recorrencia: null,
  campanha: { id: 1, titulo: 'Campanha mensurável' },
  corDestaque: '#000000',
  progresso: null,
  recompensaLabel: '30 pontos',
};

function renderAmbasAsTelas() {
  return render(
    <CampaignsProvider initialCampaigns={[CAMPANHA_MENSURAVEL]}>
      <MissionsProvider initialMissions={[MISSAO_VINCULADA]}>
        <MissionDetailScreen navigation={navigation} route={{ params: { missionId: 5 } }} />
        <CampaignDetailScreen navigation={navigation} route={{ params: { campaignId: 1 } }} />
      </MissionsProvider>
    </CampaignsProvider>,
  );
}

it('ao concluir uma missão vinculada, a campanha reflete o novo valor atual sem round-trip à API', async () => {
  mockConcluirMissao.mockResolvedValue({
    id: 5,
    concluidaEm: '2026-01-01T09:00:00+00:00',
    concluidaComAtraso: false,
    pontuacaoCreditada: 30,
    saldoPontosAtual: 30,
  });

  renderAmbasAsTelas();

  expect(screen.getByText('10 de 100 pontos')).toBeTruthy();

  await waitFor(() => screen.getByLabelText('Concluir missão'));
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Concluir missão'));
  });

  expect(mockConcluirMissao).toHaveBeenCalledTimes(1);
  expect(screen.getByText('40 de 100 pontos')).toBeTruthy();
});

it('não altera o valor atual quando a campanha não é mensurável (valorMensurado nulo)', async () => {
  mockConcluirMissao.mockResolvedValue({
    id: 5,
    concluidaEm: '2026-01-01T09:00:00+00:00',
    concluidaComAtraso: false,
    pontuacaoCreditada: 30,
    saldoPontosAtual: 30,
  });

  render(
    <CampaignsProvider
      initialCampaigns={[{ ...CAMPANHA_MENSURAVEL, valorMensurado: null, valorAtual: 0 }]}
    >
      <MissionsProvider initialMissions={[MISSAO_VINCULADA]}>
        <MissionDetailScreen navigation={navigation} route={{ params: { missionId: 5 } }} />
        <CampaignDetailScreen navigation={navigation} route={{ params: { campaignId: 1 } }} />
      </MissionsProvider>
    </CampaignsProvider>,
  );

  await waitFor(() => screen.getByLabelText('Concluir missão'));
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Concluir missão'));
  });

  expect(screen.queryByText(/de .* pontos$/)).toBeNull();
});

it.each(['módulos', 'reais', 'minutos', null, 'pontos '])(
  'não transforma pontos em resultado na unidade %s',
  async (unidade) => {
    mockConcluirMissao.mockResolvedValue({
      id: 5,
      concluidaEm: '2026-01-01T09:00:00+00:00',
      concluidaComAtraso: false,
      pontuacaoCreditada: 30,
      saldoPontosAtual: 30,
    });
    render(
      <CampaignsProvider initialCampaigns={[{ ...CAMPANHA_MENSURAVEL, valorAtual: 10, unidade }]}>
        <MissionsProvider initialMissions={[MISSAO_VINCULADA]}>
          <MissionDetailScreen navigation={navigation} route={{ params: { missionId: 5 } }} />
          <CampaignDetailScreen navigation={navigation} route={{ params: { campaignId: 1 } }} />
        </MissionsProvider>
      </CampaignsProvider>,
    );
    await waitFor(() => screen.getByLabelText('Concluir missão'));
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Concluir missão'));
    });
    expect(screen.getByText(`10 de 100 ${unidade ?? 'unidade não informada'}`)).toBeTruthy();
    expect(screen.queryByText(/^40 de 100/)).toBeNull();
  },
);

it('vibra uma vez somente depois de a API confirmar a conclusão', async () => {
  let confirmar;
  mockConcluirMissao.mockReturnValueOnce(
    new Promise((resolve) => {
      confirmar = resolve;
    }),
  );
  renderAmbasAsTelas();
  await waitFor(() => screen.getByLabelText('Concluir missão'));
  fireEvent.press(screen.getByLabelText('Concluir missão'));
  expect(vibrarConclusao).not.toHaveBeenCalled();

  await act(async () => {
    confirmar({
      id: 5,
      concluidaEm: '2026-10-23T21:00:00+00:00',
      pontuacaoCreditada: 30,
    });
  });

  await waitFor(() => screen.getByLabelText('Missão concluída'));
  expect(vibrarConclusao).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByLabelText('Missão concluída'));
  expect(vibrarConclusao).toHaveBeenCalledTimes(1);
});

it('não vibra quando a API recusa a conclusão', async () => {
  mockConcluirMissao.mockRejectedValueOnce(new Error('Sem conexão'));
  renderAmbasAsTelas();
  await waitFor(() => screen.getByLabelText('Concluir missão'));
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Concluir missão'));
  });
  expect(screen.getByText('Não foi possível concluir a missão. Tente novamente.')).toBeTruthy();
  expect(vibrarConclusao).not.toHaveBeenCalled();
});

it('campanha encerrada bloqueia nova conclusão sem apagar a apresentação da missão já concluída', async () => {
  mockJaConcluida = true;
  const concluidaEm = '2026-10-20T12:00:00Z';
  render(
    <CampaignsProvider initialCampaigns={[{ ...CAMPANHA_MENSURAVEL, estado: 'concluida' }]}>
      <MissionsProvider initialMissions={[{ ...MISSAO_VINCULADA, concluidaEm }]}>
        <MissionDetailScreen navigation={navigation} route={{ params: { missionId: 5 } }} />
      </MissionsProvider>
    </CampaignsProvider>,
  );
  expect(screen.getByText('Concluída')).toBeTruthy();
  await waitFor(() => screen.getByLabelText('Missão concluída'));
  expect(screen.queryByLabelText('Editar missão')).toBeNull();
  fireEvent.press(screen.getByLabelText('Missão concluída'));
  expect(mockConcluirMissao).not.toHaveBeenCalled();
});

it('vincula o envio à execução exibida e não soma outra vez uma resposta repetida', async () => {
  mockConcluirMissao.mockResolvedValue({
    id: 5,
    repetida: true,
    concluidaEm: '2026-10-30T12:00:00Z',
    pontuacaoCreditada: 30,
  });
  renderAmbasAsTelas();
  await waitFor(() => screen.getByLabelText('Concluir missão'));
  await act(async () => fireEvent.press(screen.getByLabelText('Concluir missão')));
  expect(mockConcluirMissao).toHaveBeenCalledWith(
    expect.objectContaining({ missaoId: 5, ocorrenciaId: 40 }),
  );
  expect(screen.getByText('10 de 100 pontos')).toBeTruthy();
  expect(screen.queryByText('40 de 100 pontos')).toBeNull();
});

it.each([
  ['campanha_nao_iniciada', 'Campanha não iniciada'],
  ['execucao_futura', 'Disponível em 02/11/2026'],
  ['sem_execucao_pendente', 'Sem execução disponível'],
])('apresenta %s com texto curto e bloqueia o envio', async (codigo, rotulo) => {
  mockBloqueio = codigo;
  renderAmbasAsTelas();
  await waitFor(() => screen.getByLabelText(rotulo));
  expect(screen.getByLabelText(rotulo).props.accessibilityState.disabled).toBe(true);
  fireEvent.press(screen.getByLabelText(rotulo));
  expect(mockConcluirMissao).not.toHaveBeenCalled();
});
