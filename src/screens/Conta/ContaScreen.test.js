import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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
let conteudoFoto;
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
  conteudoFoto = new Uint8Array([65, 66, 67]);
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
    if (opcoes?.formatoResposta === 'binario')
      return { conteudo: conteudoFoto, tipo: 'image/jpeg' };
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

describe('foto de perfil', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function escolherOpcao(texto) {
    fireEvent.press(screen.getByLabelText('Trocar foto de perfil'));
    const [, , botoes] = Alert.alert.mock.calls[0];
    await act(async () => {
      await botoes.find((b) => b.text === texto).onPress();
    });
  }

  it('mostra as iniciais quando o usuário não tem foto', async () => {
    await abrir();
    expect(screen.getByText('AS')).toBeTruthy();
  });

  it('oferece tirar foto ou escolher da galeria ao tocar na câmera', async () => {
    await abrir();
    fireEvent.press(screen.getByLabelText('Trocar foto de perfil'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Foto de perfil',
      'Escolha uma opção',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Tirar foto' }),
        expect.objectContaining({ text: 'Escolher da galeria' }),
        expect.objectContaining({ text: 'Cancelar' }),
      ]),
    );
  });

  it('envia a foto escolhida da galeria e troca as iniciais pela imagem', async () => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: true });
    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://foto-local.jpg' }],
    });
    await abrir();
    await escolherOpcao('Escolher da galeria');
    expect(mockRequisitar).toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/foto',
      expect.objectContaining({ metodo: 'PUT', corpoFormData: expect.any(FormData) }),
    );
    await waitFor(() => expect(screen.queryByText('AS')).toBeNull());
  });

  it('não envia nada quando a permissão da galeria é negada', async () => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: false });
    await abrir();
    await escolherOpcao('Escolher da galeria');
    expect(mockRequisitar).not.toHaveBeenCalledWith(
      '/api/usuarios/pessoa-a/foto',
      expect.anything(),
    );
    expect(
      await screen.findByText('Permita o acesso à galeria para escolher uma foto.'),
    ).toBeTruthy();
  });

  it('recarrega a imagem remota quando uma foto existente é substituída', async () => {
    perfil.temFoto = true;
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: true });
    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://foto-nova.jpg' }],
    });
    await abrir();
    const fonteAnterior = screen.getByLabelText('Foto de perfil de Ana Silva').props.source.uri;
    conteudoFoto = new Uint8Array([68, 69, 70]);
    await escolherOpcao('Escolher da galeria');
    const fonteAtual = screen.getByLabelText('Foto de perfil de Ana Silva').props.source.uri;
    expect(fonteAtual).not.toEqual(fonteAnterior);
    expect(fonteAnterior).toEqual('data:image/jpeg;base64,QUJD');
    expect(fonteAtual).toEqual('data:image/jpeg;base64,REVG');
  });

  it('busca e exibe a foto já salva ao abrir o perfil', async () => {
    perfil.temFoto = true;
    await abrir();
    const foto = await screen.findByLabelText('Foto de perfil de Ana Silva');
    expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/foto', {
      formatoResposta: 'binario',
    });
    expect(foto.props.source.uri).toBe('data:image/jpeg;base64,QUJD');
  });

  it('libera a troca de foto na nova conta e ignora o envio anterior', async () => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValue({ granted: true });
    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://foto-anterior.jpg' }],
    });
    const resultado = await abrir();
    let concluirEnvio;
    mockRequisitar.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          concluirEnvio = resolve;
        }),
    );
    fireEvent.press(screen.getByLabelText('Trocar foto de perfil'));
    const [, , botoes] = Alert.alert.mock.calls[0];
    let envio;
    await act(async () => {
      envio = botoes.find((botao) => botao.text === 'Escolher da galeria').onPress();
    });
    expect(screen.getByLabelText('Trocar foto de perfil')).toBeDisabled();

    mockUsuarioId = 'pessoa-b';
    perfil = { ...perfil, id: 'pessoa-b', nome: 'Beatriz Souza' };
    resultado.rerender(tela());
    await screen.findByLabelText('Nome: Beatriz Souza');
    expect(screen.getByLabelText('Trocar foto de perfil')).toBeEnabled();
    await act(async () => {
      concluirEnvio();
      await envio;
    });
    expect(screen.queryByLabelText('Foto de perfil de Ana Silva')).toBeNull();
    expect(mockRequisitar).not.toHaveBeenCalledWith('/api/usuarios/pessoa-a/foto', {
      formatoResposta: 'binario',
    });
    expect(screen.getByLabelText('Nome: Beatriz Souza')).toBeTruthy();
  });
});
