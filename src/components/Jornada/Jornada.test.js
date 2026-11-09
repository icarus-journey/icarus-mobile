import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { IndicadoresJornada } from './IndicadoresJornada';
import { DetalhesSequenciaModal } from './DetalhesSequenciaModal';
import { jornadaDeTeste } from '../../testUtils/dadosJornada';

it('mostra dias e saldo reais com os assets aprovados e ações independentes', () => {
  const aoVerSequencia = jest.fn(),
    aoVerLoja = jest.fn();
  render(
    <IndicadoresJornada
      dados={jornadaDeTeste()}
      aoVerSequencia={aoVerSequencia}
      aoVerLoja={aoVerLoja}
    />,
  );
  fireEvent.press(screen.getByLabelText('Sequência de 3 dias. Hoje já contou.'));
  fireEvent.press(screen.getByLabelText('Saldo de pontos: 1.270. Abrir loja.'));
  expect(aoVerSequencia).toHaveBeenCalledTimes(1);
  expect(aoVerLoja).toHaveBeenCalledTimes(1);
  const imagens = screen.UNSAFE_getAllByType(require('react-native').Image);
  expect(imagens[0].props.source).toBe(require('../../assets/jornada/chama-ativa.png'));
  expect(imagens[1].props.source).toBe(require('../../assets/jornada/moeda-com-asa.png'));
  expect(StyleSheet.flatten(imagens[0].props.style)).toMatchObject({ width: 30, height: 30 });
  expect(StyleSheet.flatten(imagens[1].props.style)).toMatchObject({ width: 28, height: 28 });
});

it('chama cinza significa hoje em aberto, não perda antecipada da sequência', () => {
  const base = jornadaDeTeste();
  render(
    <IndicadoresJornada
      dados={jornadaDeTeste({ sequencia: { ...base.sequencia, realizouHoje: false } })}
    />,
  );
  expect(screen.getByLabelText('Sequência de 3 dias. Hoje ainda está em aberto.')).toBeTruthy();
  expect(screen.UNSAFE_getAllByType(require('react-native').Image)[0].props.source).toBe(
    require('../../assets/jornada/chama-pendente.png'),
  );
});

it('indisponibilidade não aparece como zero e pode abrir recuperação', () => {
  const aoVerSequencia = jest.fn();
  render(<IndicadoresJornada dados={null} aoVerSequencia={aoVerSequencia} />);
  expect(screen.queryByText('0')).toBeNull();
  fireEvent.press(screen.getByLabelText('Sequência indisponível. Ver detalhes.'));
  expect(aoVerSequencia).toHaveBeenCalled();
});

it('calendário separa dia feito, sem registro e incerto, com a regra sob demanda', () => {
  const base = jornadaDeTeste();
  const dados = jornadaDeTeste({
    sequencia: {
      ...base.sequencia,
      dias: base.sequencia.dias.map((dia, i) => (i === 1 ? { ...dia, realizada: null } : dia)),
    },
  });
  const aoFechar = jest.fn();
  render(<DetalhesSequenciaModal jornada={{ dados }} aoFechar={aoFechar} />);
  expect(screen.getByLabelText('31/10/2026. Missão realizada.')).toBeTruthy();
  expect(screen.getByLabelText('25/10/2026. Sem realização registrada.')).toBeTruthy();
  expect(screen.getByLabelText('26/10/2026. Registro sem data confirmada.')).toBeTruthy();
  expect(screen.getByText('Cada dia conta uma vez.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Voltar às missões'));
  expect(aoFechar).toHaveBeenCalled();
});

it('detalhes oferecem repetição após falha sem apagar a navegação de volta', () => {
  const atualizar = jest.fn();
  render(
    <DetalhesSequenciaModal
      jornada={{ dados: null, erro: 'Sem conexão', atualizar }}
      aoFechar={jest.fn()}
    />,
  );
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  expect(atualizar).toHaveBeenCalled();
  expect(screen.getByLabelText('Voltar às missões')).toBeTruthy();
});

it('explica legado e fuso sem inventar previsão ou saldo', () => {
  const base = jornadaDeTeste();
  render(
    <DetalhesSequenciaModal
      jornada={{
        dados: jornadaDeTeste({
          sequencia: { ...base.sequencia, estado: 'historico_incompleto', diasAtuais: null },
        }),
      }}
      aoFechar={jest.fn()}
    />,
  );
  expect(screen.getByText('Sequência em aberto')).toBeTruthy();
  expect(screen.getByText(/Alguns registros antigos/)).toBeTruthy();
  expect(screen.queryByText('0 dias seguidos')).toBeNull();
});

it('identifica dia protegido sem apresentá-lo como realização ou aumentar a contagem', () => {
  const base = jornadaDeTeste();
  const dados = jornadaDeTeste({
    protecoesPendentes: 1,
    sequencia: {
      ...base.sequencia,
      diasAtuais: 3,
      dias: base.sequencia.dias.map((dia, i) =>
        i === 2 ? { ...dia, realizada: false, protegida: true } : dia,
      ),
    },
  });
  render(<DetalhesSequenciaModal jornada={{ dados }} aoFechar={jest.fn()} />);
  expect(
    screen.getByLabelText('27/10/2026. Dia protegido. Sua sequência foi mantida.'),
  ).toBeTruthy();
  expect(screen.getByText('O escudo mantém sua sequência sem somar um dia.')).toBeTruthy();
  expect(screen.getByText('Uma proteção será reposta quando houver espaço na loja.')).toBeTruthy();
  expect(screen.getByText('3 dias seguidos')).toBeTruthy();
});
