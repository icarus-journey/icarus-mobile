import { render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { MissionFormScreen } from './MissionFormScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { goBack: jest.fn() };

function renderScreen(routeParams) {
  return render(
    <CampaignsProvider initialCampaigns={[]}>
      <MissionsProvider initialMissions={[]}>
        <MissionFormScreen navigation={navigation} route={{ params: routeParams }} />
      </MissionsProvider>
    </CampaignsProvider>,
  );
}

describe('MissionFormScreen — campanha pré-selecionada', () => {
  it('pré-seleciona a campanha vinda de route.params.campanha ao criar uma missão nova', () => {
    renderScreen({ campanha: { id: 1, titulo: 'Campanha X' } });

    expect(screen.getByText('Nova missão')).toBeTruthy();
    expect(screen.getByText('Campanha X')).toBeTruthy();
  });

  it('não pré-seleciona campanha quando não vem nenhuma em route.params', () => {
    renderScreen({});

    expect(screen.queryByLabelText('Campanha')).toBeNull();
  });
});
