import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert, Text, View, Pressable } from 'react-native';

import { EpicsProvider, useEpics } from './EpicsContext';
import { CampaignsProvider, useCampaigns } from './CampaignsContext';
import { MissionsProvider, useMissions } from './MissionsContext';
import { ExclusoesPlanejamentoProvider } from './ExclusoesPlanejamentoContext';
import { EpicDetailScreen } from '../screens/EpicDetail/EpicDetailScreen';
import { CampaignDetailScreen } from '../screens/CampaignDetail/CampaignDetailScreen';
import { MissionDetailScreen } from '../screens/MissionDetail/MissionDetailScreen';

const mockRequisitar = jest.fn();
jest.mock('./SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'titular' }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (efeito) => require('react').useEffect(efeito, [efeito]),
}));

const epico = {
  id: 1,
  titulo: 'Estudar',
  dificuldade: 'FACIL',
  estado: 'emAndamento',
  campanhasAtribuidas: [{ id: 2 }],
};
const campanha = {
  id: 2,
  titulo: 'Curso',
  dificuldade: 'FACIL',
  estado: 'emAndamento',
  epico: { id: 1 },
  missoesAtribuidas: [],
};
const missao = {
  id: 3,
  titulo: 'Ler',
  dificuldade: 'FACIL',
  recorrente: true,
  campanha: { id: 2, epicoId: 1 },
};
const navigation = { goBack: jest.fn(), popToTop: jest.fn(), navigate: jest.fn() };

function Listas() {
  const epicos = useEpics();
  const campanhas = useCampaigns();
  const missoes = useMissions();
  const recarregar = () => {
    const resposta = [
      {
        ...epico,
        dificuldade: 'facil',
        campanhas: [
          { ...campanha, dificuldade: 'facil', missoes: [{ ...missao, dificuldade: 'facil' }] },
        ],
      },
    ];
    epicos.carregarLista(resposta);
    campanhas.carregarLista(resposta);
    missoes.carregarLista(resposta, []);
  };
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simular leitura anterior"
        onPress={recarregar}
      >
        <Text>Recarregar</Text>
      </Pressable>
      <Text testID="listas">{`${epicos.epics.length}/${campanhas.campaigns.length}/${missoes.missions.length}`}</Text>
    </View>
  );
}

