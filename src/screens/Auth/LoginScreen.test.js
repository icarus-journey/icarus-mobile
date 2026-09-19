import { fireEvent, render, screen } from '@testing-library/react-native';

import { LoginScreen } from './LoginScreen';

const navigation = { navigate: jest.fn(), replace: jest.fn() };

describe('LoginScreen', () => {
  beforeEach(() => {
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

  it('navega para missões ao entrar com dados preenchidos', () => {
    render(<LoginScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));

    expect(navigation.replace).toHaveBeenCalledWith('MissionList');
  });

  it('navega para cadastro pelo link de criar conta', () => {
    render(<LoginScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Criar conta'));

    expect(navigation.navigate).toHaveBeenCalledWith('Register');
  });
});
