import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import {
  progressoDeTeste,
  referenciasDeTeste,
  relatorioDeTeste,
  PERIODO_ANALITICO,
} from '../../testUtils/dadosAnaliticos';

const mockRequisitar = jest.fn();
let mockUsuarioId = 'pessoa-a';
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    novaConta: false,
    requisitarAutenticado: mockRequisitar,
  }),
}));
let falhaGold;
let areaSemMapa;
let respostaRelatorio;
function aplicativo(rota = 'ProgressoScreen') {
  return (
    <MissionsProvider initialMissions={[]}>
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={[]}>
          <NavigationContainer>
            <RootNavigator initialRouteName={rota} />
          </NavigationContainer>
        </CampaignsProvider>
      </EpicsProvider>
    </MissionsProvider>
  );
}
beforeEach(() => {
  mockUsuarioId = 'pessoa-a';
  falhaGold = false;
  areaSemMapa = false;
  respostaRelatorio = relatorioDeTeste();
  mockRequisitar.mockReset().mockImplementation(async (caminho) => {
    if (caminho.includes('/referencias-publicas')) {
      if (falhaGold) throw new Error('Sem conexão');
      return areaSemMapa
        ? {
            ...referenciasDeTeste(),
            estado: 'sem_mapeamento',
            referencias: [],
            mensagem: 'Referência pública compatível de Finanças em breve no Icarus.',
          }
        : referenciasDeTeste();
    }
    if (caminho.includes('/progresso')) return progressoDeTeste();
    return respostaRelatorio;
  });
});

it('abre Meu progresso pelo início preservando a lista e permite voltar', async () => {
  render(aplicativo('MissionList'));
  await screen.findByText('Duas conclusões registradas, sem comparação de desempenho.');
  expect(screen.getByLabelText('Adicionar missão')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Meu progresso'));
  await screen.findByText('Seus registros deste período.');
  expect(screen.getByLabelText('Área do contexto público')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Voltar'));
  expect(screen.getByLabelText('Adicionar missão')).toBeTruthy();
  await screen.findByText('Duas conclusões registradas, sem comparação de desempenho.');
});

it('separa os registros pessoais das duas fontes públicas e o período não altera a edição 2024', async () => {
  render(aplicativo());
  await screen.findByText('Sono Vigitel');
  expect(screen.getByText('Sono ATUS')).toBeTruthy();
  expect(screen.getByText('Referência pública · Vigitel 2024 · Brasil')).toBeTruthy();
  expect(screen.getByText('Referência pública · ATUS 2024 · Estados Unidos')).toBeTruthy();
  expect(screen.getByLabelText('Previstas: Indisponível')).toBeTruthy();
  expect(screen.getByLabelText('Taxa de conclusão: Indisponível')).toBeTruthy();
  expect(screen.queryByLabelText('Registrar progresso')).toBeNull();
  const leiturasGold = mockRequisitar.mock.calls.filter(([c]) =>
    c.includes('/referencias-publicas'),
  ).length;
  fireEvent.press(screen.getByLabelText('Período dos seus registros'));
  fireEvent.press(screen.getByLabelText('Mês anterior completo'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/progresso?periodo=mesAnterior',
    ),
  );
  expect(
    mockRequisitar.mock.calls.filter(([c]) => c.includes('/referencias-publicas')),
  ).toHaveLength(leiturasGold);
  expect(screen.getByText('Referência pública · ATUS 2024 · Estados Unidos')).toBeTruthy();
});

it('mostra recorte ampliado, denominador e limites nos detalhes e trata falha de abrir a origem', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Sem navegador'));
  render(aplicativo());
  await screen.findByText('Sono Vigitel');
  fireEvent.press(screen.getAllByLabelText('Entender os dados')[0]);
  expect(await screen.findByText('Limites da referência')).toBeTruthy();
  expect(
    screen.getByText('Faixa etária ampliada para preservar a referência compatível.'),
  ).toBeTruthy();
  expect(screen.getByText('Respostas válidas; não representa sua duração pessoal.')).toBeTruthy();
  expect(screen.getByText('Estimativa descritiva; não define duração ideal.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Abrir fonte: Vigitel'));
  expect(await screen.findByText('Não foi possível abrir a fonte. Tente novamente.')).toBeTruthy();
  abrir.mockRestore();
});

it('recupera falha da API e distingue área sem mapeamento', async () => {
  falhaGold = true;
  render(aplicativo());
  await screen.findByText(/Não foi possível carregar as referências/);
  falhaGold = false;
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByText('Sono ATUS');
  areaSemMapa = true;
  fireEvent.press(screen.getByLabelText('Área do contexto público'));
  fireEvent.press(screen.getByLabelText('Finanças'));
  expect(
    await screen.findByText('Referência pública compatível de Finanças em breve no Icarus.'),
  ).toBeTruthy();
  expect(screen.queryByText('Sono ATUS')).toBeNull();
});

it('exibe relatório persistido e identifica IA, período e reflexão opcional', async () => {
  render(aplicativo('RelatorioSemanalScreen'));
  expect(await screen.findByText('Sua semana de registros')).toBeTruthy();
  expect(screen.getByText('Síntese gerada com inteligência artificial')).toBeTruthy();
  expect(screen.getByText('12/10/2026 a 18/10/2026 · Fuso: America/Sao_Paulo')).toBeTruthy();
  expect(screen.getByText('Uma reflexão opcional')).toBeTruthy();
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/relatorios/semanais', {
    metodo: 'POST',
  });
});

