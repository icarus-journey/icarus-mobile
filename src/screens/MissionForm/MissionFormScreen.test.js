import { fireEvent, render, screen } from '@testing-library/react-native';

import { CampaignsProvider } from '../../state/CampaignsContext';
import { MissionsProvider } from '../../state/MissionsContext';
import { MissionFormScreen } from './MissionFormScreen';

jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'usuario-teste' }, requisitarAutenticado: jest.fn() }),
}));

const navigation = { goBack: jest.fn() };

function renderScreen(routeParams, initialMissions = [], initialCampaigns = []) {
  return render(
    <CampaignsProvider initialCampaigns={initialCampaigns}>
      <MissionsProvider initialMissions={initialMissions}>
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

  it('não oferece campanha já concluída no seletor (RF-03.4)', () => {
    renderScreen({}, [], [
      { id: 1, titulo: 'Campanha ativa', estado: 'emAndamento' },
      { id: 2, titulo: 'Campanha concluída', estado: 'concluida' },
    ]);

    fireEvent.press(screen.getAllByLabelText('Sim')[1]); // "Atribuir a uma campanha" (índice 0 é "Recorrente")
    fireEvent.press(screen.getByLabelText('Campanha'));

    expect(screen.getByLabelText('Campanha ativa')).toBeTruthy();
    expect(screen.queryByLabelText('Campanha concluída')).toBeNull();
  });
});

describe('MissionFormScreen — recorrência (RF-04)', () => {
  it('mostra o seletor de dias da semana só quando recorrente=Sim e tipo=Semanal', () => {
    renderScreen({});

    expect(screen.queryByText('Dias da semana*')).toBeNull();

    fireEvent.press(screen.getAllByLabelText('Sim')[0]); // "Recorrente"
    expect(screen.queryByText('Dias da semana*')).toBeNull(); // tipo padrão é Diária

    fireEvent.press(screen.getByLabelText('Semanal'));
    expect(screen.getByText('Dias da semana*')).toBeTruthy();
    expect(screen.getByLabelText('Seg')).toBeTruthy();
  });

  it('mostra o campo opcional "Repetir até" assim que recorrente=Sim, independente do tipo', () => {
    renderScreen({});

    expect(screen.queryByText('Repetir até')).toBeNull();

    fireEvent.press(screen.getAllByLabelText('Sim')[0]); // "Recorrente"

    expect(screen.getByText('Repetir até')).toBeTruthy();
    expect(screen.getByText('Deixe em branco para repetir indefinidamente')).toBeTruthy();
  });

  it('esconde a seção de recorrência ao editar uma missão existente (não é editável)', () => {
    renderScreen(
      { missionId: 'missao-1' },
      [{ id: 'missao-1', titulo: 'Beber água', dificuldade: 'TRIVIAL', pontos: 15, campanha: null }],
    );

    expect(screen.getByText('Editar missão')).toBeTruthy();
    expect(screen.queryByText('Recorrente')).toBeNull();
  });
});
