import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../../navigation/RootNavigator';
import { relatorioDeTeste } from '../../testUtils/dadosAnaliticos';
import {
  detalheRelatorioDeTeste,
  paginaRelatoriosDeTeste,
  resumoRelatorioDeTeste,
} from '../../testUtils/historicoRelatorios';
const mockRequisitar = jest.fn();
let mockUsuario = 'a';
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuario },
    novaConta: false,
    requisitarAutenticado: mockRequisitar,
  }),
}));
function app(rota = 'HistoricoRelatoriosScreen') {
  return (
    <NavigationContainer>
      <RootNavigator initialRouteName={rota} />
    </NavigationContainer>
  );
}
beforeEach(() => {
  mockUsuario = 'a';
  mockRequisitar.mockReset().mockImplementation(async (rota) => {
    if (rota.endsWith('/semanais') || rota.endsWith('/atual')) return relatorioDeTeste();
    if (rota.endsWith('/semanais/1')) return detalheRelatorioDeTeste();
    return paginaRelatoriosDeTeste({
      relatorios: [
        resumoRelatorioDeTeste(
          rota.includes('cursor=')
            ? {
                id: 2,
                titulo: 'Uma semana anterior',
                periodo: { inicio: '2026-10-05', fim: '2026-10-11', fusoHorario: null },
              }
            : {},
        ),
      ],
      proximoCursor: rota.includes('cursor=') ? null : 'proximo',
    });
  });
});
it('entra pela Minha semana, pagina, consulta texto/configuração e retorna sem perder a lista', async () => {
  render(app('RelatorioSemanalScreen'));
  await screen.findByText('Sua semana de registros');
  fireEvent.press(await screen.findByLabelText('Ver histórico'));
  await screen.findByText('Suas semanas, guardadas');
  fireEvent.press(await screen.findByLabelText('Ver semanas anteriores'));
  await screen.findByText('Uma semana anterior');
  fireEvent.press(screen.getByRole('button', { name: /Abrir relatório de 12–18 out/ }));
  fireEvent.press(await screen.findByLabelText('Sua semana em palavras'));
  await screen.findByText('Duas conclusões registradas, sem comparação de desempenho.');
  fireEvent.press(screen.getByLabelText('Como foi feito'));
  await screen.findByText('Não há pesquisas registradas neste relatório.');
  fireEvent.press(screen.getByLabelText('Sobre a inteligência artificial'));
  await screen.findByText('modelo-de-teste');
  fireEvent.press(screen.getByLabelText('Voltar às informações'));
  fireEvent.press(await screen.findByLabelText('Voltar ao relatório'));
  fireEvent.press(await screen.findByLabelText('Voltar'));
  await screen.findByText('Uma semana anterior');
  expect(mockRequisitar.mock.calls.filter(([r]) => r.includes('semanais?'))).toHaveLength(2);
  expect(mockRequisitar.mock.calls.filter(([, o]) => o?.metodo === 'POST')).toHaveLength(1);
  expect(
    mockRequisitar.mock.calls.every(
      ([r]) => !r.includes('referencias-publicas') && !r.includes('tentar-novamente'),
    ),
  ).toBe(true);
});
it('erro de paginação preserva a lista e a repetição não duplica registros', async () => {
  render(app());
  await screen.findByText('Sua semana de registros');
  mockRequisitar.mockRejectedValueOnce(new Error('Rede'));
  fireEvent.press(screen.getByLabelText('Ver semanas anteriores'));
  await screen.findByText('Não foi possível carregar. Confira a conexão e tente de novo.');
  expect(screen.getByText('Sua semana de registros')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Tentar buscar mais semanas'));
  await screen.findByText('Uma semana anterior');
  expect(screen.getAllByText('Sua semana de registros')).toHaveLength(1);
});
it('mostra vazio real, sem relatório demonstrativo ou geração automática', async () => {
  mockRequisitar.mockResolvedValue(
    paginaRelatoriosDeTeste({ relatorios: [], proximoCursor: null }),
  );
  render(app());
  await screen.findByText('Sua história começa por aqui');
  expect(screen.queryByText('Sua semana de registros')).toBeNull();
  expect(mockRequisitar.mock.calls.every(([, o]) => o == null)).toBe(true);
});
it('descarta resposta antiga ao trocar conta e limpa tudo na sessão expirada', async () => {
  let resolver;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((r) => {
        resolver = r;
      }),
  );
  const tela = render(app());
  mockUsuario = 'b';
  mockRequisitar.mockResolvedValue(
    paginaRelatoriosDeTeste({
      relatorios: [resumoRelatorioDeTeste({ titulo: 'Conta B' })],
      proximoCursor: 'proximo',
    }),
  );
  tela.rerender(app());
  await screen.findByText('Conta B');
  await act(async () => resolver(paginaRelatoriosDeTeste()));
  expect(screen.queryByText('Sua semana de registros')).toBeNull();
  mockRequisitar.mockRejectedValue(Object.assign(new Error('Sessão'), { status: 401 }));
  fireEvent.press(screen.getByLabelText('Ver semanas anteriores'));
  await screen.findByText('Sua sessão terminou. Entre novamente.');
  expect(screen.queryByText('Conta B')).toBeNull();
});
it('legado sem fuso não assume o fuso atual e não recebe taxa fictícia', async () => {
  const normal = mockRequisitar.getMockImplementation();
  const detalhe = detalheRelatorioDeTeste();
  detalhe.resumo.periodo.fusoHorario = null;
  mockRequisitar.mockImplementation((r) =>
    r.endsWith('/semanais/1') ? Promise.resolve(detalhe) : normal(r),
  );
  render(app());
  fireEvent.press(await screen.findByRole('button', { name: /Abrir relatório de/ }));
  await screen.findByText('Fuso desta semana não registrado.');
  expect(screen.queryByText('0%')).toBeNull();
  fireEvent.press(screen.getByLabelText('Como foi feito'));
  await screen.findByText('Fuso não registrado.');
  expect(screen.queryByText('Horário de São Paulo')).toBeNull();
});
it('erro no detalhe permite repetir a leitura sem criar outro relatório', async () => {
  const normal = mockRequisitar.getMockImplementation();
  let falhar = true;
  mockRequisitar.mockImplementation((r) =>
    r.endsWith('/semanais/1') && falhar ? Promise.reject(new Error('Rede')) : normal(r),
  );
  render(app());
  fireEvent.press(await screen.findByRole('button', { name: /Abrir relatório de/ }));
  await screen.findByText('Não foi possível abrir este relatório.');
  falhar = false;
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByText('REFLEXÃO COM INTELIGÊNCIA ARTIFICIAL');
  await waitFor(() => expect(mockRequisitar.mock.calls.every(([, o]) => o == null)).toBe(true));
});
