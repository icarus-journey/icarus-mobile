import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { MissionsProvider } from '../state/MissionsContext';
import { RootNavigator } from './RootNavigator';

function renderApp() {
  return render(
    <MissionsProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </MissionsProvider>,
  );
}

function enterApp() {
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'paloma@email.com');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha123!');
  fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
}

describe('fluxo de autenticação e missões', () => {
  it('abre o app no login e entra na lista de missões', () => {
    renderApp();

    expect(screen.getByLabelText('Icarus')).toBeTruthy();

    enterApp();

    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('abre o formulário a partir da lista e volta para a lista ao tocar em uma missão', () => {
    renderApp();
    enterApp();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    expect(screen.getByText('Nova missão')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('cria uma missão válida e volta para a lista com o novo item', () => {
    renderApp();
    enterApp();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Ler dez páginas');
    fireEvent.changeText(screen.getByLabelText('Data limite'), '25122026');
    fireEvent.press(screen.getByLabelText('Média'));
    fireEvent.press(screen.getByLabelText('Salvar missão'));

    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
    expect(screen.getByText('Ler dez páginas')).toBeTruthy();
  });

  it('abre o detalhe ao tocar em uma missão e volta para a lista', () => {
    renderApp();
    enterApp();

    fireEvent.press(screen.getAllByLabelText(/Fazer exercício de dados/)[0]);

    expect(screen.getByText('Detalhe da missão')).toBeTruthy();
    expect(screen.getByText('3 de 5 registros concluídos')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('edita uma missão existente a partir do detalhe e reflete a mudança ao voltar', () => {
    renderApp();
    enterApp();

    fireEvent.press(screen.getAllByLabelText(/Fazer exercício de dados/)[0]);
    fireEvent.press(screen.getByLabelText('Editar missão'));

    expect(screen.getByText('Editar missão')).toBeTruthy();
    expect(screen.getByDisplayValue('Fazer exercício de dados')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Fazer exercício de dados avançado');
    fireEvent.press(screen.getByLabelText('Salvar alterações'));

    expect(screen.getByText('Fazer exercício de dados avançado')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
    expect(screen.getByText('Fazer exercício de dados avançado')).toBeTruthy();
  });

  it('não salva e mostra erros quando campos obrigatórios estão vazios', () => {
    renderApp();
    enterApp();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    fireEvent.press(screen.getByLabelText('Salvar missão'));

    expect(screen.getByText('Nova missão')).toBeTruthy();
    expect(screen.getByText('Informe um título para a missão.')).toBeTruthy();
  });
});
