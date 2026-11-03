import { fireEvent, render, screen } from '@testing-library/react-native';

import { evolucaoDaMetaDeTeste } from '../../testUtils/dadosAnaliticos';
import { EvolucaoDaMeta } from './EvolucaoDaMeta';

it('mostra avanço, faltante e condição em poucas linhas; explicações ficam sob demanda', () => {
  render(<EvolucaoDaMeta dados={evolucaoDaMetaDeTeste()} />);
  expect(screen.getByText('+8')).toBeTruthy();
  expect(screen.getByText('Faltam')).toBeTruthy();
  expect(screen.getByText('Cerca de 4 semanas para chegar lá')).toBeTruthy();
  expect(screen.getByText('Se mantiver esse ritmo…')).toBeTruthy();
  expect(screen.getByText('2 módulos por semana')).toBeTruthy();
  expect(screen.getByLabelText('2026-10-24: 8 módulos')).toBeTruthy();
  expect(screen.queryByText(/não é uma data garantida/)).toBeNull();
  fireEvent.press(screen.getByLabelText('Entender meu ritmo'));
  expect(screen.getByText(/não é uma data garantida/)).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Entendi meu ritmo'));
  expect(screen.queryByText(/não é uma data garantida/)).toBeNull();
});

it('não inventa previsão com histórico insuficiente e explica o que registrar', () => {
  const dados = evolucaoDaMetaDeTeste();
  dados.cenario = { disponivel: false, motivo: 'historico_insuficiente' };
  dados.evolucao.avancoRegistrado = null;
  dados.evolucao.pontos = dados.evolucao.pontos.slice(0, 1);
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.queryByText(/para chegar lá/)).toBeNull();
  expect(screen.queryByText('Avanço registrado')).toBeNull();
  fireEvent.press(screen.getByLabelText('Entender meu ritmo'));
  expect(screen.getByText(/cinco registros, separados por sete dias/)).toBeTruthy();
});

it.each(['ponto', 'pontos', 'XP'])('não apresenta %s como avanço mensurado', (unidade) => {
  const dados = evolucaoDaMetaDeTeste({
    unidade,
    evolucao: { estado: 'unidade_sem_resultado_mensurado', pontos: [] },
    cenario: { disponivel: false },
  });
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.queryByText('Faltam')).toBeNull();
  expect(screen.queryByLabelText('Entender meu ritmo')).toBeNull();
});

it('preserva redução, zero e o encerramento sem sugerir uma data', () => {
  const dados = evolucaoDaMetaDeTeste({
    estado: 'concluida',
    cenario: { disponivel: false, motivo: 'campanha_encerrada' },
  });
  dados.evolucao.avancoRegistrado = -2;
  dados.evolucao.faltante = 0;
  dados.evolucao.pontos[4] = { data: '2026-10-24', valor: 0, revisado: true };
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.getByText('-2')).toBeTruthy();
  expect(screen.getByLabelText('2026-10-24: 0 módulos, valor revisado')).toBeTruthy();
  expect(screen.getByText('Meta alcançada')).toBeTruthy();
  expect(screen.queryByText(/para chegar lá/)).toBeNull();
});
