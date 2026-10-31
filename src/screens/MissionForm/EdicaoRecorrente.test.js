import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider, useMissions } from '../../state/MissionsContext';
import { MissionFormScreen } from './MissionFormScreen';

const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'titular' }, requisitarAutenticado: mockRequisitar }),
}));

const navigation = { goBack: jest.fn() };
const missao = {
  id: 4,
  titulo: 'Título carregado anteriormente',
  dificuldade: 'FACIL',
  pontos: 30,
  recorrente: true,
  campanha: { id: 2, titulo: 'Curso' },
};
const dados = {
  versaoContrato: '1.1.0',
  id: 4,
  campanhaId: 2,
  titulo: 'Praticar leitura',
  descricao: 'Com atenção',
  beneficio: 'Aprender',
  dificuldade: 'media',
  pontuacao: 45,
  dataLimite: null,
  horario: '2026-10-01T18:30:00Z',
  status: 'ativa',
  recorrente: true,
  podeEditar: true,
  versao: 'versao-real',
  configuracaoRecorrencia: {
    tipo: 'semanal',
    diasSemana: ['monday', 'friday'],
    diaDoMes: null,
    dataInicio: '2026-10-01',
    dataFim: null,
    alteracoesAPartirDe: null,
  },
};

function Observador() {
  const { missions } = useMissions();
  return <Text testID="estado-missao">{JSON.stringify(missions)}</Text>;
}

function Pagina({ identificador = 4, inicial = missao }) {
  return (
    <CampaignsProvider initialCampaigns={[]}>
      <MissionsProvider initialMissions={[inicial]}>
        <MissionFormScreen
          navigation={navigation}
          route={{ params: { missionId: identificador } }}
        />
        <Observador />
      </MissionsProvider>
    </CampaignsProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequisitar.mockImplementation(async (_rota, opcoes) =>
    opcoes?.metodo === 'PATCH'
      ? {
          ...dados,
          titulo: opcoes.corpo.titulo,
          dificuldade: opcoes.corpo.dificuldade,
          pontuacao: 60,
          versao: 'versao-nova',
        }
      : dados,
  );
});

it('carrega configuração real e mantém vínculo somente para leitura', async () => {
  render(<Pagina />);
  expect(screen.getByText('Carregando missão...')).toBeTruthy();
  expect(screen.queryByText('Salvar alterações')).toBeNull();
  await waitFor(() => expect(screen.getByDisplayValue('Praticar leitura')).toBeTruthy());
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/missoes/4');
  expect(screen.getByText('Alterações valem a partir de amanhã.')).toBeTruthy();
  expect(screen.getByText('Dias da semana*')).toBeTruthy();
  expect(screen.getByLabelText('Seg').props.accessibilityState.selected).toBe(true);
  expect(screen.getByLabelText('Sex').props.accessibilityState.selected).toBe(true);
  expect(screen.getByText('Curso')).toBeTruthy();
  expect(screen.queryByText('Atribuir a uma campanha')).toBeNull();
});

it('envia versão, dias, fim e campos preservados sem reatribuir a campanha', async () => {
  render(<Pagina />);
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Ler duas aulas');
  fireEvent.press(screen.getByLabelText('Difícil'));
  fireEvent.press(screen.getByLabelText('Ter'));
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/titular/missoes/4', {
    metodo: 'PATCH',
    corpo: expect.objectContaining({
      titulo: 'Ler duas aulas',
      dificuldade: 'dificil',
      beneficio: 'Aprender',
      dataLimite: null,
      horario: '18:30',
      recorrencia: 'semanal',
      diasSemana: ['monday', 'friday', 'tuesday'],
      dataFimRecorrencia: null,
      diaDoMes: null,
      versaoEsperada: 'versao-real',
    }),
  });
  const envio = mockRequisitar.mock.calls.find(([, opcoes]) => opcoes?.metodo === 'PATCH')[1].corpo;
  expect(envio).not.toHaveProperty('campanhaId');
  expect(JSON.parse(screen.getByTestId('estado-missao').props.children)[0].titulo).toBe(
    'Ler duas aulas',
  );
});

