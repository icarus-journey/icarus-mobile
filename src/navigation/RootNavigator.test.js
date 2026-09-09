import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../state/CampaignsContext';
import { EpicsProvider } from '../state/EpicsContext';
import { MissionsProvider } from '../state/MissionsContext';
import { OnboardingProvider } from '../state/OnboardingContext';
import { RootNavigator } from './RootNavigator';

function renderApp() {
  return render(
    <OnboardingProvider>
      <MissionsProvider>
        <EpicsProvider>
          <CampaignsProvider>
            <NavigationContainer>
              <RootNavigator initialRouteName="MissionList" />
            </NavigationContainer>
          </CampaignsProvider>
        </EpicsProvider>
      </MissionsProvider>
    </OnboardingProvider>,
  );
}

describe('fluxo de missões', () => {
  it('abre o formulário a partir da lista e volta para a lista ao tocar em uma missão', () => {
    renderApp();

    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    expect(screen.getByText('Nova missão')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('cria uma missão válida e volta para a lista com o novo item', () => {
    renderApp();

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

    fireEvent.press(screen.getAllByLabelText(/Fazer exercício de dados/)[0]);

    expect(screen.getByText('Detalhe da missão')).toBeTruthy();
    expect(screen.getByText('3 de 5 registros concluídos')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Seus próximos passos.')).toBeTruthy();
  });

  it('edita uma missão existente a partir do detalhe e reflete a mudança ao voltar', () => {
    renderApp();

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

    fireEvent.press(screen.getByLabelText('Adicionar missão'));
    fireEvent.press(screen.getByLabelText('Salvar missão'));

    expect(screen.getByText('Nova missão')).toBeTruthy();
    expect(screen.getByText('Informe um título para a missão.')).toBeTruthy();
  });
});

describe('fluxo de épicos', () => {
  it('abre o detalhe do épico em destaque, edita e reflete a mudança ao voltar', () => {
    renderApp();

    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText(/Ser promovido/));

    expect(screen.getByText('Detalhe do épico')).toBeTruthy();
    expect(screen.getByText('2 de 3 campanhas concluídas')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Editar épico'));
    expect(screen.getByText('Editar épico')).toBeTruthy();
    expect(screen.getByDisplayValue('Ser promovido')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Ser promovido a sênior');
    fireEvent.press(screen.getByLabelText('Salvar alterações'));

    expect(screen.getByText('Ser promovido a sênior')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Épicos')).toBeTruthy();
  });

  it('cria um épico válido e ele aparece na lista', () => {
    renderApp();

    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText('Adicionar épico'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Aprender inglês fluente');
    fireEvent.changeText(screen.getByLabelText('Data limite'), '31122027');
    fireEvent.press(screen.getByLabelText('Fácil'));
    fireEvent.press(screen.getByLabelText('Salvar épico'));

    expect(screen.getByText('Épicos')).toBeTruthy();
    expect(screen.getByText('Aprender inglês fluente')).toBeTruthy();
  });
});

describe('fluxo de campanhas', () => {
  it('abre o detalhe da campanha em destaque, edita e reflete a mudança ao voltar', () => {
    renderApp();

    fireEvent.press(screen.getByLabelText('Campanha'));
    fireEvent.press(screen.getByLabelText(/Capacitação em Python/));

    expect(screen.getByText('Detalhe da campanha')).toBeTruthy();
    expect(screen.getByText('4 de 5 missões concluídas')).toBeTruthy();
    expect(screen.getByText('Ser promovida')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Editar campanha'));
    expect(screen.getByText('Editar campanha')).toBeTruthy();
    expect(screen.getByDisplayValue('Capacitação em Python')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Título'), 'Capacitação em Python avançado');
    fireEvent.press(screen.getByLabelText('Salvar alterações'));

    expect(screen.getByText('Capacitação em Python avançado')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByText('Campanhas')).toBeTruthy();
  });

  it('cria uma campanha válida, vinculada a um épico, e ela aparece na lista', () => {
    renderApp();

    fireEvent.press(screen.getByLabelText('Campanha'));
    fireEvent.press(screen.getByLabelText('Adicionar campanha'));

    fireEvent.changeText(screen.getByLabelText('Título'), 'Correr uma meia maratona');
    fireEvent.changeText(screen.getByLabelText('Data limite'), '15032027');
    fireEvent.press(screen.getByLabelText('Difícil'));

    fireEvent.press(screen.getByLabelText('Sim'));
    fireEvent.press(screen.getByLabelText('Épico'));
    fireEvent.press(screen.getByLabelText('Ser promovido'));

    fireEvent.press(screen.getByLabelText('Salvar campanha'));

    expect(screen.getByText('Campanhas')).toBeTruthy();
    expect(screen.getByText('Correr uma meia maratona')).toBeTruthy();
  });
});
