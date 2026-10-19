import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../state/CampaignsContext';
import { DiariosProvider } from '../state/DiariosContext';
import { EpicsProvider } from '../state/EpicsContext';
import { MissionsProvider } from '../state/MissionsContext';
import { OnboardingProvider } from '../state/OnboardingContext';
import { RootNavigator } from './RootNavigator';
import { useSessao } from '../state/SessaoContext';

jest.mock('../state/SessaoContext', () => ({ useSessao: jest.fn() }));

const mockCriarEpico = jest.fn();
const mockAtualizarEpico = jest.fn();
jest.mock('../services/epicos', () => ({
  criarEpico: (...args) => mockCriarEpico(...args),
  atualizarEpico: (...args) => mockAtualizarEpico(...args),
}));

const mockCriarCampanha = jest.fn();
const mockAtualizarCampanha = jest.fn();
jest.mock('../services/campanhas', () => ({
  criarCampanha: (...args) => mockCriarCampanha(...args),
  atualizarCampanha: (...args) => mockAtualizarCampanha(...args),
}));

const mockCriarMissao = jest.fn();
const mockAtualizarMissao = jest.fn();
jest.mock('../services/missoes', () => ({
  criarMissao: (...args) => mockCriarMissao(...args),
  atualizarMissao: (...args) => mockAtualizarMissao(...args),
}));

function renderApp(initialRouteName = 'Login') {
  useSessao.mockReturnValue({
    sessao: initialRouteName === 'Login' ? null : { usuarioId: 'usuario' },
    novaConta: false,
    requisitarAutenticado: jest.fn(),
  });
  return render(
    <OnboardingProvider>
      <MissionsProvider>
        <EpicsProvider>
          <CampaignsProvider>
            <DiariosProvider>
              <NavigationContainer>
                <RootNavigator initialRouteName={initialRouteName} />
              </NavigationContainer>
            </DiariosProvider>
          </CampaignsProvider>
        </EpicsProvider>
      </MissionsProvider>
    </OnboardingProvider>,
  );
}

beforeEach(() => {
  mockCriarEpico.mockReset();
  mockAtualizarEpico.mockReset();
  mockCriarCampanha.mockReset();
  mockAtualizarCampanha.mockReset();
  mockCriarMissao.mockReset();
  mockAtualizarMissao.mockReset();
});

