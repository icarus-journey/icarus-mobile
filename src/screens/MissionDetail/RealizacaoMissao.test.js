import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { MissionDetailScreen } from './MissionDetailScreen';

let mockUsuario = 'titular';
const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: mockUsuario }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('../../utils/haptics', () => ({ vibrarConclusao: jest.fn() }));
const navigation = { goBack: jest.fn(), popToTop: jest.fn(), navigate: jest.fn() };
const execucao = {
  ocorrenciaId: 40,
  podeConcluir: true,
  concluida: false,
  dataPrevista: '2026-10-30',
  hoje: '2026-10-30',
  fusoHorario: 'America/Sao_Paulo',
  pontuacao: 30,
};
const missao = {
  id: 4,
  titulo: 'Ler uma aula',
  dificuldade: 'FACIL',
  pontos: 30,
  recorrente: true,
  corDestaque: '#7048d6',
  recompensaLabel: '30 pontos',
};
let mockExecutada;
let mockPost;
beforeEach(() => {
  mockUsuario = 'titular';
  mockExecutada = false;
  mockPost = null;
  mockRequisitar.mockReset().mockImplementation(async (rota, opcoes) => {
    if (opcoes?.metodo === 'POST') {
      if (mockPost) return mockPost(rota, opcoes);
      mockExecutada = true;
      return {
        id: 4,
        concluidaEm: '2026-10-31T01:10:30Z',
        realizadaEm: '2026-10-29T23:00:00Z',
        pontuacaoCreditada: 30,
      };
    }
    return {
      id: 4,
      versaoContrato: '1.3.0',
      status: 'ativa',
      recorrente: true,
      execucao: {
        ...execucao,
        podeConcluir: !mockExecutada,
        concluida: mockExecutada,
        ...(mockExecutada
          ? {
              realizadaEm: '2026-10-29T23:00:00Z',
              concluidaEm: '2026-10-31T01:10:30Z',
              fusoHorarioRealizacao: 'America/Sao_Paulo',
            }
          : {}),
      },
    };
  });
});
function aplicativo() {
  return (
    <CampaignsProvider initialCampaigns={[]}>
      <MissionsProvider initialMissions={[missao]}>
        <MissionDetailScreen navigation={navigation} route={{ params: { missionId: 4 } }} />
      </MissionsProvider>
    </CampaignsProvider>
  );
}
async function abrirOutroMomento() {
  await waitFor(() => screen.getByLabelText('Fiz em outro momento'));
  fireEvent.press(screen.getByLabelText('Fiz em outro momento'));
  fireEvent.changeText(screen.getByLabelText('Data'), '29102026');
  fireEvent.changeText(screen.getByLabelText('Horário'), '2000');
}
const envios = () => mockRequisitar.mock.calls.filter(([, opcoes]) => opcoes?.metodo === 'POST');

it('agora é o fluxo padrão com um toque e sem campos ou momento congelado no payload', async () => {
  render(aplicativo());
  await waitFor(() => screen.getByLabelText('Concluir agora'));
  expect(screen.queryByLabelText('Data')).toBeNull();
  expect(screen.queryByLabelText('Horário')).toBeNull();
  await act(async () => fireEvent.press(screen.getByLabelText('Concluir agora')));
  expect(envios()).toEqual([
    ['/api/usuarios/titular/missoes/4/concluir', { metodo: 'POST', corpo: { ocorrenciaId: 40 } }],
  ]);
  await waitFor(() => screen.getByText('29/10/2026 às 20:00'));
  expect(screen.queryByLabelText('Fiz em outro momento')).toBeNull();
});

it('abre a exceção sob demanda e só envia data/hora após confirmação explícita', async () => {
  render(aplicativo());
  await abrirOutroMomento();
  expect(envios()).toHaveLength(0);
  expect(screen.getByText('Prevista para 30/10/2026')).toBeTruthy();
  await act(async () => fireEvent.press(screen.getByLabelText('Confirmar conclusão')));
  expect(envios()[0]).toEqual([
    '/api/usuarios/titular/missoes/4/concluir',
    {
      metodo: 'POST',
      corpo: {
        ocorrenciaId: 40,
        dataRealizacao: '2026-10-29',
        horarioRealizacao: '20:00:00',
        dataPrevistaEsperada: '2026-10-30',
        fusoHorarioEsperado: 'America/Sao_Paulo',
      },
    },
  ]);
  expect(screen.queryByText('Quando você fez?')).toBeNull();
});

