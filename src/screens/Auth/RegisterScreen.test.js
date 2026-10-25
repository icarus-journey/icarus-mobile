import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RegisterScreen } from './RegisterScreen';
import { useSessao } from '../../state/SessaoContext';

jest.mock('../../state/SessaoContext', () => ({ useSessao: jest.fn() }));
const cadastrar = jest.fn();
const entrar = jest.fn();

function preencherCadastro() {
  fireEvent.changeText(screen.getByLabelText('Como podemos chamar você?'), 'Paloma');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
  fireEvent.changeText(screen.getByLabelText('Data de nascimento'), '01012000');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Senha123!');
  fireEvent.press(screen.getByLabelText('Li e aceito os Termos e a Política de Privacidade'));
  fireEvent.press(screen.getByLabelText('Criar conta'));
}

const navigation = { goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn() };

function preencherFormularioValido() {
  fireEvent.changeText(screen.getByLabelText('Como podemos chamar você?'), 'Paloma');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
  fireEvent.changeText(screen.getByLabelText('Data de nascimento'), '01012000');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
  fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Senha123!');
  fireEvent.press(screen.getByLabelText('Li e aceito os Termos e a Política de Privacidade'));
}

describe('RegisterScreen', () => {
  beforeEach(() => {
    cadastrar.mockReset().mockResolvedValue({ usuarioId: 'usuario' });
    entrar.mockReset().mockResolvedValue(undefined);
    useSessao.mockReturnValue({ cadastrar, entrar });
    navigation.navigate.mockClear();
    navigation.goBack.mockClear();
    navigation.replace.mockClear();
  });

  it('mostra formulário e validação visual de senha', () => {
    render(<RegisterScreen navigation={navigation} />);

    expect(screen.getByText('Crie seu espaço de evolução')).toBeTruthy();
    expect(screen.getByPlaceholderText('Digite um nome')).toBeTruthy();
    expect(screen.getByPlaceholderText('Digite um email')).toBeTruthy();
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Senha123!');

    expect(screen.getByLabelText('8 ou mais caracteres: ok')).toBeTruthy();
    expect(screen.getByLabelText('No máximo 128 caracteres: ok')).toBeTruthy();
    expect(screen.getByText('As senhas coincidem')).toBeTruthy();
  });

  it('só autentica para iniciar o onboarding depois de criar a conta na API', async () => {
    render(<RegisterScreen navigation={navigation} />);

    preencherFormularioValido();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Criar conta'));
    });

    await waitFor(() => expect(entrar).toHaveBeenCalledWith('paloma@email.com', 'Senha123!', true));
    expect(cadastrar).toHaveBeenCalledTimes(1);
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('não tenta login quando o cadastro falha', async () => {
    cadastrar.mockRejectedValue(new Error('Já existe uma conta associada a este e-mail.'));
    render(<RegisterScreen navigation={navigation} />);
    preencherCadastro();
    expect(await screen.findByText('Já existe uma conta associada a este e-mail.')).toBeTruthy();
    expect(entrar).not.toHaveBeenCalled();
  });

  it('leva ao login se a conta foi criada e a autenticação posterior falhou', async () => {
    entrar.mockRejectedValue(new Error('Sem conexão'));
    render(<RegisterScreen navigation={navigation} />);
    preencherCadastro();
    await waitFor(() =>
      expect(navigation.replace).toHaveBeenCalledWith('Login', {
        email: 'paloma@email.com',
        cadastroConcluido: true,
      }),
    );
    expect(cadastrar).toHaveBeenCalledTimes(1);
  });

  it('navega de volta para login', () => {
    render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Entrar'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
