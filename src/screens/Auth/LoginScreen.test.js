import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LoginScreen } from './LoginScreen';

const mockEntrar = jest.fn();

jest.mock('../../state/AuthContext', () => ({
  useAuth: () => ({ entrar: mockEntrar }),
}));

const navigation = { navigate: jest.fn(), replace: jest.fn() };

describe('LoginScreen', () => {
  beforeEach(() => {
    navigation.navigate.mockClear();
    navigation.replace.mockClear();
    mockEntrar.mockReset();
  });

  it('mostra os campos e ações principais', () => {
    render(<LoginScreen navigation={navigation} />);

    expect(screen.getByLabelText('Icarus')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByPlaceholderText('Digite um email')).toBeTruthy();
    expect(screen.getByLabelText('Senha')).toBeTruthy();
    expect(screen.getByLabelText('Continuar com Google')).toBeTruthy();
  });

  it('navega para missões ao entrar com dados preenchidos', async () => {
    mockEntrar.mockResolvedValue('usuario-123');
    render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
    });

    expect(mockEntrar).toHaveBeenCalledWith('paloma@email.com', 'Senha123!');
    expect(navigation.replace).toHaveBeenCalledWith('MissionList');
  });

  it('mostra erro de credenciais inválidas sem navegar', async () => {
    mockEntrar.mockRejectedValue({ status: 401 });
    render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'senhaErrada');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
    });

    await waitFor(() => expect(screen.getByText('E-mail ou senha inválidos.')).toBeTruthy());
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('navega para cadastro pelo link de criar conta', () => {
    render(<LoginScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Criar conta'));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
