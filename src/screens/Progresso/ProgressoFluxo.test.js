import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import {
  progressoDeTeste,
  referenciasDeTeste,
  pesquisasQuantitativasDeTeste,
  relatorioDeTeste,
  evolucaoDaMetaDeTeste,
} from '../../testUtils/dadosAnaliticos';

import { objetivosDeTeste } from '../../testUtils/objetivosAnaliticos';

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
let respostaMeta;
let respostaProgresso;
let respostaPublica;
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
  respostaMeta = evolucaoDaMetaDeTeste();
  respostaProgresso = {
    ...progressoDeTeste(),
    versaoContrato: '1.4.0',
    objetivos: objetivosDeTeste(),
    adesao: {
      estado: 'disponivel',
      previstasRegistradas: 17,
      concluidasDoPlanejamento: 12,
      pendentes: 5,
      atrasadas: 0,
      taxaConclusao: 70.6,
    },
    comparacaoSemanal: comparacaoDeTeste(),
    diferencaFeitasSemanaAnterior: 2,
  };
  respostaProgresso.objetivos.campanhas[0].resultado.cenarioAtual.prazo = {
    referencia: '2026-11-08',
    conclusaoEstimada: '2026-12-06',
    prazoFim: '2026-12-13',
    diasAtePrazo: 35,
    margemDias: 7,
    ritmoSemanalNecessario: 1.6,
    situacao: 'antes_do_prazo',
  };
  respostaPublica = pesquisasQuantitativasDeTeste();
  respostaPublica.areaDaVida = 'SONO_E_RECUPERACAO';
  respostaPublica.referencias[0].dados.indicador = 'vigitel_duracao_sono_habitual';
  mockRequisitar.mockReset().mockImplementation(async (caminho) => {
    if (caminho.includes('/referencias-publicas')) {
      if (falhaGold) throw new Error('Sem conexão');
      return areaSemMapa
        ? {
            ...referenciasDeTeste(),
            estado: 'sem_mapeamento',
            referencias: [],
            leituras: [],
            mensagem: 'Referência pública compatível de Finanças em breve no Icarus.',
          }
        : respostaPublica;
    }
    if (/\/campanhas\/\d+\/progresso/.test(caminho)) return respostaMeta;
    if (caminho.includes('/progresso')) return respostaProgresso;
    return respostaRelatorio;
  });
});

