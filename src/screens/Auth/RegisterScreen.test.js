import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RegisterScreen } from './RegisterScreen';

const mockRegistrar = jest.fn();

jest.mock('../../state/AuthContext', () => ({
  useAuth: () => ({ registrar: mockRegistrar }),
}));

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
    navigation.navigate.mockClear();
    navigation.goBack.mockClear();
    navigation.replace.mockClear();
    mockRegistrar.mockReset();
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

  it('navega para o onboarding ao criar conta válida', async () => {
    mockRegistrar.mockResolvedValue('usuario-123');
    render(<RegisterScreen navigation={navigation} />);

    preencherFormularioValido();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Criar conta'));
    });

    expect(mockRegistrar).toHaveBeenCalledWith({
      nome: 'Paloma',
      email: 'paloma@email.com',
      senha: 'Senha123!',
      dataNascimento: '01/01/2000',
    });
    expect(navigation.replace).toHaveBeenCalledWith('Onboarding');
  });

  it('mostra erro quando o e-mail já está cadastrado, sem navegar', async () => {
    mockRegistrar.mockRejectedValue({ status: 409 });
    render(<RegisterScreen navigation={navigation} />);

    preencherFormularioValido();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Criar conta'));
    });

    await waitFor(() => expect(screen.getByText('Já existe uma conta com este e-mail.')).toBeTruthy());
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('navega de volta para login', () => {
    render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Entrar'));

    expect(navigation.goBack).toHaveBeenCalled();
  });
});
