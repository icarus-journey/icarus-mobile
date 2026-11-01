import { fireEvent, render, screen } from '@testing-library/react-native';

import { ComparacaoDaSemana } from './ComparacaoDaSemana';

export function comparacaoDeTeste() {
  return {
    semana: { estado: 'disponivel', previstas: 10, concluidas: 8, taxaConclusao: 80 },
    semanasAnteriores: [{ estado: 'disponivel', previstas: 8, concluidas: 4, taxaConclusao: 50 }],
    mediaQuatroSemanas: { previstas: 8.5, concluidas: 5, taxaConclusao: 56.2 },
    podeCompararSemanaAnterior: true,
    podeCompararMediaQuatroSemanas: true,
  };
}

it('mostra o conjunto atual e deixa as comparações sob demanda', () => {
  render(<ComparacaoDaSemana comparacao={comparacaoDeTeste()} />);
  expect(screen.getByText('80%')).toBeTruthy();
  expect(screen.getByText('8 de 10 feitas')).toBeTruthy();
  expect(screen.queryByText('Média das 4 anteriores')).toBeNull();
  fireEvent.press(screen.getByLabelText('Comparar semanas'));
  expect(screen.getByLabelText('Semana anterior. 4 de 8 feitas, 50%.')).toBeTruthy();
  expect(screen.getByLabelText('Média das 4 anteriores. 5 de 8,5 feitas, 56,2%.')).toBeTruthy();
  expect(screen.queryByText(/melhor|pior/i)).toBeNull();
  fireEvent.press(screen.getByLabelText('Comparar semanas'));
  expect(screen.queryByText('Média das 4 anteriores')).toBeNull();
});

it('não inventa média ou taxa para registros incompletos', () => {
  const comparacao = comparacaoDeTeste();
  comparacao.podeCompararMediaQuatroSemanas = false;
  comparacao.mediaQuatroSemanas = { previstas: null, concluidas: null, taxaConclusao: null };
  render(<ComparacaoDaSemana comparacao={comparacao} />);
  fireEvent.press(screen.getByLabelText('Comparar semanas'));
  expect(screen.getByLabelText('Média das 4 anteriores. Registros incompletos.')).toBeTruthy();
  expect(screen.getByText('Ainda falta histórico para a média das quatro semanas.')).toBeTruthy();
  expect(screen.queryByText('0%')).toBeNull();
});

it.each(['sem_planejamento', 'historico_parcial'])(
  'mantém a ausência explícita para %s',
  (estado) => {
    const comparacao = comparacaoDeTeste();
    comparacao.semana = { estado, previstas: null, concluidas: null, taxaConclusao: null };
    comparacao.podeCompararSemanaAnterior = false;
    comparacao.podeCompararMediaQuatroSemanas = false;
    render(<ComparacaoDaSemana comparacao={comparacao} />);
    expect(screen.getByText('Ainda falta histórico para comparar as semanas.')).toBeTruthy();
    expect(screen.queryByText('0%')).toBeNull();
    expect(screen.queryByLabelText('Comparar semanas')).toBeNull();
  },
);

it('não altera relatórios antigos sem a comparação persistida', () => {
  render(<ComparacaoDaSemana />);
  expect(screen.queryByText('Seu planejamento')).toBeNull();
});
