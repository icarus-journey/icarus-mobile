import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../../navigation/RootNavigator';
import { LojaProvider } from '../../state/LojaContext';
import { movimentoDeTeste, paginaExtratoDeTeste } from '../../testUtils/extratoPontos';
const mockRequisitar = jest.fn();
let mockUsuario = 'a';
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuario },
    novaConta: false,
    requisitarAutenticado: mockRequisitar,
  }),
}));
function app(rota = 'Extrato') {
  return (
    <LojaProvider>
      <NavigationContainer>
        <RootNavigator initialRouteName={rota} />
      </NavigationContainer>
    </LojaProvider>
  );
}
beforeEach(() => {
  mockUsuario = 'a';
  mockRequisitar.mockReset().mockImplementation(async (rota) => {
    if (rota.endsWith('/loja'))
      return {
        saldoPontos: 300,
        recompensas: [],
        resgates: [],
        protecao: { titulo: 'Proteção de sequência', custo: 100, quantidade: 1, limite: 3 },
      };
    if (rota.endsWith('/extrato/12'))
      return {
        versaoContrato: '1.0.0',
        fusoHorario: 'America/Sao_Paulo',
        movimento: movimentoDeTeste({ saldoApos: null }),
      };
    return paginaExtratoDeTeste({
      proximoCursor: rota.includes('cursor=') ? null : 'proximo',
      movimentos: [
        movimentoDeTeste(
          rota.includes('cursor=')
            ? { id: 11, tituloOrigem: 'Café especial', tipo: 'compraItem', quantidade: -120 }
            : {},
        ),
      ],
    });
  });
});
it('abre pela loja, pagina, mostra detalhe legado e retorna com a lista preservada', async () => {
  render(app('Loja'));
  fireEvent.press(await screen.findByLabelText('Ver extrato'));
  await screen.findByText('Estudar redes');
  fireEvent.press(screen.getByLabelText('Ver mais movimentos'));
  await screen.findByText('Café especial');
  fireEvent.press(screen.getByRole('button', { name: /Ver movimento: Estudar redes/ }));
  await screen.findByText('Saldo após este movimento');
  expect(screen.getByText('Indisponível')).toBeTruthy();
  expect(screen.queryByLabelText('Resgatar recompensa')).toBeNull();
  fireEvent.press(screen.getByLabelText('Voltar ao extrato'));
  await screen.findByText('Café especial');
  expect(mockRequisitar.mock.calls.filter(([r]) => r.includes('/extrato?'))).toHaveLength(2);
});
it('combina período e natureza, e voltar para todos mantém o período', async () => {
  render(app());
  await screen.findByText('Estudar redes');
  fireEvent.press(screen.getByRole('tab', { name: 'Usados' }));
  await waitFor(() => expect(mockRequisitar.mock.lastCall[0]).toContain('natureza=usados'));
  fireEvent.press(screen.getByLabelText('Últimos 30 dias'));
  fireEvent.press(await screen.findByLabelText('Todo o histórico'));
  await waitFor(() => expect(mockRequisitar.mock.lastCall[0]).toContain('todoHistorico=true'));
  expect(mockRequisitar.mock.lastCall[0]).toContain('natureza=usados');
  fireEvent.press(screen.getByRole('tab', { name: 'Todos' }));
  await waitFor(() => expect(mockRequisitar.mock.lastCall[0]).toContain('natureza=todos'));
  expect(mockRequisitar.mock.lastCall[0]).toContain('todoHistorico=true');
});
it('falha na paginação mantém a lista e permite repetir sem duplicar', async () => {
  render(app());
  await screen.findByText('Estudar redes');
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockRejectedValueOnce(new Error('Rede'));
  fireEvent.press(screen.getByLabelText('Ver mais movimentos'));
  await screen.findByText('Não foi possível carregar. Confira a conexão e tente de novo.');
  expect(screen.getByText('Estudar redes')).toBeTruthy();
  mockRequisitar.mockImplementation(normal);
  fireEvent.press(screen.getByLabelText('Tentar carregar mais'));
  await screen.findByText('Café especial');
  expect(screen.getAllByText('Estudar redes')).toHaveLength(1);
});
it('ignora resposta tardia após trocar usuário e limpa dados na expiração', async () => {
  let responder;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        responder = resolve;
      }),
  );
  const tela = render(app());
  mockUsuario = 'b';
  mockRequisitar.mockResolvedValue(
    paginaExtratoDeTeste({ movimentos: [movimentoDeTeste({ tituloOrigem: 'Outra conta' })] }),
  );
  tela.rerender(app());
  await screen.findByText('Outra conta');
  await act(async () => responder(paginaExtratoDeTeste()));
  expect(screen.queryByText('Estudar redes')).toBeNull();
  mockRequisitar.mockRejectedValue(Object.assign(new Error('Sessão'), { status: 401 }));
  fireEvent.press(screen.getByRole('tab', { name: 'Recebidos' }));
  await screen.findByText('Sua sessão terminou. Entre novamente.');
  expect(screen.queryByText('Outra conta')).toBeNull();
});
it('distingue primeiro uso de período vazio sem inventar saldo zero', async () => {
  mockRequisitar.mockResolvedValue(
    paginaExtratoDeTeste({
      movimentos: [],
      saldoAtual: 1270,
      temRegistros: false,
      proximoCursor: null,
    }),
  );
  render(app());
  await screen.findByLabelText('Saldo disponível agora: 1.270 pontos');
  expect(screen.queryByText('Estudar redes')).toBeNull();
  expect(screen.queryByLabelText('Saldo disponível agora: 0 pontos')).toBeNull();
});
