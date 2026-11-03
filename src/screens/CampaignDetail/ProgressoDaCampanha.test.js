import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ProgressoDaCampanha } from './ProgressoDaCampanha';

let mockUsuarioId = 'conta-1';
const mockRequisitar = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (efeito) => require('react').useEffect(efeito, [efeito]),
}));

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    requisitarAutenticado: mockRequisitar,
  }),
}));

const INICIAL = {
  versaoContrato: '1.0.0',
  campanhaId: 1,
  valorAtual: 2,
  valorMensurado: 12,
  unidade: 'módulos',
  estado: 'emAndamento',
  podeRegistrar: true,
  metaAlcancada: false,
  versao: 'versao-1',
  medicoes: [],
};
let resposta;
const aoAtualizar = jest.fn();
const aoConcluir = jest.fn();
const aoDefinirMeta = jest.fn();
const propriedades = { campanhaId: 1, aoAtualizar, aoConcluir, aoDefinirMeta };

beforeEach(() => {
  mockUsuarioId = 'conta-1';
  resposta = { ...INICIAL };
  jest.clearAllMocks();
  mockRequisitar.mockReset().mockImplementation(async (_rota, opcoes) => {
    if (opcoes?.metodo === 'POST') {
      resposta = {
        ...resposta,
        valorAtual: opcoes.corpo.valorAtual,
        versao: 'versao-2',
        metaAlcancada: opcoes.corpo.valorAtual >= resposta.valorMensurado,
        medicoes: [
          {
            id: 1,
            valorAnterior: resposta.valorAtual,
            valorAtual: opcoes.corpo.valorAtual,
            valorMensurado: 12,
            unidade: 'módulos',
            registradaEm: '2026-10-25T15:00:00Z',
            fusoHorario: 'America/Sao_Paulo',
          },
        ],
      };
    }
    return resposta;
  });
});

async function abrirRegistro() {
  await screen.findByLabelText('Registrar progresso');
  fireEvent.press(screen.getByLabelText('Registrar progresso'));
}

it('salva o total com vírgula, atualiza a campanha e recupera o histórico ao reabrir', async () => {
  const tela = render(<ProgressoDaCampanha {...propriedades} />);
  await abrirRegistro();
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '5,5');
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByText('Progresso registrado.');
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/conta-1/campanhas/1/progresso', {
    metodo: 'POST',
    corpo: { valorAtual: 5.5, versaoEsperada: 'versao-1', operacaoId: expect.any(String) },
  });
  expect(aoAtualizar).toHaveBeenLastCalledWith(1, expect.objectContaining({ valorAtual: 5.5 }));
  tela.unmount();
  render(<ProgressoDaCampanha {...propriedades} />);
  await screen.findByText('Seu caminho até aqui');
  expect(screen.getAllByText('5,5 de 12 módulos').length).toBeGreaterThan(0);
});

it('mantém valor e identificador de tentativa após falha e bloqueia toques enquanto envia', async () => {
  render(<ProgressoDaCampanha {...propriedades} />);
  await abrirRegistro();
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '4');
  let rejeitar;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((_resolve, reject) => {
        rejeitar = reject;
      }),
  );
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  fireEvent.press(screen.getByLabelText('Salvando progresso…'));
  const primeira = mockRequisitar.mock.calls.at(-1)[1].corpo.operacaoId;
  expect(mockRequisitar.mock.calls.filter(([, o]) => o?.metodo === 'POST')).toHaveLength(1);
  await act(async () => rejeitar(new Error('Sem conexão')));
  expect(screen.getByDisplayValue('4')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByText('Progresso registrado.');
  expect(mockRequisitar.mock.calls.at(-1)[1].corpo.operacaoId).toBe(primeira);
});

it('aceita redução e pede confirmação explícita para concluir ao ultrapassar a meta', async () => {
  render(<ProgressoDaCampanha {...propriedades} />);
  await abrirRegistro();
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '1');
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByLabelText('Ver registros da meta');
  fireEvent.press(screen.getByLabelText('Ver registros da meta'));
  await screen.findByText('Valor revisado');
  await abrirRegistro();
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '14');
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByText('Deseja concluir esta campanha?');
  expect(aoConcluir).not.toHaveBeenCalled();
  expect(screen.getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  expect(screen.getAllByText('14 de 12 módulos').length).toBeGreaterThan(0);
  fireEvent.press(screen.getByLabelText('Concluir esta meta'));
  expect(aoConcluir).toHaveBeenCalledTimes(1);
});

it('descarta resposta tardia ao trocar de conta, inclusive callbacks de atualização', async () => {
  let resolver;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolver = resolve;
      }),
  );
  const tela = render(<ProgressoDaCampanha {...propriedades} />);
  mockUsuarioId = 'conta-2';
  mockRequisitar.mockResolvedValueOnce({ ...INICIAL, valorAtual: 9 });
  tela.rerender(<ProgressoDaCampanha {...propriedades} />);
  await screen.findByText('9 de 12 módulos');
  await act(async () => resolver(INICIAL));
  expect(screen.queryByText('2 de 12 módulos')).toBeNull();
  expect(aoAtualizar).toHaveBeenCalledTimes(1);
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/conta-2/campanhas/1/progresso');
});

it('trata carregamento indisponível, repetição e campanha sem meta', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('Indisponível'));
  render(<ProgressoDaCampanha {...propriedades} />);
  await screen.findByText('Não foi possível carregar seu progresso. Tente novamente.');
  mockRequisitar.mockResolvedValueOnce({
    ...INICIAL,
    valorMensurado: null,
    estado: 'planejada',
    unidade: null,
    podeRegistrar: false,
  });
  fireEvent.press(screen.getByLabelText('Atualizar histórico da meta'));
  await screen.findByLabelText('Definir minha meta');
  expect(screen.queryByLabelText('Registrar progresso')).toBeNull();
  fireEvent.press(screen.getByLabelText('Definir minha meta'));
  expect(aoDefinirMeta).toHaveBeenCalledTimes(1);
});

it('não permite salvar valor inválido e informa conflito sem perder o rascunho', async () => {
  render(<ProgressoDaCampanha {...propriedades} />);
  await abrirRegistro();
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '-2');
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByText('Informe um valor a partir de zero, com até duas casas decimais.');
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  fireEvent.changeText(screen.getByLabelText('Quanto você já alcançou?'), '3');
  mockRequisitar.mockRejectedValueOnce({ status: 409, codigo: 'dados_atualizados' });
  fireEvent.press(screen.getByLabelText('Salvar progresso'));
  await screen.findByText(
    'Sua meta mudou. Atualize o histórico e revise o valor antes de tentar novamente.',
  );
  expect(screen.getByDisplayValue('3')).toBeTruthy();
  expect(aoAtualizar).toHaveBeenCalledTimes(1);
});

it('mantém histórico de campanha concluída sem oferecer novo registro', async () => {
  mockRequisitar.mockResolvedValueOnce({ ...INICIAL, estado: 'concluida', podeRegistrar: false });
  render(<ProgressoDaCampanha {...propriedades} />);
  await waitFor(() => expect(screen.getByText('Seu caminho até aqui')).toBeTruthy());
  expect(screen.queryByLabelText('Registrar progresso')).toBeNull();
});
