import { render, screen } from '@testing-library/react-native';

import { MissionsProvider } from '../../state/MissionsContext';
import { MissionDetailScreen } from './MissionDetailScreen';

const navigation = { goBack: jest.fn(), popToTop: jest.fn() };

function renderScreen(missionId, initialMissions) {
  return render(
    <MissionsProvider initialMissions={initialMissions}>
      <MissionDetailScreen navigation={navigation} route={{ params: { missionId } }} />
    </MissionsProvider>,
  );
}

describe('MissionDetailScreen', () => {
  it('mostra os dados essenciais de uma missão com campanha e progresso', () => {
    renderScreen('missao-1');

    expect(screen.getByText('Fazer exercício de dados')).toBeTruthy();
    expect(screen.getByText('Ontem, 18:00')).toBeTruthy();
    expect(screen.getByText('Média')).toBeTruthy();
    expect(screen.getByText('Diária')).toBeTruthy();
    expect(screen.getByText('Capacitação em Python')).toBeTruthy();
    expect(screen.getByText('3 de 5 registros concluídos')).toBeTruthy();
  });

  it('não quebra quando campos opcionais estão ausentes', () => {
    renderScreen('missao-novo', [
      {
        id: 'missao-novo',
        titulo: 'Ler dez páginas',
        descricao: null,
        status: 'PENDENTE',
        prazoLabel: '10/10/2026',
        prazoCompleto: '10/10/2026',
        dificuldade: 'FACIL',
        pontos: 15,
        recorrencia: null,
        campanha: null,
        corDestaque: '#7048d6',
        progresso: null,
        recompensaLabel: '15 pontos',
      },
    ]);

    expect(screen.getByText('Ler dez páginas')).toBeTruthy();
    expect(screen.getByText('Missão sem área')).toBeTruthy();
    expect(screen.queryByText('Recorrência')).toBeNull();
    expect(screen.queryByText('Campanha')).toBeNull();
  });

  it('mostra mensagem segura quando a missão não é encontrada', () => {
    renderScreen('missao-inexistente', []);

    expect(screen.getByText('Esta missão não está mais disponível.')).toBeTruthy();
  });
});
