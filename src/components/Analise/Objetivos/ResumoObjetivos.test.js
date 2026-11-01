import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { ResumoObjetivos } from './ResumoObjetivos';
import { objetivosDeTeste } from '../../../testUtils/objetivosAnaliticos';
import { PERIODO_ANALITICO } from '../../../testUtils/dadosAnaliticos';

function montar(dados = objetivosDeTeste()) {
  const aoAbrirCampanha = jest.fn(),
    aoAbrirEpico = jest.fn();
  render(
    <ResumoObjetivos
      dados={dados}
      periodo={PERIODO_ANALITICO}
      aoAbrirCampanha={aoAbrirCampanha}
      aoAbrirEpico={aoAbrirEpico}
      aoVerPesquisas={jest.fn()}
    />,
  );
  return { aoAbrirCampanha, aoAbrirEpico };
}
it('mantém o resumo compacto e revela estados, atividade e valores por demanda', () => {
  const { aoAbrirCampanha } = montar();
  expect(screen.getByText('Seus objetivos · Agora')).toBeTruthy();
  expect(screen.queryByLabelText('Detalhar campanha: Caminhar no parque')).toBeNull();
  expect(screen.getByLabelText('Aprender mensageria: 8 de 16 módulos')).toBeTruthy();
  expect(screen.getByText('Avanço no período')).toBeTruthy();
  expect(screen.getByText('Cerca de 4 semanas para chegar lá')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Ver meus objetivos'));
  expect(screen.getByText('Estados e metas: agora · Atividade: 12–18 out 2026')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Detalhar campanha: Aprender mensageria'));
  expect(screen.getByLabelText('Valor atual da meta').props.accessibilityValue.text).toBe(
    '8 de 16 módulos',
  );
  fireEvent.press(screen.getByLabelText('Ver campanha: Aprender mensageria'));
  expect(aoAbrirCampanha).toHaveBeenCalledWith(12);
  expect(screen.queryByLabelText('Detalhar campanha: Aprender mensageria')).toBeNull();
});
it('filtra ausência recente sem misturá-la com o período escolhido ou com pontos', () => {
  montar();
  fireEvent.press(screen.getByLabelText('Ver meus objetivos'));
  fireEvent.press(screen.getByText('1 sem missão registrada nos últimos 7 dias'));
  expect(screen.queryByLabelText('Detalhar campanha: Aprender mensageria')).toBeNull();
  fireEvent.press(screen.getByLabelText('Detalhar campanha: Caminhar no parque'));
  expect(screen.getByText('0 missões feitas no período')).toBeTruthy();
  expect(screen.queryByLabelText('Valor atual da meta')).toBeNull();
  expect(
    within(screen.getByLabelText('Painel de objetivos')).queryByText(
      'Cerca de 4 semanas para chegar lá',
    ),
  ).toBeNull();
});
it('mostra épicos por contagens e navega sem inventar percentual', () => {
  const { aoAbrirEpico } = montar();
  fireEvent.press(screen.getByLabelText('Ver meus objetivos'));
  fireEvent.press(screen.getByRole('tab', { name: 'Épicos dos objetivos' }));
  expect(screen.getByText('2 em andamento · 0 planejadas · 0 concluídas')).toBeTruthy();
  expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
  fireEvent.press(screen.getByLabelText('Ver épico: Minha jornada'));
  expect(aoAbrirEpico).toHaveBeenCalledWith(1);
});
it('não escolhe foco local nem mostra falsa inatividade quando a API informa incerteza', () => {
  const dados = objetivosDeTeste();
  dados.campanhaEmDestaqueId = null;
  dados.estadoDestaque = 'historico_incompleto';
  dados.campanhasSemRegistroRecente = null;
  dados.campanhas[0].atividade.concluidasNosUltimosSeteDias = null;
  montar(dados);
  expect(screen.queryByText('Sua campanha em destaque')).toBeNull();
  fireEvent.press(screen.getByLabelText('Ver meus objetivos'));
  expect(screen.queryByText(/sem missão registrada nos últimos/)).toBeNull();
});
it('não preenche avanço de um registro isolado nem oferece uma previsão ausente', () => {
  const dados = objetivosDeTeste();
  const r = dados.campanhas[0].resultado;
  r.evolucaoNoPeriodo.avancoRegistrado = null;
  r.evolucaoNoPeriodo.pontos = r.evolucaoNoPeriodo.pontos.slice(0, 1);
  r.cenarioAtual = { disponivel: false, motivo: 'historico_insuficiente' };
  montar(dados);
  expect(screen.queryByText('Avanço no período')).toBeNull();
  expect(screen.queryByText(/Cerca de/)).toBeNull();
  expect(screen.getByText('Faltam agora')).toBeTruthy();
});
