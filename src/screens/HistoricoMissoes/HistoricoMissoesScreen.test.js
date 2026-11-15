import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { RootNavigator } from '../../navigation/RootNavigator';
import { MissionsProvider } from '../../state/MissionsContext';
import { EpicsProvider } from '../../state/EpicsContext';
import { CampaignsProvider } from '../../state/CampaignsContext';
import { paginaHistoricoDeTeste, registroHistoricoDeTeste } from '../../testUtils/historicoMissoes';
const mockRequisitar = jest.fn();
let mockUsuario = 'a';
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuario },
    novaConta: false,
    requisitarAutenticado: mockRequisitar,
  }),
}));
function app(rota = 'HistoricoMissoes') {
  return (
    <MissionsProvider initialMissions={[]}>
      <EpicsProvider initialEpics={[]}>
        <CampaignsProvider initialCampaigns={[]}>
          <NavigationContainer>
            <RootNavigator initialRouteName={rota} />
          </NavigationContainer>
        </CampaignsProvider>
      </EpicsProvider>
    </MissionsProvider>
  );
}
beforeEach(() => {
  mockUsuario = 'a';
  mockRequisitar.mockReset().mockImplementation(async (rota) => {
    if (rota.endsWith('/historico/missoes/campanhas'))
      return [{ id: 7, titulo: 'Fundamentos de redes', removida: true }];
    if (rota.endsWith('/historico/missoes/12'))
      return {
        versaoContrato: '1.0.0',
        fusoHorario: 'America/Sao_Paulo',
        registro: registroHistoricoDeTeste(),
      };
    if (rota.includes('/historico/missoes?'))
      return paginaHistoricoDeTeste({
        proximoCursor: rota.includes('cursor=') ? null : 'proxima',
        registros: rota.includes('cursor=')
          ? [
              registroHistoricoDeTeste({
                id: 11,
                titulo: 'Ler um capítulo',
                estado: 'feitaComAtraso',
              }),
            ]
          : [registroHistoricoDeTeste()],
      });
    return { estado: 'sem_registros', podeTentarNovamente: false };
  });
});
it('abre pela entrada compacta, pagina, vê detalhe somente leitura e volta sem perder a lista', async () => {
  render(app('MissionList'));
  fireEvent.press(screen.getByLabelText('Histórico'));
  await screen.findByLabelText('Ver registro: Estudar redes, Feita');
  fireEvent.press(screen.getByLabelText('Ver mais registros'));
  await screen.findByLabelText('Ver registro: Ler um capítulo, Feita com atraso');
  fireEvent.press(screen.getByLabelText('Ver registro: Estudar redes, Feita'));
  await screen.findByText('Registro da missão');
  await screen.findByLabelText('Recebidos: mais 30 pontos');
  expect(screen.getByText('Realizada em')).toBeTruthy();
  expect(screen.getByText('Registrada em')).toBeTruthy();
  expect(screen.queryByLabelText('Concluir agora')).toBeNull();
  expect(screen.queryByLabelText('Excluir missão')).toBeNull();
  fireEvent.press(screen.getByLabelText('Voltar ao histórico'));
  await screen.findByLabelText('Ver registro: Ler um capítulo, Feita com atraso');
  expect(mockRequisitar.mock.calls.filter(([r]) => r.includes('/historico/missoes?'))).toHaveLength(
    2,
  );
});
it('filtros têm rascunho, campanha removida e aplicação pelo cliente autenticado', async () => {
  render(app());
  await screen.findByText('Estudar redes');
  fireEvent.press(screen.getByLabelText('Filtrar histórico'));
  fireEvent.press(screen.getByRole('radio', { name: 'Feitas' }));
  fireEvent.press(screen.getByLabelText('Todas as campanhas'));
  fireEvent.press(await screen.findByLabelText('Fundamentos de redes · Removida'));
  fireEvent.press(screen.getByLabelText('Aplicar filtros'));
  await waitFor(() =>
    expect(
      mockRequisitar.mock.calls.some(
        ([r]) => r.includes('estado=feita') && r.includes('campanhaId=7'),
      ),
    ).toBe(true),
  );
  fireEvent.press(screen.getByLabelText('Filtrar histórico'));
  fireEvent.press(screen.getByRole('radio', { name: 'Canceladas' }));
  await waitFor(() => expect(screen.queryByLabelText('Buscando campanhas')).toBeNull());
  fireEvent.press(within(screen.getByLabelText('Filtros do histórico')).getByLabelText('Voltar'));
  expect(screen.getByText('Filtros · 2')).toBeTruthy();
  expect(mockRequisitar.mock.calls.some(([r]) => r.includes('estado=cancelada'))).toBe(false);
});
it('vazio, falha e recuperação não mostram créditos inventados', async () => {
  mockRequisitar
    .mockRejectedValueOnce(new Error('conexão'))
    .mockResolvedValue(paginaHistoricoDeTeste({ registros: [], temRegistros: false }));
  render(app());
  await screen.findByText(/Não foi possível carregar/);
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByText('Sua história começa aqui');
  expect(screen.queryByLabelText('0 pontos')).toBeNull();
});
it('o período do seletor é enviado com início e fim explícitos', async () => {
  render(app());
  await screen.findByText('Estudar redes');
  fireEvent.press(screen.getByLabelText('Escolher período do histórico'));
  fireEvent.press(screen.getByLabelText('Outubro 2026'));
  await waitFor(() =>
    expect(
      mockRequisitar.mock.calls.some(
        ([r]) => r.includes('inicio=2026-10-01') && r.includes('fim=2026-10-31'),
      ),
    ).toBe(true),
  );
});

