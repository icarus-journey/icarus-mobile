import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ContaScreen } from './ContaScreen';

const mockRequisitar = jest.fn();
let mockUsuario = 'pessoa-a',
  mockFocar,
  mockDesfocar;
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuario },
    requisitarAutenticado: mockRequisitar,
    sair: jest.fn(),
  }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) =>
    require('react').useEffect(() => {
      let limpar = callback();
      mockDesfocar = () => limpar?.();
      mockFocar = () => {
        limpar = callback();
      };
      return () => limpar?.();
    }, [callback]),
}));
const perfil = {
  id: 'pessoa-a',
  nome: 'Ana Silva',
  email: 'ana@exemplo.com',
  dataNascimento: '2000-01-01',
  temFoto: true,
  estuda: true,
  cargaHorariaEstudoSemanal: 20,
};
const foto = { conteudo: new Uint8Array([65, 66, 67]), tipo: 'image/jpeg' };
const tela = () => <ContaScreen navigation={{ navigate: jest.fn() }} />;
function pendente() {
  let resolver;
  const promessa = new Promise((r) => {
    resolver = r;
  });
  return { promessa, resolver: (valor) => resolver(valor) };
}
beforeEach(() => {
  mockUsuario = 'pessoa-a';
  mockRequisitar
    .mockReset()
    .mockImplementation((rota) => Promise.resolve(rota.endsWith('/foto') ? foto : perfil));
});

it('apresenta o perfil e a foto juntos na primeira leitura', async () => {
  const imagem = pendente();
  mockRequisitar.mockImplementation((rota) =>
    rota.endsWith('/foto') ? imagem.promessa : Promise.resolve(perfil),
  );
  render(tela());
  await waitFor(() => expect(mockRequisitar).toHaveBeenCalledTimes(2));
  expect(screen.queryByLabelText('Nome: Ana Silva')).toBeNull();
  expect(screen.getByLabelText('Carregando perfil')).toBeTruthy();
  await act(async () => imagem.resolver(foto));
  expect(screen.getByLabelText('Nome: Ana Silva')).toBeTruthy();
  expect(screen.getByLabelText('Foto de perfil de Ana Silva')).toBeTruthy();
});

it('não desmonta os campos nem a foto durante a atualização ao voltar', async () => {
  render(tela());
  const nome = await screen.findByLabelText('Nome: Ana Silva');
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  const imagem = screen.getByLabelText('Foto de perfil de Ana Silva');
  const consulta = pendente();
  mockRequisitar.mockReturnValueOnce(consulta.promessa);
  act(() => {
    mockDesfocar();
    mockFocar();
  });
  expect(screen.getByLabelText('Nome: Ana Silva')).toBe(nome);
  expect(screen.getByLabelText('Foto de perfil de Ana Silva')).toBe(imagem);
  expect(screen.queryByLabelText('Carregando perfil')).toBeNull();
  expect(screen.getByLabelText('Salvar alterações')).toBeEnabled();
  await act(async () => consulta.resolver(perfil));
  expect(screen.getByLabelText('Nome: Ana Silva')).toBe(nome);
});

it('permite salvar durante a atualização sem aceitar a leitura antiga depois', async () => {
  render(tela());
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  const imagem = pendente();
  mockRequisitar.mockImplementation((rota, opcoes) => {
    if (opcoes?.metodo === 'PUT') return Promise.resolve({ ...perfil, ...opcoes.corpo });
    return rota.endsWith('/foto') ? imagem.promessa : Promise.resolve(perfil);
  });
  act(() => {
    mockDesfocar();
    mockFocar();
  });
  await waitFor(() => expect(mockRequisitar).toHaveBeenCalledTimes(4));
  const sinal = mockRequisitar.mock.calls[3][1].signal;
  fireEvent.changeText(screen.getByLabelText('Horas de estudo por semana'), '12');
  fireEvent.press(screen.getByLabelText('Salvar alterações'));
  await screen.findByText('Alterações salvas.');
  expect(sinal.aborted).toBe(true);
  await act(async () => imagem.resolver(foto));
  expect(screen.getByLabelText('Horas de estudo por semana').props.value).toBe('12');
  expect(screen.getByText('Alterações salvas.')).toBeTruthy();
});

it('uma resposta de atualização não sobrescreve o que foi digitado enquanto aguardava', async () => {
  render(tela());
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  const consulta = pendente();
  mockRequisitar.mockReturnValueOnce(consulta.promessa);
  act(() => {
    mockDesfocar();
    mockFocar();
  });
  fireEvent.changeText(screen.getByLabelText('Horas de estudo por semana'), '12');
  await act(async () => consulta.resolver(perfil));
  expect(screen.getByLabelText('Horas de estudo por semana').props.value).toBe('12');
});

it('preserva uma seleção não salva quando a pessoa volta ao perfil', async () => {
  render(tela());
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  fireEvent.press(screen.getByLabelText('Você estuda?'));
  fireEvent.press(screen.getByLabelText('Não'));
  act(() => {
    mockDesfocar();
    mockFocar();
  });
  await waitFor(() => expect(mockRequisitar).toHaveBeenCalledTimes(4));
  expect(screen.queryByLabelText('Horas de estudo por semana')).toBeNull();
});

it('uma falha na atualização preserva os dados já apresentados', async () => {
  render(tela());
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  mockRequisitar.mockRejectedValueOnce(new Error('Sem conexão'));
  act(() => {
    mockDesfocar();
    mockFocar();
  });
  await screen.findByText(/Não foi possível carregar seu perfil/);
  expect(screen.getByLabelText('Nome: Ana Silva')).toBeTruthy();
  expect(screen.getByLabelText('Foto de perfil de Ana Silva')).toBeTruthy();
  expect(screen.getByLabelText('Horas de estudo por semana').props.value).toBe('20');
});

it('trocar de usuário oculta imediatamente o perfil e a foto anteriores', async () => {
  const resultado = render(tela());
  await screen.findByLabelText('Foto de perfil de Ana Silva');
  const consulta = pendente();
  mockRequisitar.mockReturnValueOnce(consulta.promessa);
  mockUsuario = 'pessoa-b';
  resultado.rerender(tela());
  expect(screen.queryByLabelText('Nome: Ana Silva')).toBeNull();
  expect(screen.queryByLabelText('Foto de perfil de Ana Silva')).toBeNull();
  await act(async () =>
    consulta.resolver({ ...perfil, id: 'pessoa-b', nome: 'Beatriz Souza', temFoto: false }),
  );
  expect(screen.getByLabelText('Nome: Beatriz Souza')).toBeTruthy();
});
