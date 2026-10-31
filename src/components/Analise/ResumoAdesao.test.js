import { fireEvent, render, screen } from '@testing-library/react-native';

import { ResumoAdesao } from './ResumoAdesao';
import { ResumoEvolucaoPessoal } from './ResumoEvolucaoPessoal';
import { progressoDeTeste } from '../../testUtils/dadosAnaliticos';

const adesao = (alteracoes = {}) => ({
  estado: 'disponivel',
  previstasRegistradas: 10,
  concluidasDoPlanejamento: 8,
  pendentes: 0,
  atrasadas: 2,
  taxaConclusao: 80,
  motivo: null,
  ...alteracoes,
});

it('mostra oito de dez e porcentagem recebidos da API com barra acessível', () => {
  render(<ResumoAdesao adesao={adesao()} />);
  expect(screen.getByText('80%')).toBeTruthy();
  expect(screen.getByText('8 de 10 feitas')).toBeTruthy();
  expect(screen.getByText('2 em aberto ao fechar o período')).toBeTruthy();
  expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({
    min: 0,
    max: 100,
    now: 80,
  });
});

it('zero confirmado difere de porcentagem ausente e tudo feito não depende apenas de cor', () => {
  const { rerender } = render(
    <ResumoAdesao
      adesao={adesao({ concluidasDoPlanejamento: 0, atrasadas: 10, taxaConclusao: 0 })}
    />,
  );
  expect(screen.getByText('0%')).toBeTruthy();
  rerender(
    <ResumoAdesao
      adesao={adesao({ concluidasDoPlanejamento: 10, atrasadas: 0, taxaConclusao: 100 })}
    />,
  );
  expect(screen.getByText('Tudo feito até fechar o período')).toBeTruthy();
});

it('legado mostra planejamento observado sem desenhar uma taxa, e ausência não vira cartão vazio', () => {
  const { rerender } = render(
    <ResumoAdesao
      adesao={adesao({
        estado: 'historico_parcial',
        concluidasDoPlanejamento: null,
        pendentes: null,
        atrasadas: null,
        taxaConclusao: null,
      })}
    />,
  );
  expect(screen.getByText('10')).toBeTruthy();
  expect(screen.queryByRole('progressbar')).toBeNull();
  expect(screen.queryByText(/%/)).toBeNull();
  rerender(
    <ResumoAdesao
      adesao={adesao({
        estado: 'sem_planejamento',
        previstasRegistradas: 0,
        concluidasDoPlanejamento: 0,
        atrasadas: 0,
        taxaConclusao: null,
      })}
    />,
  );
  expect(screen.queryByText('Seu planejamento')).toBeNull();
});

it('atividade realizada continua separada do cumprimento do planejamento e detalhes ficam recolhidos', () => {
  const dados = {
    ...progressoDeTeste(),
    adesao: adesao(),
    indicadores: {
      ...progressoDeTeste().indicadores,
      concluidas: 12,
      previstas: 10,
      taxaConclusao: 80,
      pendentes: 0,
      atrasadas: 2,
    },
  };
  render(<ResumoEvolucaoPessoal dados={dados} />);
  expect(screen.getByLabelText('12 missões feitas')).toBeTruthy();
  expect(screen.getByText('8 de 10 feitas')).toBeTruthy();
  expect(screen.queryByText('Pendentes ao fechar')).toBeNull();
  fireEvent.press(screen.getByLabelText('Ver mais números'));
  expect(screen.getByText('Pendentes ao fechar')).toBeTruthy();
  expect(screen.getByText('Em atraso ao fechar')).toBeTruthy();
});
