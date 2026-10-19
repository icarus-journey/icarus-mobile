import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { OnboardingProvider } from '../../state/OnboardingContext';

const mockIniciarOnboarding = jest.fn();
const mockObterStatusOnboarding = jest.fn();
const mockRequisitarAutenticado = jest.fn();

jest.mock('../../services/onboarding', () => ({
  iniciarOnboarding: (...args) => mockIniciarOnboarding(...args),
  obterStatusOnboarding: (...args) => mockObterStatusOnboarding(...args),
}));

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: 'usuario-1' },
    requisitarAutenticado: mockRequisitarAutenticado,
  }),
}));

const RESULTADO_CONCLUIDO = {
  status: 'concluido',
  epico: {
    id: 1,
    titulo: 'Organizar minha vida financeira',
    descricao: 'desc',
    areaDaVida: 'profissional',
    dificuldade: 'media',
    pontuacao: 45,
    prazoInicio: '2026-10-17',
    prazoFim: '2027-10-17',
    estado: 'emAndamento',
    campanha: {
      id: 1,
      titulo: 'Primeiros passos na organização financeira',
      descricao: 'desc',
      areaDaVida: 'profissional',
      dificuldade: 'facil',
      pontuacao: 30,
      prazoInicio: '2026-10-17',
      prazoFim: '2027-10-17',
      valorMensurado: 30,
      unidade: 'pontos',
      valorAtual: 0,
      estado: 'planejada',
      missoes: [
        {
          id: 1,
          titulo: 'Revisar os gastos da semana',
          descricao: 'desc',
          beneficio: 'benef',
          dificuldade: 'facil',
          pontuacao: 30,
          dataLimite: null,
          horario: '2026-10-17T09:00:00+00:00',
          status: 'ativa',
        },
      ],
    },
  },
  erro: null,
};

function renderApp() {
  return render(
    <OnboardingProvider>
      <MissionsProvider initialMissions={[]}>
        <EpicsProvider initialEpics={[]}>
          <CampaignsProvider initialCampaigns={[]}>
            <NavigationContainer>
              <RootNavigator initialRouteName="Onboarding" />
            </NavigationContainer>
          </CampaignsProvider>
        </EpicsProvider>
      </MissionsProvider>
    </OnboardingProvider>,
  );
}

function pressFirstOption() {
  const [firstOption] = screen.getAllByRole('radio');
  fireEvent.press(firstOption);
}

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockIniciarOnboarding.mockReset();
    mockObterStatusOnboarding.mockReset();
  });

  it('abre no passo 1 de 13 com o botão de continuar desabilitado até escolher uma opção', () => {
    renderApp();

    expect(screen.getByText('PASSO 1 DE 13')).toBeTruthy();
    expect(screen.getByText('Qual a sua faixa etária?')).toBeTruthy();

    const continueButton = screen.getByLabelText('Continuar');
    expect(continueButton.props.accessibilityState.disabled).toBe(true);

    pressFirstOption();
    expect(continueButton.props.accessibilityState.disabled).toBe(false);
  });

  it('percorre as 13 perguntas e, ao concluir, inicia o onboarding real e navega com o resultado da IA', async () => {
    mockIniciarOnboarding.mockResolvedValue({ jobId: 'job-1' });
    mockObterStatusOnboarding.mockResolvedValue(RESULTADO_CONCLUIDO);

    renderApp();

    // perguntas 1 a 9: resposta única, escolhe sempre a primeira opção
    for (let step = 1; step <= 9; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }

    // pergunta 10: escolhe "Finanças" para testar a ramificação da pergunta 13
    expect(screen.getByText('Quais áreas você quer priorizar hoje?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Finanças'));
    fireEvent.press(screen.getByLabelText('Continuar'));

    // perguntas 11 e 12: resposta única
    for (let step = 11; step <= 12; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }

    // pergunta 13: múltipla escolha, personalizada para Finanças
    expect(screen.getByText('PASSO 13 DE 13')).toBeTruthy();

    const finalButton = screen.getByLabelText('Preparar minha jornada');
    expect(finalButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByLabelText('Começar a investir'));
    expect(finalButton.props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(finalButton);
    });

    expect(mockIniciarOnboarding).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: 'usuario-1',
        requisitarAutenticado: mockRequisitarAutenticado,
        respostas: expect.arrayContaining([
          { pergunta: 'Quais áreas você quer priorizar hoje?', respostas: ['Finanças'] },
          {
            pergunta: 'Falando mais sobre Finanças. Qual objetivo você deseja conquistar?',
            respostas: ['Começar a investir'],
          },
        ]),
      }),
    );
    expect(mockObterStatusOnboarding).toHaveBeenCalledWith({
      usuarioId: 'usuario-1',
      jobId: 'job-1',
      requisitarAutenticado: mockRequisitarAutenticado,
    });

    // navegou pra PlanningHub com o épico/campanha/missão reais devolvidos pela IA
    await waitFor(() => expect(screen.getByText('Épicos')).toBeTruthy());
    expect(screen.getByText('Organizar minha vida financeira')).toBeTruthy();
    expect(screen.getByText('Meta para 2027 • 1 campanhas')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Campanha'));
    expect(screen.getByText('Primeiros passos na organização financeira')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Missão'));
    expect(screen.getByText('Revisar os gastos da semana')).toBeTruthy();
  });

  it('mostra erro e permanece na tela quando o onboarding falha', async () => {
    mockIniciarOnboarding.mockResolvedValue({ jobId: 'job-1' });
    mockObterStatusOnboarding.mockResolvedValue({ status: 'falhou', epico: null, erro: 'worker indisponível' });

    renderApp();

    for (let step = 1; step <= 9; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }
    fireEvent.press(screen.getByLabelText('Finanças'));
    fireEvent.press(screen.getByLabelText('Continuar'));
    for (let step = 11; step <= 12; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }
    fireEvent.press(screen.getByLabelText('Começar a investir'));

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Preparar minha jornada'));
    });

    await waitFor(() =>
      expect(screen.getByText('Não foi possível gerar sua jornada agora. Tente novamente.')).toBeTruthy(),
    );
  });
});
