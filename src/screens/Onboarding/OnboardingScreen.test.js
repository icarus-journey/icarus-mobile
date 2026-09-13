import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { CampaignsProvider } from '../../state/CampaignsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { OnboardingProvider } from '../../state/OnboardingContext';

function renderApp() {
  return render(
    <OnboardingProvider>
      <MissionsProvider initialMissions={[]}>
        <EpicsProvider initialEpics={[]}>
          <CampaignsProvider initialCampaigns={[]}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CampaignsProvider>
        </EpicsProvider>
      </MissionsProvider>
    </OnboardingProvider>,
  );
}

function pressFirstOption() {
  const [firstOption] = screen.getAllByRole('radio');
  fireEvent.press(firstOption);
}

describe('OnboardingScreen', () => {
  it('abre no passo 1 de 13 com o botão de continuar desabilitado até escolher uma opção', () => {
    renderApp();

    expect(screen.getByText('PASSO 1 DE 13')).toBeTruthy();
    expect(screen.getByText('Qual a sua faixa etária?')).toBeTruthy();

    const continueButton = screen.getByLabelText('Continuar');
    expect(continueButton.props.accessibilityState.disabled).toBe(true);

    pressFirstOption();
    expect(continueButton.props.accessibilityState.disabled).toBe(false);
  });

  it('percorre as 13 perguntas, ramifica pela área escolhida e chega à lista de missões', () => {
    renderApp();

    // perguntas 1 a 9: resposta única, escolhe sempre a primeira opção
    for (let step = 1; step <= 9; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }

    // pergunta 10: escolhe "Finanças" para testar a ramificação da pergunta 13
    expect(screen.getByText('Quais áreas você quer priorizar hoje?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Finanças'));
    fireEvent.press(screen.getByLabelText('Continuar'));

    // perguntas 11 e 12: resposta única
    for (let step = 11; step <= 12; step += 1) {
      pressFirstOption();
      fireEvent.press(screen.getByLabelText('Continuar'));
    }

    // pergunta 13: múltipla escolha, personalizada para Finanças
    expect(screen.getByText('PASSO 13 DE 13')).toBeTruthy();
    expect(
      screen.getByText('Falando mais sobre Finanças. Qual objetivo você deseja conquistar?'),
    ).toBeTruthy();

    const finalButton = screen.getByLabelText('Preparar minha jornada');
    expect(finalButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByLabelText('Começar a investir'));
    fireEvent.press(screen.getByLabelText('Quitar minhas dívidas'));
    expect(finalButton.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(finalButton);

    expect(screen.getByText('Épicos')).toBeTruthy();
    expect(screen.getByText('Objetivos que movem sua jornada.')).toBeTruthy();

    // o épico, as 2 campanhas e as 5 missões geradas a partir da área
    // escolhida (Finanças) substituem o estado vazio inicial
    expect(screen.getByText('Organizar minha vida financeira')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Campanha'));
    expect(screen.getByText('Primeiros passos na organização financeira')).toBeTruthy();
    expect(screen.getByText('Construir patrimônio')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Missão'));
    expect(screen.getByText('Revisar os gastos da semana')).toBeTruthy();
    expect(screen.getByText('Guardar um valor fixo do dia')).toBeTruthy();
    expect(screen.getByText('Definir uma meta financeira do mês')).toBeTruthy();
    expect(screen.getByText('Estudar 15 minutos sobre investimentos')).toBeTruthy();
    expect(screen.getByText('Dedicar 30 minutos a um projeto extra')).toBeTruthy();
  });
});