function Pagina({ Tela, parametros, dadosMissao = missao }) {
  return (
    <ExclusoesPlanejamentoProvider>
      <EpicsProvider initialEpics={[epico]}>
        <CampaignsProvider initialCampaigns={[campanha]}>
          <MissionsProvider initialMissions={[dadosMissao]}>
            <Listas />
            <Tela navigation={navigation} route={{ params: parametros }} />
          </MissionsProvider>
        </CampaignsProvider>
      </EpicsProvider>
    </ExclusoesPlanejamentoProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequisitar.mockImplementation(async (_rota, opcoes) => {
    if (opcoes?.metodo === 'DELETE') return null;
    throw new Error('Sem leitura de progresso');
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ['épico', 'epicos', 1, EpicDetailScreen, { epicId: 1 }, '0/0/0'],
  ['campanha', 'campanhas', 2, CampaignDetailScreen, { campaignId: 2 }, '1/0/0'],
  ['missão', 'missoes', 3, MissionDetailScreen, { missionId: 3 }, '1/1/0'],
])(
  'confirma exclusão de %s, limpa a lista e rejeita reidratação antiga',
  async (nome, rota, id, Tela, parametros, esperado) => {
    render(<Pagina Tela={Tela} parametros={parametros} />);
    fireEvent.press(screen.getByRole('button', { name: `Excluir ${nome}` }));
    expect(Alert.alert).toHaveBeenCalledWith(
      `Excluir ${nome}?`,
      expect.stringContaining('pontos'),
      expect.any(Array),
    );
    expect(mockRequisitar.mock.calls.some(([, opcoes]) => opcoes?.metodo === 'DELETE')).toBe(false);
    // Voltar/fechar a confirmação não envia nada.
    expect(Alert.alert.mock.calls[0][2][0].style).toBe('cancel');
    await act(async () =>
      Alert.alert.mock.calls[0][2].find((acao) => acao.text === 'Excluir').onPress(),
    );
    expect(mockRequisitar).toHaveBeenCalledWith(`/api/usuarios/titular/${rota}/${id}`, {
      metodo: 'DELETE',
    });
    expect(screen.getByTestId('listas').props.children).toBe(esperado);
    expect(navigation.popToTop).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Simular leitura anterior' }));
    expect(screen.getByTestId('listas').props.children).toBe(esperado);
  },
);

it('mantém o item no erro e permite nova tentativa sem exclusão otimista', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  render(<Pagina Tela={MissionDetailScreen} parametros={{ missionId: 3 }} />);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir missão' }));
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(screen.getByRole('alert').props.children).toBe(
    'Não foi possível excluir. Tente novamente.',
  );
  expect(screen.getByTestId('listas').props.children).toBe('1/1/1');
  expect(navigation.popToTop).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Excluir missão' }));
  await act(async () => Alert.alert.mock.calls[1][2][1].onPress());
  expect(screen.getByTestId('listas').props.children).toBe('1/1/0');
});

it('informa conflito sem esconder a missão que já pode ter sido concluída', async () => {
  mockRequisitar.mockRejectedValueOnce(Object.assign(new Error(), { status: 409 }));
  render(<Pagina Tela={MissionDetailScreen} parametros={{ missionId: 3 }} />);
  fireEvent.press(screen.getByRole('button', { name: 'Excluir missão' }));
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(screen.getByText('Este item mudou. Volte à lista e tente novamente.')).toBeTruthy();
  expect(screen.getByTestId('listas').props.children).toBe('1/1/1');
});

it('não oferece exclusão da missão avulsa concluída', () => {
  render(
    <Pagina
      Tela={MissionDetailScreen}
      parametros={{ missionId: 3 }}
      dadosMissao={{ ...missao, recorrente: false, concluidaEm: '2026-10-24T12:00:00Z' }}
    />,
  );
  expect(screen.queryByText('Excluir missão')).toBeNull();
});

it('mantém exclusão da recorrente parada', () => {
  render(
    <Pagina
      Tela={MissionDetailScreen}
      parametros={{ missionId: 3 }}
      dadosMissao={{ ...missao, inativa: true }}
    />,
  );
  expect(screen.getByText('Excluir missão')).toBeTruthy();
});

it('ignora resposta após sair da sessão e não carrega exclusões para a sessão seguinte', async () => {
  let responder;
  mockRequisitar.mockImplementation(
    () =>
      new Promise((resolve) => {
        responder = resolve;
      }),
  );
  const pagina = render(
    <View>
      <Pagina key="primeira" Tela={MissionDetailScreen} parametros={{ missionId: 3 }} />
    </View>,
  );
  fireEvent.press(screen.getByRole('button', { name: 'Excluir missão' }));
  act(() => {
    Alert.alert.mock.calls[0][2][1].onPress();
  });
  expect(
    screen.getByRole('button', { name: 'Excluindo...' }).props.accessibilityState.disabled,
  ).toBe(true);
  pagina.rerender(
    <View>
      <Pagina key="outra" Tela={MissionDetailScreen} parametros={{ missionId: 3 }} />
    </View>,
  );
  await act(async () => responder(null));
  await waitFor(() => expect(screen.getByTestId('listas').props.children).toBe('1/1/1'));
  expect(navigation.popToTop).not.toHaveBeenCalled();
});

it('retira do épico a missão recebida do onboarding na sessão atual', async () => {
  render(
    <Pagina
      Tela={EpicDetailScreen}
      parametros={{ epicId: 1 }}
      dadosMissao={{ ...missao, campanha: { id: 2, epico: { id: 1 } } }}
    />,
  );
  fireEvent.press(screen.getByRole('button', { name: 'Excluir épico' }));
  await act(async () => Alert.alert.mock.calls[0][2][1].onPress());
  expect(screen.getByTestId('listas').props.children).toBe('0/0/0');
});
