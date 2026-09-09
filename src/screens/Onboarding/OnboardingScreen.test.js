import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { EpicsProvider } from '../../state/EpicsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { OnboardingProvider } from '../../state/OnboardingContext';

function renderApp() {
  return render(
    <OnboardingProvider>
      <MissionsProvider>
        <EpicsProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
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
  });
});