function comparacaoDeTeste() {
  const semana = (fim, previstas, concluidas, taxaConclusao) => ({
    periodo: {
      inicio: new Date(Date.parse(fim) - 6 * 86400000).toISOString().slice(0, 10),
      fim,
      fusoHorario: 'America/Sao_Paulo',
    },
    estado: 'disponivel',
    previstas,
    concluidas,
    taxaConclusao,
  });
  return {
    semana: semana('2026-10-18', 17, 12, 70.6),
    semanasAnteriores: [
      semana('2026-10-11', 14, 10, 71.4),
      semana('2026-10-04', 14, 9, 64.3),
      semana('2026-09-27', 13, 8, 61.5),
      semana('2026-09-20', 12, 7, 58.3),
    ],
    mediaQuatroSemanas: { previstas: 13.25, concluidas: 8.5, taxaConclusao: 63.9 },
    podeCompararSemanaAnterior: true,
    podeCompararMediaQuatroSemanas: true,
  };
}
it('abre progresso pelo início sem destino Minha semana nem geração no início', async () => {
  render(aplicativo('MissionList'));
  await screen.findByLabelText('Meu progresso');
  expect(screen.queryByLabelText('Ver meu progresso')).toBeNull();
  expect(mockRequisitar.mock.calls.some(([r]) => r.includes('/relatorios/'))).toBe(false);
  fireEvent.press(screen.getByLabelText('Meu progresso'));
  await screen.findByText('12 de 17 missões feitas');
  expect(screen.getByRole('tab', { name: 'Meu progresso' })).toBeTruthy();
  expect(screen.queryByText('Minha semana')).toBeNull();
  expect(screen.queryByLabelText('Sobre estes números')).toBeNull();
});
it('mostra meta primeiro, compara planejamento e abre explicação com eixos', async () => {
  render(aplicativo());
  await screen.findByText('Antes do prazo, se mantiver o ritmo.');
  expect(screen.getByText('2 missões feitas a mais que na semana anterior.')).toBeTruthy();
  expect(screen.queryByText('Evolução da meta')).toBeNull();
  fireEvent.press(screen.getByLabelText('Ver minha meta'));
  await screen.findByText('Evolução da meta');
  expect(screen.getByText(/1,6 módulos por semana/)).toBeTruthy();
  expect(screen.getByText('Data do registro')).toBeTruthy();
  expect(screen.queryByText(/Por que .*prazo/)).toBeNull();
  expect(screen.queryByLabelText('Atualizar meta')).toBeNull();
  expect(screen.getByLabelText('Abrir campanha')).toBeTruthy();
});
it('altera período sem consultar pesquisas nem gerar relatório', async () => {
  render(aplicativo());
  await screen.findByText('12 de 17 missões feitas');
  fireEvent.press(screen.getByLabelText('Mês anterior completo'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/progresso?periodo=mesAnterior',
      expect.objectContaining({ signal: expect.anything() }),
    ),
  );
  expect(
    mockRequisitar.mock.calls.every(
      ([r]) => !r.includes('/referencias-publicas') && !r.includes('/relatorios/'),
    ),
  ).toBe(true);
});
it('mantém os gráficos visíveis sem a grade de indicadores nem o acesso ao histórico', async () => {
  render(aplicativo());
  await screen.findByText('12 de 17 missões feitas');
  expect(screen.queryByText('Outros registros do período')).toBeNull();
  expect(screen.queryByLabelText('Ver mais números')).toBeNull();
  expect(screen.queryByLabelText('Relatórios salvos')).toBeNull();
  for (const rotulo of [
    'Dias com missões feitas',
    'Pontos ganhos',
    'Recompensas resgatadas',
    'Pontos utilizados',
    'Planejadas no período',
    'Feitas do planejamento',
    'Pendentes ao fechar',
    'Em atraso ao fechar',
    'Taxa de conclusão',
  ]) {
    expect(screen.queryByText(rotulo)).toBeNull();
  }
  expect(screen.getByLabelText('2 missões feitas')).toBeTruthy();
  expect(screen.getByText('Por área da vida')).toBeTruthy();
  expect(screen.queryByText(/Seus registros mostram parte da rotina/)).toBeNull();
  expect(screen.getByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeTruthy();
});
it('mostra gráfico das semanas e interpretação somente quando usa a mesma base', async () => {
  respostaRelatorio.relatorio = {
    ...respostaRelatorio.relatorio,
    versaoIndicadores: '1.2.0',
    comparacaoSemanal: comparacaoDeTeste(),
    texto: {
      titulo: 'Você concluiu mais nesta semana',
      resumo: 'O volume cresceu e a proporção ficou próxima da anterior.',
      proximoAjuste: null,
    },
  };
  render(aplicativo('RelatorioSemanalScreen'));
  await screen.findByText('Últimas 4 semanas');
  expect(await screen.findByText('Você concluiu mais nesta semana')).toBeTruthy();
  expect(
    screen.getByLabelText(/Semana encerrada em 2026-10-18: 12 feitas de 17 planejadas/),
  ).toBeTruthy();
  expect(screen.queryByLabelText('Relatórios salvos')).toBeNull();
  expect(screen.queryByLabelText('Atualizar comparação')).toBeNull();
});
it('mantém relatório antigo no histórico sem aplicar sua interpretação a números atuais', async () => {
  render(aplicativo('RelatorioSemanalScreen'));
  await screen.findByText('Últimas 4 semanas');
  expect(screen.queryByText('Reveja um próximo passo possível.')).toBeNull();
  expect(
    screen.queryByText('A comparação continua disponível sem uma nova leitura por IA.'),
  ).toBeNull();
});
it('exibe a pesquisa de sono sem formulário ou coleta pessoal', async () => {
  render(aplicativo());
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Atividade física e sono');
  expect(screen.queryByText('Informar meu sono')).toBeNull();
  expect(screen.queryByText('Atualizar meu relato')).toBeNull();
  expect(mockRequisitar.mock.calls.every(([r]) => !r.includes('/relato-sono'))).toBe(true);
});
it('não apresenta relato anterior nem transforma a pesquisa em avaliação pessoal', async () => {
  respostaPublica.relatoSono = {
    habitualMinutos: 360,
    metaMinutos: 420,
    diferencaParaMetaMinutos: 60,
  };
  respostaPublica.contextoSono = {
    inicioFaixaMinutos: 360,
    fimFaixaMinutos: 480,
    posicaoNaFaixa: 'inicio',
  };
  render(aplicativo());
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Atividade física e sono');
  expect(screen.queryByText('1 h abaixo da sua meta')).toBeNull();
  expect(screen.queryByText('Seu sono em contexto')).toBeNull();
  expect(screen.queryByText(/você está dormindo pouco/i)).toBeNull();
});
it('alterna as duas relações de sono e mantém a leitura visível durante reconsulta', async () => {
  render(aplicativo());
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Atividade física e sono');
  fireEvent.press(screen.getByText('Ver relação com a vontade de dormir mais'));
  expect(screen.getByText('68%')).toBeTruthy();
  expect(screen.getByText(/8% menos relatos/)).toBeTruthy();
  expect(screen.getByText('Ver relação com os sintomas de insônia')).toBeTruthy();
  let resolver;
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((r, o) =>
    r.includes('/referencias-publicas')
      ? new Promise((resolve) => {
          resolver = resolve;
        })
      : normal(r, o),
  );
  const rolagem = screen.UNSAFE_getAllByType(require('react-native').ScrollView)[0];
  act(() => {
    rolagem.props.refreshControl.props.onRefresh();
  });
  await waitFor(() => expect(resolver).toEqual(expect.any(Function)));
  expect(screen.getByText('Atividade física e vontade de dormir mais')).toBeTruthy();
  await act(async () => resolver(respostaPublica));
  expect(screen.getByText('Atividade física e vontade de dormir mais')).toBeTruthy();
});
it('troca campanha sem aceitar a resposta antiga sobre a nova seleção', async () => {
  let resolver;
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((r, o) =>
    r.includes('/referencias-publicas') && r.includes('campanhaId=12')
      ? new Promise((resolve) => {
          resolver = resolve;
        })
      : normal(r, o),
  );
  render(aplicativo());
  await screen.findByLabelText('Escolher campanha do progresso');
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await waitFor(() => expect(resolver).toEqual(expect.any(Function)));
  fireEvent.press(screen.getByLabelText('Escolher campanha das pesquisas'));
  fireEvent.press(screen.getByRole('button', { name: 'Caminhar no parque' }));
  await screen.findByText('Atividade física e sono');
  await act(async () => resolver(pesquisasQuantitativasDeTeste('ESTUDOS_E_APRENDIZADO')));
  expect(screen.queryByText('Estudo e trabalho')).toBeNull();
  expect(screen.getByText('Atividade física e sono')).toBeTruthy();
  expect(
    screen.getByLabelText('Escolher campanha das pesquisas').props.accessibilityValue.text,
  ).toBe('Caminhar no parque');
});
it('mostra ATUS quantitativo e leva recomendação, dados e fonte ao detalhe', async () => {
  respostaPublica = pesquisasQuantitativasDeTeste('ESTUDOS_E_APRENDIZADO');
  respostaPublica.evidencias = [
    { id: 'estudo_recuperacao_conteudo_2011', reflexao: 'Texto rejeitado' },
  ];
  render(aplicativo());
  await screen.findByLabelText('Aprender mensageria: 8 de 16 módulos');
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Estudo e trabalho');
  expect(screen.getByText(/Na sua campanha: \+2 módulos registrados/)).toBeTruthy();
  expect(screen.queryByText('Texto rejeitado')).toBeNull();
  expect(screen.queryByText(/ATUS 2024/)).toBeNull();
  fireEvent.press(screen.getByText('Ver participação em estudos'));
  expect(screen.getByText('20,7%')).toBeTruthy();
  expect(screen.getByText(/1 em cada 5/)).toBeTruthy();
  fireEvent.press(screen.getByText('Ver dados e relação'));
  await screen.findByText('Faça o estudo caber na sua rotina');
  expect(screen.getByText(/Pessoas de 18–28 anos dos Estados Unidos/)).toBeTruthy();
  expect(screen.getByText(/ATUS 2024/)).toBeTruthy();
  expect(screen.getByText('Ver fonte oficial')).toBeTruthy();
  expect(screen.queryByText('Ligação com sua campanha')).toBeNull();
  expect(screen.queryByText('Como interpretar')).toBeNull();
});
it('troca de conta descarta a resposta de progresso anterior', async () => {
  let resolver;
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((r, o) =>
    r.includes('/pessoa-a/progresso')
      ? new Promise((resolve) => {
          resolver = resolve;
        })
      : normal(r, o),
  );
  const tela = render(aplicativo());
  await waitFor(() => expect(resolver).toEqual(expect.any(Function)));
  mockUsuarioId = 'pessoa-b';
  respostaProgresso.objetivos.campanhas[0].titulo = 'Meta da conta B';
  tela.rerender(aplicativo());
  await screen.findByLabelText('Meta da conta B: 8 de 16 módulos');
  await act(async () => resolver({ ...progressoDeTeste(), objetivos: objetivosDeTeste() }));
  expect(screen.queryByText('Aprender mensageria')).toBeNull();
});
it('área sem mapeamento não inventa pesquisa nem classificação pessoal', async () => {
  areaSemMapa = true;
  render(aplicativo());
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Referência pública compatível de Finanças em breve no Icarus.');
  expect(screen.queryByText('Informar meu sono')).toBeNull();
});

it('mantém a campanha escolhida ao trocar período e aba, sem gravar uma preferência', async () => {
  render(aplicativo());
  await screen.findByLabelText('Escolher campanha do progresso');
  fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
  fireEvent.press(screen.getByRole('button', { name: 'Caminhar no parque' }));
  expect(
    screen.getByText('Esta campanha ainda não tem um resultado mensurado para exibir.'),
  ).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Mês anterior completo'));
  await waitFor(() =>
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/progresso?periodo=mesAnterior',
      expect.objectContaining({ signal: expect.anything() }),
    ),
  );
  expect(
    screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
  ).toBe('Caminhar no parque');
  fireEvent.press(screen.getByRole('tab', { name: 'Pesquisas' }));
  await screen.findByText('Atividade física e sono');
  fireEvent.press(screen.getByRole('tab', { name: 'Meu progresso' }));
  await screen.findByLabelText('Escolher campanha do progresso');
  expect(
    screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
  ).toBe('Caminhar no parque');
  expect(mockRequisitar.mock.calls.every(([, o]) => !o?.metodo || o.metodo === 'GET')).toBe(true);
});
it('não herda a campanha escolhida de outra conta', async () => {
  const tela = render(aplicativo());
  await screen.findByLabelText('Escolher campanha do progresso');
  fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
  fireEvent.press(screen.getByRole('button', { name: 'Caminhar no parque' }));
  mockUsuarioId = 'pessoa-b';
  tela.rerender(aplicativo());
  await screen.findByLabelText('Aprender mensageria: 8 de 16 módulos');
  expect(
    screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
  ).toBe('Aprender mensageria');
});