it('cancelar descarta a escolha e o botão principal continua usando agora', async () => {
  render(aplicativo());
  await abrirOutroMomento();
  fireEvent.press(screen.getByLabelText('Cancelar'));
  expect(envios()).toHaveLength(0);
  expect(screen.queryByLabelText('Data')).toBeNull();
  await act(async () => fireEvent.press(screen.getByLabelText('Concluir agora')));
  expect(envios()[0][1].corpo).toEqual({ ocorrenciaId: 40 });
});

it('valida data e horário sem fechar a janela ou enviar dados inválidos', async () => {
  render(aplicativo());
  await abrirOutroMomento();
  fireEvent.changeText(screen.getByLabelText('Data'), '31022026');
  fireEvent.changeText(screen.getByLabelText('Horário'), '2560');
  fireEvent.press(screen.getByLabelText('Confirmar conclusão'));
  expect(screen.getByText('Informe uma data válida.')).toBeTruthy();
  expect(screen.getByText('Informe um horário entre 00:00 e 23:59.')).toBeTruthy();
  expect(envios()).toHaveLength(0);
});

it('erro preserva o rascunho e permite repetir sem mudar a execução escolhida', async () => {
  mockPost = async () => {
    throw Object.assign(new Error('indisponível'), { status: 503 });
  };
  render(aplicativo());
  await abrirOutroMomento();
  await act(async () => fireEvent.press(screen.getByLabelText('Confirmar conclusão')));
  expect(screen.getByText('Não foi possível concluir. Tente novamente.')).toBeTruthy();
  expect(screen.getByLabelText('Data').props.value).toBe('29/10/2026');
  expect(screen.getByLabelText('Horário').props.value).toBe('20:00');
  mockPost = null;
  await act(async () => fireEvent.press(screen.getByLabelText('Confirmar conclusão')));
  expect(envios()).toHaveLength(2);
  expect(envios()[0][1]).toEqual(envios()[1][1]);
});

it('API recusa futuro sem perder os campos nem mostrar sucesso', async () => {
  mockPost = async () => {
    throw Object.assign(new Error(), { status: 400, codigo: 'realizacao_futura' });
  };
  render(aplicativo());
  await abrirOutroMomento();
  await act(async () => fireEvent.press(screen.getByLabelText('Confirmar conclusão')));
  expect(screen.getByText('Escolha um momento que já passou.')).toBeTruthy();
  expect(screen.getByLabelText('Data').props.value).toBe('29/10/2026');
  expect(screen.queryByText('Missão concluída')).toBeNull();
});

it('bloqueia toque repetido enquanto confirma e mantém o formulário no mesmo alvo', async () => {
  let resolver;
  mockPost = () =>
    new Promise((resolve) => {
      resolver = resolve;
    });
  render(aplicativo());
  await abrirOutroMomento();
  fireEvent.press(screen.getByLabelText('Confirmar conclusão'));
  fireEvent.press(screen.getByLabelText('Concluindo...'));
  expect(envios()).toHaveLength(1);
  expect(screen.getByLabelText('Data').props.editable).toBe(false);
  await act(async () => {
    mockExecutada = true;
    resolver({ id: 4, concluidaEm: '2026-10-31T01:10:30Z', pontuacaoCreditada: 30 });
  });
});

it('fecha o formulário da conta anterior ao trocar a sessão', async () => {
  const tela = render(aplicativo());
  await abrirOutroMomento();
  mockUsuario = 'outro-titular';
  tela.rerender(aplicativo());
  await waitFor(() => expect(screen.queryByText('Quando você fez?')).toBeNull());
  expect(envios()).toHaveLength(0);
});

it('API antiga mantém concluir agora e oculta a escolha que ela ainda não suporta', async () => {
  mockRequisitar.mockResolvedValueOnce({
    id: 4,
    status: 'ativa',
    recorrente: true,
    versaoContrato: '1.2.0',
    execucao,
  });
  render(aplicativo());
  await waitFor(() => screen.getByLabelText('Concluir agora'));
  expect(screen.queryByLabelText('Fiz em outro momento')).toBeNull();
  expect(screen.queryByLabelText('Data')).toBeNull();
});
