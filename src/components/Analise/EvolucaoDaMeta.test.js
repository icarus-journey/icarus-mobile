import { render, screen } from '@testing-library/react-native';
import { evolucaoDaMetaDeTeste } from '../../testUtils/dadosAnaliticos';
import { EvolucaoDaMeta } from './EvolucaoDaMeta';
import { CenarioDaMeta } from './CenarioDaMeta';

const prazo = {
  referencia: '2026-11-08',
  conclusaoEstimada: '2026-12-06',
  prazoFim: '2026-12-13',
  diasAtePrazo: 35,
  margemDias: 7,
  ritmoSemanalNecessario: 1.6,
  situacao: 'antes_do_prazo',
};
it('mostra eixos, unidade e datas dos registros e explica o prazo depois do gráfico', () => {
  const dados = evolucaoDaMetaDeTeste();
  dados.cenario.prazo = prazo;
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.getByText('Evolução da meta')).toBeTruthy();
  expect(screen.getByText('Data do registro')).toBeTruthy();
  expect(screen.getByLabelText(/2026-10-24: 8 módulos/)).toBeTruthy();
  expect(screen.getByText('Antes do prazo, se mantiver o ritmo.')).toBeTruthy();
  expect(screen.getByText(/1,6 módulos por semana/)).toBeTruthy();
  expect(screen.queryByLabelText('Entender meu ritmo')).toBeNull();
});
it('explica ausência sem fabricar uma previsão nem esconder o motivo em outra tela', () => {
  const dados = evolucaoDaMetaDeTeste();
  dados.cenario = { disponivel: false, motivo: 'historico_insuficiente' };
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.getByText(/cinco registros, separados por sete dias/)).toBeTruthy();
  expect(screen.queryByText(/Conclusão: cerca/)).toBeNull();
});
it.each(['ponto', 'pontos', 'XP'])('não apresenta %s como resultado mensurado', (unidade) => {
  const dados = evolucaoDaMetaDeTeste({
    unidade,
    evolucao: { estado: 'unidade_sem_resultado_mensurado', pontos: [] },
    cenario: { disponivel: false },
  });
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.queryByText('Evolução da meta')).toBeNull();
});
it('preserva redução, zero e encerramento sem projetar', () => {
  const dados = evolucaoDaMetaDeTeste({
    estado: 'concluida',
    cenario: { disponivel: false, motivo: 'campanha_encerrada' },
  });
  dados.evolucao.avancoRegistrado = -2;
  dados.evolucao.pontos[4] = { data: '2026-10-24', valor: 0, revisado: true };
  render(<EvolucaoDaMeta dados={dados} />);
  expect(screen.getByLabelText(/2026-10-24: 0 módulos, valor revisado/)).toBeTruthy();
  expect(screen.getByText(/Esta campanha já foi encerrada/)).toBeTruthy();
  expect(screen.queryByText(/Conclusão: cerca/)).toBeNull();
});
it('resume após prazo sem pressão e mantém necessário ausente quando o prazo passou', () => {
  render(
    <CenarioDaMeta
      cenario={{
        disponivel: true,
        ritmoSemanal: 2,
        faltante: 8,
        semanasAproximadas: 4,
        prazo: {
          ...prazo,
          situacao: 'depois_do_prazo',
          margemDias: -7,
          ritmoSemanalNecessario: null,
        },
      }}
      unidade="módulos"
    />,
  );
  expect(screen.getByText('Depois do prazo, se mantiver o ritmo.')).toBeTruthy();
  expect(screen.getByText('Faltam 8 módulos. Seu ritmo é de 2 módulos por semana.')).toBeTruthy();
  expect(screen.queryByText('Por que passa do prazo?')).toBeNull();
  expect(screen.queryByText(/seriam cerca de/)).toBeNull();
});

it('separa o avanço do período do histórico recente mostrado no gráfico', () => {
  const dados = evolucaoDaMetaDeTeste();
  dados.evolucao.avancoRegistrado = 11;
  render(
    <EvolucaoDaMeta
      dados={dados}
      periodoSelecionado={{ inicio: '2026-10-12', fim: '2026-10-18' }}
      evolucaoDoPeriodo={{ avancoRegistrado: 2 }}
    />,
  );
  expect(screen.getByText('+2 módulos no período')).toBeTruthy();
  expect(screen.queryByText(/11 módulos/)).toBeNull();
  expect(screen.getByLabelText(/2026-10-24: 8 módulos/)).toBeTruthy();
});
