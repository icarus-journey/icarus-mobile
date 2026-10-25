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
function aplicativo(rota = 'ProgressoScreen', campanhas = []) {
  return (
    <MissionsProvider initialMissions={[]}>
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={campanhas}>
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
  await screen.findByText('Reveja um próximo passo possível.');
  expect(screen.getByLabelText('Adicionar missão')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Meu progresso'));
  await screen.findByLabelText('2 missões feitas');
  expect(screen.getByRole('tab', { name: 'Minha jornada' })).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Voltar'));
  expect(screen.getByLabelText('Adicionar missão')).toBeTruthy();
  await screen.findByText('Reveja um próximo passo possível.');
});

it('mostra progresso visual e separa pesquisas sem jargão ou avisos falsos de falta de dados', async () => {
  render(aplicativo());
  await screen.findByLabelText('2 missões feitas');
  expect(screen.getByLabelText('12 out 2026: 1 missão feita')).toBeTruthy();
  expect(screen.getByLabelText('Estudos e aprendizado: 1 missão feita')).toBeTruthy();
  expect(screen.queryByLabelText('Previstas: Indisponível')).toBeNull();
  expect(screen.queryByText(/Histórico insuficiente/)).toBeNull();
  expect(screen.queryByLabelText('Registrar progresso')).toBeNull();
  const leiturasGold = mockRequisitar.mock.calls.filter(([c]) =>
    c.includes('/referencias-publicas'),
  ).length;
  fireEvent.press(screen.getByLabelText('Mês anterior completo'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/progresso?periodo=mesAnterior',
    ),
  );
  expect(
    mockRequisitar.mock.calls.filter(([c]) => c.includes('/referencias-publicas')),
  ).toHaveLength(leiturasGold);
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  expect(await screen.findByText('Sono Vigitel')).toBeTruthy();
  expect(screen.getByText('Vigitel · Brasil')).toBeTruthy();
  expect(screen.getByText('PESQUISA DE 2024')).toBeTruthy();
  expect(screen.getByText('7 h')).toBeTruthy();
  expect(screen.getByText('Metade dos registros ficou até esse tempo.')).toBeTruthy();
  expect(screen.queryByText(/mediana|P25|P75|denominador/i)).toBeNull();
  fireEvent.press(screen.getByLabelText('Próxima referência'));
  expect(await screen.findByText('Sono ATUS')).toBeTruthy();
  expect(screen.getByText('ATUS · Estados Unidos')).toBeTruthy();
  expect(screen.getByText('2 de 2 referências')).toBeTruthy();
});

it('explica uma limitação da versão sem culpar a quantidade de registros da pessoa', async () => {
  render(aplicativo());
  await screen.findByLabelText('2 missões feitas');
  fireEvent.press(screen.getByLabelText('Sobre estes números'));
  expect(
    await screen.findByText(
      'Ainda não estão disponíveis nesta versão. Seus registros de conclusões continuam aparecendo normalmente.',
    ),
  ).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Entendi'));
  expect(screen.getByLabelText('2 missões feitas')).toBeTruthy();
});

it('liga o avanço da meta às pesquisas da mesma área sem transformar pontos em módulos', async () => {
  render(
    aplicativo('ProgressoScreen', [
      {
        id: 12,
        titulo: 'Aprender mensageria',
        estado: 'emAndamento',
        valorAtual: 2,
        valorMensurado: 6,
        unidade: 'módulos',
        areaDaVida: 'estudosEAprendizado',
      },
    ]),
  );
  await screen.findByLabelText('Aprender mensageria: 2 de 6 módulos');
  fireEvent.press(screen.getByLabelText('Últimos seis meses completos'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/progresso?periodo=seisMeses',
    ),
  );
  expect(screen.getByLabelText('Aprender mensageria: 2 de 6 módulos')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Ver pesquisas desta área'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/referencias-publicas?tipoDia=todos&areaDaVida=ESTUDOS_E_APRENDIZADO',
    ),
  );
  expect(screen.getByRole('tab', { name: 'Pesquisas' }).props.accessibilityState.selected).toBe(
    true,
  );
});

it('mostra recorte ampliado, denominador e limites nos detalhes e trata falha de abrir a origem', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Sem navegador'));
  render(aplicativo());
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Sono Vigitel');
  fireEvent.press(screen.getAllByLabelText('Entender os dados')[0]);
  expect(await screen.findByText('O que este número não diz')).toBeTruthy();
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
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText(/Não foi possível carregar as referências/);
  falhaGold = false;
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByText('Sono Vigitel');
  areaSemMapa = true;
  fireEvent.press(screen.getByLabelText('Escolher área das pesquisas'));
  fireEvent.press(screen.getByLabelText('Finanças'));
  expect(
    await screen.findByText('Referência pública compatível de Finanças em breve no Icarus.'),
  ).toBeTruthy();
  expect(screen.queryByText('Sono ATUS')).toBeNull();
});

