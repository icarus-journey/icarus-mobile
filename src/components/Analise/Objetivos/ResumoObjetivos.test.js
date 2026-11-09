import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ResumoObjetivos } from './ResumoObjetivos';
import { objetivosDeTeste } from '../../../testUtils/objetivosAnaliticos';
import { PERIODO_ANALITICO } from '../../../testUtils/dadosAnaliticos';

function montar(dados = objetivosDeTeste()) {
  const aoAbrirCampanha = jest.fn();
  function Conteudo({ dados }) {
    const [selecionada, selecionar] = useState(null);
    return (
      <ResumoObjetivos
        dados={dados}
        periodo={PERIODO_ANALITICO}
        campanhaSelecionadaId={selecionada}
        aoSelecionarCampanha={selecionar}
        aoAbrirCampanha={aoAbrirCampanha}
      />
    );
  }
  const tela = render(<Conteudo dados={dados} />);
  return { aoAbrirCampanha, atualizar: (novos) => tela.rerender(<Conteudo dados={novos} />) };
}
it('usa o destaque da API e substitui o painel de objetivos por um seletor de campanha', () => {
  montar();
  expect(screen.queryByText('Seus objetivos · Agora')).toBeNull();
  expect(screen.queryByLabelText('Ver meus objetivos')).toBeNull();
  expect(
    screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
  ).toBe('Aprender mensageria');
  expect(screen.getByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeTruthy();
  expect(screen.getByText('+2 módulos no período')).toBeTruthy();
});
it('permite escolher campanha sem medição e abre a campanha sem inventar resultado', () => {
  const { aoAbrirCampanha } = montar();
  fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
  fireEvent.press(screen.getByRole('button', { name: 'Caminhar no parque' }));
  expect(
    screen.getByText('Esta campanha ainda não tem um resultado mensurado para exibir.'),
  ).toBeTruthy();
  expect(screen.queryByText('+2 módulos no período')).toBeNull();
  fireEvent.press(screen.getByLabelText('Ver campanha: Caminhar no parque'));
  expect(aoAbrirCampanha).toHaveBeenCalledWith(13);
});
it('não inventa destaque com histórico incerto, mas permite uma escolha explícita', () => {
  const dados = objetivosDeTeste();
  dados.campanhaEmDestaqueId = null;
  dados.estadoDestaque = 'historico_incompleto';
  montar(dados);
  expect(screen.getByText('Escolha a campanha que você quer acompanhar.')).toBeTruthy();
  expect(screen.queryByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeNull();
  fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
  fireEvent.press(screen.getByRole('button', { name: 'Aprender mensageria' }));
  expect(screen.getByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeTruthy();
});
it.each(['planejada', 'concluida'])(
  'exibe a campanha %s selecionada com seu estado e valor reais',
  (estado) => {
    const dados = objetivosDeTeste();
    dados.campanhaEmDestaqueId = null;
    dados.campanhas[0].estado = estado;
    dados.campanhas[0].resultado.cenarioAtual = { disponivel: false, motivo: 'campanha_encerrada' };
    montar(dados);
    const titulo = `Aprender mensageria · ${estado === 'planejada' ? 'Planejada' : 'Concluída'}`;
    fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
    fireEvent.press(screen.getByRole('button', { name: titulo }));
    expect(
      screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
    ).toBe(titulo);
    expect(screen.getByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeTruthy();
    expect(screen.queryByText(/Cerca de/)).toBeNull();
  },
);
it('retoma o destaque da API se a campanha escolhida deixar de estar disponível', () => {
  const dados = objetivosDeTeste();
  const { atualizar } = montar(dados);
  fireEvent.press(screen.getByLabelText('Escolher campanha do progresso'));
  fireEvent.press(screen.getByRole('button', { name: 'Caminhar no parque' }));
  atualizar({ ...dados, campanhas: dados.campanhas.slice(0, 1) });
  expect(
    screen.getByLabelText('Escolher campanha do progresso').props.accessibilityValue.text,
  ).toBe('Aprender mensageria');
});
