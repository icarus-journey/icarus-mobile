import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { SecondaryButton } from '../../components/Button';
import { DetalheRelatoScreen, MeusRelatosScreen } from './MeusRelatosScreen';
import { RelatarProblemaScreen, RelatoEnviadoScreen } from './RelatarProblemaScreen';

const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({ requisitarAutenticado: mockRequisitar }),
}));

const Stack = createNativeStackNavigator();
const relato = {
  id: 42,
  assunto: 'Diário não abre',
  protocolo: 'ICA-0042',
  status: 'recebido',
};

function Perfil({ navigation }) {
  return (
    <>
      <SecondaryButton
        label="Relatar problema"
        onPress={() => navigation.navigate('RelatarProblema')}
      />
      <SecondaryButton label="Meus relatos" onPress={() => navigation.navigate('MeusRelatos')} />
    </>
  );
}

function abrir() {
  render(
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="AreaPrincipal" component={Perfil} />
        <Stack.Screen name="RelatarProblema" component={RelatarProblemaScreen} />
        <Stack.Screen name="RelatoEnviado" component={RelatoEnviadoScreen} />
        <Stack.Screen name="MeusRelatos" component={MeusRelatosScreen} />
        <Stack.Screen name="DetalheRelato" component={DetalheRelatoScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

beforeEach(() => mockRequisitar.mockReset());

it('repete com a mesma chave de envio e acompanha o relato criado', async () => {
  mockRequisitar
    .mockRejectedValueOnce(new Error('Resposta perdida'))
    .mockResolvedValueOnce(relato)
    .mockImplementation((rota) =>
      Promise.resolve(
        rota.endsWith('/42')
          ? {
              ...relato,
              descricao: 'Tela carregando',
              historico: [{ status: 'recebido', em: '2026-11-22T14:00:00Z' }],
            }
          : [relato],
      ),
    );

  abrir();
  fireEvent.press(screen.getByLabelText('Relatar problema'));
  expect(screen.getByLabelText('Enviar relato')).toBeDisabled();
  fireEvent.changeText(screen.getByLabelText('Assunto'), 'Diário não abre');
  fireEvent.changeText(screen.getByLabelText('O que aconteceu?'), 'Tela carregando');
  fireEvent.press(screen.getByLabelText('Enviar relato'));

  await screen.findByText('Não foi possível confirmar o envio');
  expect(screen.getByLabelText('O que aconteceu?')).toHaveProp('value', 'Tela carregando');
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  await screen.findByText('Relato enviado');
  expect(mockRequisitar.mock.calls[0]).toEqual(mockRequisitar.mock.calls[1]);
  expect(screen.getByText('ICA-0042')).toBeTruthy();

  fireEvent.press(screen.getByLabelText('Acompanhar relato'));
  expect(await screen.findByText('Protocolo ICA-0042')).toBeTruthy();
  expect(await screen.findByText('Histórico')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Voltar'));
  expect(await screen.findByText('ICA-0042')).toBeTruthy();
});

it('atualiza o status na lista sem exibir a data do cartão', async () => {
  mockRequisitar
    .mockResolvedValueOnce([{ ...relato, criadoEm: '2026-11-22T14:00:00Z' }])
    .mockResolvedValueOnce([{ ...relato, status: 'resolvido' }]);
  abrir();
  fireEvent.press(screen.getByLabelText('Meus relatos'));
  expect(await screen.findByText('Recebido')).toBeTruthy();
  expect(screen.queryByText(/2026/)).toBeNull();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Atualizar' })).toBeEnabled());
  fireEvent.press(screen.getByRole('button', { name: 'Atualizar' }));
  expect(await screen.findByText('Resolvido')).toBeTruthy();
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
});
