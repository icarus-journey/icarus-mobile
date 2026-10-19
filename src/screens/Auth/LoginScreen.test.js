import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { LoginScreen } from './LoginScreen';
import { useSessao } from '../../state/SessaoContext';

jest.mock('../../state/SessaoContext', () => ({ useSessao: jest.fn() }));
const entrar = jest.fn();

const navigation = { navigate: jest.fn(), replace: jest.fn() };

describe('LoginScreen', () => {
  beforeEach(() => {
    entrar.mockReset().mockResolvedValue(undefined);
    useSessao.mockReturnValue({ entrar });
    navigation.navigate.mockClear();
    navigation.replace.mockClear();
  });

  it('mostra os campos e ações principais', () => {
    render(<LoginScreen navigation={navigation} />);

    expect(screen.getByLabelText('Icarus')).toBeTruthy();
    expect(screen.getByLabelText('E-mail')).toBeTruthy();
    expect(screen.getByPlaceholderText('Digite um email')).toBeTruthy();
    expect(screen.getByLabelText('Senha')).toBeTruthy();
    expect(screen.getByLabelText('Continuar com Google')).toBeTruthy();
  });

  it('envia as credenciais e aguarda a sessão, sem navegar por conta própria', async () => {
    render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
    });

    await waitFor(() =>
      expect(entrar).toHaveBeenCalledWith('paloma@email.com', 'Senha123!', false),
    );
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('mostra credenciais inválidas e mantém o formulário disponível', async () => {
    entrar.mockRejectedValue(Object.assign(new Error('Falha'), { status: 401 }));
    render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'errada');
    fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it('bloqueia envio duplicado enquanto aguarda a API', async () => {
    let resolver;
    entrar.mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve;
      }),
    );
    render(<LoginScreen navigation={navigation} />);
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
    fireEvent.press(screen.getByLabelText('Entrando…'));
    expect(entrar).toHaveBeenCalledTimes(1);
    resolver();
    await screen.findByLabelText('Entrar na minha jornada');
  });

  it('navega para cadastro pelo link de criar conta', () => {
    render(<LoginScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Criar conta'));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