it('o detalhe de legado preserva ausência e vínculo removido sem oferecer ações de mutação', async () => {
  const normal = mockRequisitar.getMockImplementation();
  mockRequisitar.mockImplementation((rota) =>
    rota.endsWith('/historico/missoes/12')
      ? Promise.resolve({
          versaoContrato: '1.0.0',
          fusoHorario: 'UTC',
          registro: registroHistoricoDeTeste({
            tituloPreservado: false,
            missaoRemovida: true,
            pontosRecebidos: null,
            realizadaEm: null,
            fusoHorarioRealizacao: null,
            campanha: { id: 7, titulo: 'Curso antigo', removida: true },
          }),
        })
      : normal(rota),
  );
  render(app());
  fireEvent.press(await screen.findByLabelText('Ver registro: Estudar redes, Feita'));
  await screen.findByText('Nome atual da missão.');
  expect(screen.getByText('Curso antigo · Removida')).toBeTruthy();
  expect(screen.getByText('Pontos não disponíveis neste registro.')).toBeTruthy();
  expect(screen.queryByLabelText('Recebidos: 0 pontos')).toBeNull();
  expect(screen.queryByLabelText('Excluir missão')).toBeNull();
});
it('erro no detalhe permite tentar novamente sem manter o registro anterior', async () => {
  const normal = mockRequisitar.getMockImplementation();
  let falhar = true;
  mockRequisitar.mockImplementation((rota) =>
    rota.endsWith('/historico/missoes/12') && falhar
      ? Promise.reject(new Error('conexão'))
      : normal(rota),
  );
  render(app());
  fireEvent.press(await screen.findByLabelText('Ver registro: Estudar redes, Feita'));
  await screen.findByText('Não foi possível carregar este registro.');
  falhar = false;
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByLabelText('Recebidos: mais 30 pontos');
});
it('permite consultar outro período e rejeita datas inválidas antes do envio', async () => {
  render(app());
  await screen.findByText('Estudar redes');
  fireEvent.press(screen.getByLabelText('Filtrar histórico'));
  fireEvent.press(screen.getByLabelText('Últimos 30 dias'));
  fireEvent.press(screen.getByLabelText('Outro período'));
  fireEvent.changeText(screen.getByLabelText('Data inicial'), '31/02/2025');
  fireEvent.changeText(screen.getByLabelText('Data final'), '31/03/2025');
  fireEvent.press(screen.getByLabelText('Aplicar filtros'));
  await screen.findByText('Confira as duas datas.');
  fireEvent.changeText(screen.getByLabelText('Data inicial'), '01/02/2025');
  fireEvent.press(screen.getByLabelText('Aplicar filtros'));
  await waitFor(() =>
    expect(
      mockRequisitar.mock.calls.some(
        ([r]) => r.includes('inicio=2025-02-01') && r.includes('fim=2025-03-31'),
      ),
    ).toBe(true),
  );
});
it('um período vazio não é apresentado como primeiro uso quando existe histórico antigo', async () => {
  mockRequisitar.mockResolvedValue(
    paginaHistoricoDeTeste({ registros: [], temRegistros: true, historicoParcial: true }),
  );
  render(app());
  await screen.findByText('Nenhum registro neste período');
  expect(screen.queryByText('Sua história começa aqui')).toBeNull();
  expect(screen.getByLabelText('Alterar filtros')).toBeTruthy();
});