describe('fluxo de autenticação e missões', () => {
  it('exibe somente o login quando não existe sessão', () => {
    renderApp();

    expect(screen.getByLabelText('Icarus')).toBeTruthy();

    expect(screen.queryByText('Seus próximos passos.')).toBeNull();
  });

  it('abre o formulário a partir da lista e volta para a lista ao tocar em uma missão', () => {
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    expect(screen.getByText('Nova missão')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('cria uma missão válida e volta para a lista com o novo item', async () => {
    mockCriarMissao.mockResolvedValue({
      id: 101,
      campanhaId: null,
      titulo: 'Ler dez páginas',
      descricao: null,
      beneficio: null,
      dificuldade: 'media',
      pontuacao: 45,
      dataLimite: '2026-12-25',
      horario: '2026-12-25T09:00:00+00:00',
      status: 'ativa',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Adicionar missão'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Ler dez páginas');
    fireEvent.changeText(screen.getByLabelText('Data limite'), '25122026');
    fireEvent.press(screen.getByLabelText('Média'));
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar missão'));
    });

    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
    expect(screen.getByText('Ler dez páginas')).toBeTruthy();
  });

  it('abre o detalhe ao tocar em uma missão e volta para a lista', () => {
    renderApp('MissionList');

    fireEvent.press(screen.getAllByLabelText(/Fazer exercício de dados/)[0]);

    expect(screen.getByText('Detalhe da missão')).toBeTruthy();
    expect(screen.getByText('3 de 5 registros concluídos')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('edita uma missão existente a partir do detalhe e reflete a mudança ao voltar', async () => {
    mockAtualizarMissao.mockResolvedValue({
      id: 'missao-1',
      campanhaId: 'campanha-1',
      titulo: 'Fazer exercício de dados avançado',
      descricao: null,
      beneficio: null,
      dificuldade: 'media',
      pontuacao: 45,
      dataLimite: null,
      horario: '2026-01-01T18:00:00+00:00',
      status: 'ativa',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getAllByLabelText(/Fazer exercício de dados/)[0]);
    fireEvent.press(screen.getByLabelText('Editar missão'));

    expect(screen.getByText('Editar missão')).toBeTruthy();
    expect(screen.getByDisplayValue('Fazer exercício de dados')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Fazer exercício de dados avançado');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar alterações'));
    });

    expect(screen.getByText('Fazer exercício de dados avançado')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
    expect(screen.getByText('Fazer exercício de dados avançado')).toBeTruthy();
  });

  it('não salva e mostra erros quando campos obrigatórios estão vazios', () => {
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    fireEvent.press(screen.getByLabelText('Salvar missão'));

    expect(screen.getByText('Nova missão')).toBeTruthy();
    expect(screen.getByText('Informe um título para a missão.')).toBeTruthy();
  });
});

describe('fluxo do diário', () => {
  it('abre o diário pela navegação inferior e registra uma reflexão', () => {
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Diário'));
    expect(screen.getByText('Diário de crescimento')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Hoje consegui avançar.');
    fireEvent.press(screen.getByLabelText('Registrar reflexão'));

    expect(screen.getByText('Hoje consegui avançar.')).toBeTruthy();
  });
});

describe('fluxo de épicos', () => {
  it('abre o detalhe do épico em destaque, edita e reflete a mudança ao voltar', async () => {
    mockAtualizarEpico.mockResolvedValue({
      id: 'epico-1',
      titulo: 'Ser promovido a sênior',
      descricao: 'Avance nas campanhas que sustentam seu grande objetivo.',
      areaDaVida: 'trabalhoECarreira',
      dificuldade: 'dificil',
      pontuacao: 60,
      prazoInicio: '2026-01-01',
      prazoFim: '2027-12-31',
      estado: 'emAndamento',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText(/Ser promovido/));

    expect(screen.getByText('Detalhe do épico')).toBeTruthy();
    expect(screen.getByText('2 de 3 campanhas concluídas')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Editar épico'));
    expect(screen.getByText('Editar épico')).toBeTruthy();
    expect(screen.getByDisplayValue('Ser promovido')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Ser promovido a sênior');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar alterações'));
    });

    expect(screen.getByText('Ser promovido a sênior')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Épicos')).toBeTruthy();
  });

  it('cria um épico válido e ele aparece na lista', async () => {
    mockCriarEpico.mockResolvedValue({
      id: 'epico-99',
      titulo: 'Aprender inglês fluente',
      descricao: null,
      areaDaVida: 'estudosEAprendizado',
      dificuldade: 'facil',
      pontuacao: 30,
      prazoInicio: '2026-01-01',
      prazoFim: '2027-12-31',
      estado: 'emAndamento',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText('Adicionar épico'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Aprender inglês fluente');
    fireEvent.press(screen.getByLabelText('Área da vida'));
    fireEvent.press(screen.getByLabelText('Estudos e aprendizado'));
    fireEvent.changeText(screen.getByLabelText('Data limite'), '31122027');
    fireEvent.press(screen.getByLabelText('Fácil'));
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar épico'));
    });

    expect(screen.getByText('Épicos')).toBeTruthy();
    expect(screen.getByText('Aprender inglês fluente')).toBeTruthy();
  });
});

describe('fluxo de campanhas', () => {
  it('abre o detalhe da campanha em destaque, edita e reflete a mudança ao voltar', async () => {
    mockAtualizarCampanha.mockResolvedValue({
      id: 'campanha-1',
      epicoId: 'epico-1',
      titulo: 'Capacitação em Python avançado',
      descricao: 'Conclua as missões para dominar fundamentos de Python.',
      areaDaVida: 'trabalhoECarreira',
      dificuldade: 'media',
      pontuacao: 45,
      prazoInicio: '2026-01-01',
      prazoFim: '2026-09-30',
      valorMensurado: null,
      unidade: null,
      valorAtual: null,
      estado: 'emAndamento',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Campanha'));
    fireEvent.press(screen.getByLabelText(/Capacitação em Python/));

    expect(screen.getByText('Detalhe da campanha')).toBeTruthy();
    expect(screen.getByText('4 de 5 missões concluídas')).toBeTruthy();
    expect(screen.getByText('Ser promovida')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Editar campanha'));
    expect(screen.getByText('Editar campanha')).toBeTruthy();
    expect(screen.getByDisplayValue('Capacitação em Python')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Capacitação em Python avançado');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar alterações'));
    });

    expect(screen.getByText('Capacitação em Python avançado')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Campanhas')).toBeTruthy();
  });

  it('cria uma campanha válida, vinculada a um épico, e ela aparece na lista', async () => {
    mockCriarCampanha.mockResolvedValue({
      id: 'campanha-99',
      epicoId: 'epico-1',
      titulo: 'Correr uma meia maratona',
      descricao: null,
      areaDaVida: 'trabalhoECarreira',
      dificuldade: 'dificil',
      pontuacao: 60,
      prazoInicio: '2026-01-01',
      prazoFim: '2027-03-15',
      valorMensurado: null,
      unidade: null,
      valorAtual: null,
      estado: 'planejada',
    });
    renderApp('MissionList');

    fireEvent.press(screen.getByLabelText('Campanha'));
    fireEvent.press(screen.getByLabelText('Adicionar campanha'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Correr uma meia maratona');
    fireEvent.changeText(screen.getByLabelText('Data limite'), '15032027');
    fireEvent.press(screen.getByLabelText('Difícil'));

    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText('Ser promovido'));

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Salvar campanha'));
    });

    expect(screen.getByText('Campanhas')).toBeTruthy();
    expect(screen.getByText('Correr uma meia maratona')).toBeTruthy();
  });
});
