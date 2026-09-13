import { fireEvent, render, screen } from '@testing-library/react-native';

import { RegisterScreen } from './RegisterScreen';

const navigation = { navigate: jest.fn(), replace: jest.fn() };

describe('RegisterScreen', () => {
  beforeEach(() => {
    navigation.navigate.mockClear();
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
    expect(screen.getByLabelText('1 letra maiúscula e 1 número: ok')).toBeTruthy();
    expect(screen.getByText('As senhas coincidem')).toBeTruthy();
  });

  it('navega para missões ao criar conta válida', () => {
    render(<RegisterScreen navigation={navigation} />);

    fireEvent.changeText(screen.getByLabelText('Como quer ser chamada?'), 'Paloma');
    fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
    fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
    fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'Senha123!');
    fireEvent.press(screen.getByLabelText('Li e aceito os Termos e a Política de Privacidade'));
    fireEvent.press(screen.getByLabelText('Criar conta'));

    expect(navigation.replace).toHaveBeenCalledWith('MissionList');
  });

  it('navega de volta para login', () => {
    render(<RegisterScreen navigation={navigation} />);

    fireEvent.press(screen.getByLabelText('Entrar'));

    expect(navigation.navigate).toHaveBeenCalledWith('Login');
  });
});
