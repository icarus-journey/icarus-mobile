import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ContaScreen } from './ContaScreen';

const mockRequisitar = jest.fn();
const mockSair = jest.fn();
let mockUsuarioId = 'pessoa-a';
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    requisitarAutenticado: mockRequisitar,
    sair: mockSair,
  }),
}));
let perfil;
function tela() {
  return (
    <NavigationContainer>
      <ContaScreen navigation={{ navigate: jest.fn() }} />
    </NavigationContainer>
  );
}
async function abrir() {
  const resultado = render(tela());
  await screen.findByLabelText('Nome: Ana Silva');
  return resultado;
}
async function selecionar(label, opcao) {
  fireEvent.press(screen.getByLabelText(label));
  fireEvent.press(screen.getByLabelText(opcao));
}
beforeEach(() => {
  mockUsuarioId = 'pessoa-a';
  perfil = {
    id: mockUsuarioId,
    nome: 'Ana Silva',
    email: 'ana@exemplo.com',
    dataNascimento: '2000-12-31',
    estuda: null,
    cargaHorariaEstudoSemanal: null,
    trabalha: null,
    cargaHorariaTrabalhoSemanal: null,
  };
  mockSair.mockReset().mockResolvedValue();
  mockRequisitar.mockReset().mockImplementation(async (_caminho, opcoes) => {
    if (opcoes) perfil = { ...perfil, ...opcoes.corpo };
    return { ...perfil };
  });
});

it('consulta dados reais e mantém o cadastro somente para leitura', async () => {
  await abrir();
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a');
  expect(screen.getByLabelText('Nome: Ana Silva')).toBeTruthy();
  expect(screen.getByLabelText('E-mail: ana@exemplo.com')).toBeTruthy();
  expect(screen.getByLabelText('Data de nascimento: 31/12/2000')).toBeTruthy();
  expect(screen.queryByLabelText('Nome')).toBeNull();
  expect(screen.queryByLabelText('Telefone')).toBeNull();
  expect(screen.getAllByText('Não informado')).toHaveLength(2);
});

it('salva somente os campos analíticos e aceita horas com vírgula', async () => {
  await abrir();
  await selecionar('Você estuda?', 'Sim');
  fireEvent.changeText(screen.getByLabelText('Horas de estudo por semana'), '20,25');
  await selecionar('Você trabalha?', 'Não');
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Salvar alterações'));
  });
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/perfil', {
    metodo: 'PUT',
    corpo: {
      estuda: true,
      cargaHorariaEstudoSemanal: 20.25,
      trabalha: false,
      cargaHorariaTrabalhoSemanal: null,
    },
  });
  expect(await screen.findByText('Alterações salvas.')).toBeTruthy();
});

it('permite retirar informações existentes sem converter ausência em não', async () => {
  perfil.estuda = true;
  perfil.cargaHorariaEstudoSemanal = 20;
  await abrir();
  await selecionar('Você estuda?', 'Não informado');
  expect(screen.queryByLabelText('Horas de estudo por semana')).toBeNull();
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Salvar alterações'));
  });
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/pessoa-a/perfil', {
    metodo: 'PUT',
    corpo: {
      estuda: null,
      cargaHorariaEstudoSemanal: null,
      trabalha: null,
      cargaHorariaTrabalhoSemanal: null,
    },
  });
});

it('valida horas antes de enviar e preserva o formulário quando a API falha', async () => {
  await abrir();
  await selecionar('Você estuda?', 'Sim');
  fireEvent.changeText(screen.getByLabelText('Horas de estudo por semana'), '169');
  fireEvent.press(screen.getByLabelText('Salvar alterações'));
  expect(screen.getByText('Informe de 0 a 168 horas, com até duas casas decimais.')).toBeTruthy();
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  fireEvent.changeText(screen.getByLabelText('Horas de estudo por semana'), '10');
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Salvar alterações'));
  });
  expect(await screen.findByText(/Não foi possível salvar seu perfil/)).toBeTruthy();
  expect(screen.getByLabelText('Horas de estudo por semana').props.value).toBe('10');
  expect(screen.queryByText('Alterações salvas.')).toBeNull();
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Salvar alterações'));
  });
  expect(await screen.findByText('Alterações salvas.')).toBeTruthy();
});

it('aguarda a confirmação da API e bloqueia envio duplicado', async () => {
  await abrir();
  let concluir;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        concluir = resolve;
      }),
  );
  fireEvent.press(screen.getByLabelText('Salvar alterações'));
  fireEvent.press(screen.getByLabelText('Salvando…'));
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  expect(screen.queryByText('Alterações salvas.')).toBeNull();
  await act(async () => {
    concluir(perfil);
  });
  expect(await screen.findByText('Alterações salvas.')).toBeTruthy();
});

it('trata erro na consulta e permite tentar novamente', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  render(tela());
  await screen.findByText(/Não foi possível carregar seu perfil/);
  expect(screen.queryByLabelText('Salvar alterações')).toBeNull();
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  expect(await screen.findByLabelText('Nome: Ana Silva')).toBeTruthy();
});

it('exige confirmação para sair e cancelar mantém a sessão', async () => {
  await abrir();
  fireEvent.press(screen.getByLabelText('Sair da conta'));
  expect(screen.getByText('Sair da conta?')).toBeTruthy();
  expect(mockSair).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('Cancelar'));
  expect(screen.queryByText('Sair da conta?')).toBeNull();
  expect(mockSair).not.toHaveBeenCalled();
  fireEvent.press(screen.getByLabelText('Sair da conta'));
  await act(async () => {
    fireEvent.press(screen.getByLabelText('Sim, sair da conta'));
  });
  expect(mockSair).toHaveBeenCalledTimes(1);
});

it('ignora uma consulta antiga depois da troca de conta', async () => {
  let concluir;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        concluir = resolve;
      }),
  );
  const resultado = render(tela());
  mockUsuarioId = 'pessoa-b';
  perfil = { ...perfil, id: 'pessoa-b', nome: 'Beatriz Souza' };
  resultado.rerender(tela());
  expect(await screen.findByLabelText('Nome: Beatriz Souza')).toBeTruthy();
  await act(async () => {
    concluir({ ...perfil, nome: 'Ana Silva' });
  });
  await waitFor(() => expect(screen.queryByText('Ana Silva')).toBeNull());
});