it('exibe relatório persistido e identifica IA, período e reflexão opcional', async () => {
  render(aplicativo('RelatorioSemanalScreen'));
  expect(await screen.findByText('Sua semana de registros')).toBeTruthy();
  expect(screen.getByText('REFLEXÃO COM INTELIGÊNCIA ARTIFICIAL')).toBeTruthy();
  expect(screen.getByText('12–18 out 2026')).toBeTruthy();
  expect(screen.getByText('Horário de São Paulo')).toBeTruthy();
  expect(screen.queryByText('Qual ajuste faz sentido agora?')).toBeNull();
  fireEvent.press(screen.getByLabelText('Uma pergunta para refletir'));
  expect(screen.getByText('Qual ajuste faz sentido agora?')).toBeTruthy();
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
  expect(screen.queryByText('REFLEXÃO COM INTELIGÊNCIA ARTIFICIAL')).toBeNull();
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
  await screen.findByText('Sua semana de registros');
  fireEvent.press(screen.getByLabelText('Ler resumo da semana'));
  expect(await screen.findByText('Resumo privado da conta B.')).toBeTruthy();
  await act(async () => {
    concluir(relatorioDeTeste('Resumo privado da conta A.'));
  });
  expect(screen.queryByText('Resumo privado da conta A.')).toBeNull();
});

it('mantém o vazio honesto e permite explorar pesquisas mesmo sem registros pessoais', async () => {
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((caminho, opcoes) =>
    caminho.includes('/progresso')
      ? Promise.resolve({
          ...progressoDeTeste(),
          estado: 'sem_registros',
          evolucao: null,
          indicadores: { quantidadeRegistros: 0 },
          mensagem: 'Você ainda não tem registros neste período.',
        })
      : normal(caminho, opcoes),
  );
  render(aplicativo());
  await screen.findByText('Você ainda não tem registros neste período.');
  expect(screen.queryByLabelText('0 missões feitas')).toBeNull();
  expect(screen.queryByLabelText('Ver mais números')).toBeNull();
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  expect(await screen.findByText('Sono Vigitel')).toBeTruthy();
});

it('não mostra o gráfico da conta anterior se sua resposta chegar depois da troca de sessão', async () => {
  let terminarA;
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((caminho, opcoes) => {
    if (caminho.includes('pessoa-a/progresso'))
      return new Promise((resolve) => {
        terminarA = resolve;
      });
    if (caminho.includes('pessoa-b/progresso'))
      return Promise.resolve({
        ...progressoDeTeste(),
        indicadores: { ...progressoDeTeste().indicadores, concluidas: 3 },
      });
    return normal(caminho, opcoes);
  });
  const tela = render(aplicativo());
  mockUsuarioId = 'pessoa-b';
  tela.rerender(aplicativo());
  expect(await screen.findByLabelText('3 missões feitas')).toBeTruthy();
  await act(async () => {
    terminarA({
      ...progressoDeTeste(),
      indicadores: { ...progressoDeTeste().indicadores, concluidas: 99 },
    });
  });
  expect(screen.queryByLabelText('99 missões feitas')).toBeNull();
});

it('mostra pontos e recompensas sob demanda sem tomar o lugar da evolução e da meta', async () => {
  render(aplicativo());
  await screen.findByLabelText('2 missões feitas');
  expect(screen.queryByLabelText('Pontos ganhos: 60')).toBeNull();
  fireEvent.press(screen.getByLabelText('Ver mais números'));
  expect(screen.getByLabelText('Pontos ganhos: 60')).toBeTruthy();
  expect(screen.getByLabelText('Recompensas resgatadas: 1')).toBeTruthy();
});

it('distingue a meta real dos pontos e avisa quando o prazo da meta passou', async () => {
  render(
    aplicativo('ProgressoScreen', [
      {
        id: 1,
        titulo: 'Acumular pontos',
        estado: 'emAndamento',
        valorAtual: 99,
        valorMensurado: 600,
        unidade: 'pontos ',
      },
      {
        id: 2,
        titulo: 'Reforçar a reserva',
        estado: 'emAndamento',
        valorAtual: 860,
        valorMensurado: 1200,
        unidade: 'reais',
        dataLimite: '15/10/2020',
        areaDaVida: 'financas',
      },
    ]),
  );
  expect(await screen.findByLabelText('Reforçar a reserva: 860 de 1.200 reais')).toBeTruthy();
  expect(screen.queryByText('Acumular pontos')).toBeNull();
  expect(screen.getByText('O prazo passou. Que tal rever o planejamento?')).toBeTruthy();
});