it('processamento consulta sem iniciar nova geração e falha exige tentativa explícita', async () => {
  respostaRelatorio = {
    estado: 'processando',
    periodo: PERIODO_ANALITICO,
    mensagem: 'Sua semana está sendo preparada.',
  };
  render(aplicativo('RelatorioSemanalScreen'));
  await screen.findByText('Sua semana está sendo preparada.');
  respostaRelatorio = {
    estado: 'falha',
    periodo: PERIODO_ANALITICO,
    mensagem: 'Não foi possível preparar.',
    podeTentarNovamente: true,
  };
  fireEvent.press(screen.getByLabelText('Atualizar relatório'));
  await screen.findByText('Não foi possível preparar.');
  expect(mockRequisitar).toHaveBeenLastCalledWith(
    '/api/usuarios/pessoa-a/relatorios/semanais/atual',
  );
  respostaRelatorio = relatorioDeTeste();
  fireEvent.press(screen.getByLabelText('Tentar gerar novamente'));
  await screen.findByText('Sua semana de registros');
  expect(mockRequisitar).toHaveBeenLastCalledWith(
    '/api/usuarios/pessoa-a/relatorios/semanais/tentar-novamente',
    { metodo: 'POST' },
  );
});

it('falta de histórico não apresenta texto de teste como relatório', async () => {
  respostaRelatorio = {
    estado: 'historico_insuficiente',
    periodo: PERIODO_ANALITICO,
    mensagem: 'Ainda não há registros suficientes.',
  };
  render(aplicativo('RelatorioSemanalScreen'));
  await screen.findByText('Ainda não há registros suficientes.');
  expect(screen.queryByText('Síntese gerada com inteligência artificial')).toBeNull();
  expect(screen.queryByLabelText('Tentar gerar novamente')).toBeNull();
});

it('ignora um relatório antigo após trocar a conta', async () => {
  let concluir;
  mockRequisitar.mockImplementation((caminho) =>
    caminho.includes('pessoa-a')
      ? new Promise((resolve) => {
          concluir = resolve;
        })
      : Promise.resolve(relatorioDeTeste('Resumo privado da conta B.')),
  );
  const tela = render(aplicativo('RelatorioSemanalScreen'));
  mockUsuarioId = 'pessoa-b';
  tela.rerender(aplicativo('RelatorioSemanalScreen'));
  expect(await screen.findByText('Resumo privado da conta B.')).toBeTruthy();
  await act(async () => {
    concluir(relatorioDeTeste('Resumo privado da conta A.'));
  });
  expect(screen.queryByText('Resumo privado da conta A.')).toBeNull();
});
