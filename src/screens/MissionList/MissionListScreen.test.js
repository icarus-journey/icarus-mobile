import { fireEvent, render, screen } from '@testing-library/react-native';

import { MissionsProvider } from '../../state/MissionsContext';
import { MOCK_MISSIONS } from '../../state/mockData';
import { MissionListScreen } from './MissionListScreen';

const navigation = { navigate: jest.fn(), popToTop: jest.fn() };

function renderScreen(initialMissions) {
  return render(
    <MissionsProvider initialMissions={initialMissions}>
      <MissionListScreen navigation={navigation} />
    </MissionsProvider>,
  );
}

describe('MissionListScreen', () => {
  it('lista as missões atrasadas antes das pendentes', () => {
    renderScreen(MOCK_MISSIONS);

    const titles = screen.getAllByText('Fazer exercício de dados');
    expect(titles).toHaveLength(2);
    expect(screen.getByText('Atrasada')).toBeTruthy();
    expect(screen.getByText('Hoje')).toBeTruthy();
  });

  it('mostra o estado vazio quando não há missões', () => {
    renderScreen([]);

    expect(screen.getByText('Nenhuma missão por aqui')).toBeTruthy();
  });

  it('navega para o formulário ao tocar em adicionar missão', () => {
    renderScreen(MOCK_MISSIONS);

    fireEvent.press(screen.getByLabelText('Adicionar missão'));

    expect(navigation.navigate).toHaveBeenCalledWith('MissionForm');
  });
});
