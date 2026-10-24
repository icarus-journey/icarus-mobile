import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { ContaScreen } from './ContaScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => mockUseSessao(),
}));

const mockSair = jest.fn();
const mockRequisitarAutenticado = jest.fn();
function mockUseSessao() {
  return {
    sessao: { usuarioId: 'usuario-teste', accessToken: 'token-teste' },
    sair: mockSair,
    requisitarAutenticado: mockRequisitarAutenticado,
  };
}

const mockObterPerfil = jest.fn();
const mockAtualizarFotoPerfil = jest.fn();
jest.mock('../../services/perfil', () => ({
  obterPerfil: (...args) => mockObterPerfil(...args),
  atualizarFotoPerfil: (...args) => mockAtualizarFotoPerfil(...args),
  urlFotoPerfil: (usuarioId) => `http://api.teste/foto/${usuarioId}`,
}));

const navigation = { navigate: jest.fn() };

beforeEach(() => {
  mockSair.mockReset();
  mockRequisitarAutenticado.mockReset();
  mockObterPerfil.mockReset().mockResolvedValue({ nome: 'Ana Teste', temFoto: false });
  mockAtualizarFotoPerfil.mockReset().mockResolvedValue(undefined);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  Alert.alert.mockRestore?.();
});

describe('ContaScreen', () => {
  it('busca o perfil real e mostra o nome do usuário', async () => {
    render(<ContaScreen navigation={navigation} />);

    expect(await screen.findByText('Ana Teste')).toBeTruthy();
    expect(mockObterPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 'usuario-teste' }),
    );
  });

  it('mostra a inicial do nome no avatar quando o usuário não tem foto', async () => {
    render(<ContaScreen navigation={navigation} />);

    expect(await screen.findByText('A')).toBeTruthy();
  });

  it('ao tocar no ícone de câmera, oferece tirar foto ou escolher da galeria', async () => {
    render(<ContaScreen navigation={navigation} />);
    await screen.findByText('Ana Teste');

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

  it('envia a foto escolhida da galeria e atualiza o avatar', async () => {
    jest.spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync').mockResolvedValue({ granted: true });
    jest.spyOn(ImagePicker, 'launchImageLibraryAsync').mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://foto-local.jpg' }],
    });

    render(<ContaScreen navigation={navigation} />);
    await screen.findByText('Ana Teste');

    fireEvent.press(screen.getByLabelText('Trocar foto de perfil'));
    const [, , botoes] = Alert.alert.mock.calls[0];
    await act(async () => {
      await botoes.find((b) => b.text === 'Escolher da galeria').onPress();
    });

    expect(mockAtualizarFotoPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 'usuario-teste', uri: 'file://foto-local.jpg' }),
    );
    await waitFor(() => expect(screen.queryByText('A')).toBeNull()); // deixou de mostrar a inicial
  });

  it('não envia nada quando a permissão da galeria é negada', async () => {
    jest.spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync').mockResolvedValue({ granted: false });

    render(<ContaScreen navigation={navigation} />);
    await screen.findByText('Ana Teste');

    fireEvent.press(screen.getByLabelText('Trocar foto de perfil'));
    const [, , botoes] = Alert.alert.mock.calls[0];
    await act(async () => {
      await botoes.find((b) => b.text === 'Escolher da galeria').onPress();
    });

    expect(mockAtualizarFotoPerfil).not.toHaveBeenCalled();
    expect(await screen.findByText('Permita o acesso à galeria para escolher uma foto.')).toBeTruthy();
  });

  it('sai da conta ao tocar em "Sair da conta"', async () => {
    render(<ContaScreen navigation={navigation} />);
    await screen.findByText('Ana Teste');

    await act(async () => {
      fireEvent.press(screen.getByLabelText('Sair da conta'));
    });

    expect(mockSair).toHaveBeenCalledTimes(1);
  });
});