it('permite ajustar o dia mensal e valida dias fora de 1 a 31', async () => {
  mockRequisitar.mockResolvedValue({
    ...dados,
    configuracaoRecorrencia: { ...dados.configuracaoRecorrencia, tipo: 'mensal', diaDoMes: 31 },
  });
  render(<Pagina />);
  await waitFor(() => screen.getByDisplayValue('31'));
  fireEvent.changeText(screen.getByLabelText('Dia do mês'), '32');
  fireEvent.press(screen.getByText('Salvar alterações'));
  expect(screen.getByText('Escolha um dia entre 1 e 31.')).toBeTruthy();
  expect(mockRequisitar.mock.calls.some(([, opcoes]) => opcoes?.metodo === 'PATCH')).toBe(false);
});

it('oferece repetição no erro de leitura, sem inventar uma regra padrão', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  render(<Pagina />);
  await waitFor(() => screen.getByText('Não foi possível carregar a missão.'));
  expect(screen.queryByText('Salvar alterações')).toBeNull();
  fireEvent.press(screen.getByText('Tentar novamente'));
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
});

it('preserva rascunho no conflito e não aplica alteração local nem volta de tela', async () => {
  mockRequisitar.mockImplementation(async (_rota, opcoes) => {
    if (opcoes?.metodo === 'PATCH') throw Object.assign(new Error(), { status: 409 });
    return dados;
  });
  render(<Pagina />);
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
  fireEvent.changeText(screen.getByLabelText('Título'), 'Minha alteração');
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() =>
    screen.getByText('Esta missão mudou. Volte aos detalhes e abra a edição novamente.'),
  );
  expect(screen.getByDisplayValue('Minha alteração')).toBeTruthy();
  expect(navigation.goBack).not.toHaveBeenCalled();
  expect(JSON.parse(screen.getByTestId('estado-missao').props.children)[0].titulo).toBe(
    missao.titulo,
  );
});

it('não transforma rota ausente, missão parada ou encerrada em criação', async () => {
  const pagina = render(<Pagina identificador={99} />);
  expect(screen.getByText('Esta missão não pode ser editada.')).toBeTruthy();
  expect(screen.queryByText('Nova missão')).toBeNull();
  pagina.unmount();
  render(<Pagina inicial={{ ...missao, inativa: true }} />);
  expect(screen.getByText('Esta missão não pode ser editada.')).toBeTruthy();
  expect(screen.queryByText('Salvar alterações')).toBeNull();
  await act(async () => {});
});

it('descarta resposta da consulta após sair da sessão', async () => {
  let responder;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        responder = resolve;
      }),
  );
  const primeira = render(<Pagina />);
  primeira.unmount();
  render(<Pagina />);
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
  await act(async () => responder({ ...dados, titulo: 'Outra conta' }));
  expect(screen.queryByDisplayValue('Outra conta')).toBeNull();
});

it('troca a regra para mensal enviando o dia escolhido e bloqueia toque duplicado durante o envio', async () => {
  let concluir;
  mockRequisitar.mockImplementation(async (_rota, opcoes) => {
    if (opcoes?.metodo === 'PATCH')
      return new Promise((resolve) => {
        concluir = resolve;
      });
    return dados;
  });
  render(<Pagina />);
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
  fireEvent.press(screen.getByLabelText('Mensal'));
  fireEvent.changeText(screen.getByLabelText('Dia do mês'), '31');
  fireEvent.press(screen.getByText('Salvar alterações'));
  fireEvent.press(screen.getByText('Salvar alterações'));
  const envios = mockRequisitar.mock.calls.filter(([, opcoes]) => opcoes?.metodo === 'PATCH');
  expect(envios).toHaveLength(1);
  expect(envios[0][1].corpo).toMatchObject({
    recorrencia: 'mensal',
    diaDoMes: 31,
    diasSemana: null,
    versaoEsperada: 'versao-real',
  });
  await act(async () => concluir(dados));
});

it('configuração excluída informa ausência e não habilita salvar', async () => {
  mockRequisitar.mockRejectedValue(Object.assign(new Error(), { status: 404 }));
  render(<Pagina />);
  await waitFor(() => screen.getByText('Esta missão não está mais disponível.'));
  expect(screen.queryByText('Salvar alterações')).toBeNull();
});

it('editar a regra não desfaz a conclusão da execução atual apresentada na sessão', async () => {
  const concluidaEm = '2026-10-30T12:00:00Z';
  render(<Pagina inicial={{ ...missao, concluidaEm }} />);
  await waitFor(() => screen.getByDisplayValue('Praticar leitura'));
  fireEvent.press(screen.getByText('Salvar alterações'));
  await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  expect(JSON.parse(screen.getByTestId('estado-missao').props.children)[0].concluidaEm).toBe(
    concluidaEm,
  );
});
