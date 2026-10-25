import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { DiariosProvider } from '../../state/DiariosContext';
import { DiarioScreen } from './DiarioScreen';

const mockRequisitar = jest.fn();
let mockUsuarioId;
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: mockUsuarioId },
    requisitarAutenticado: mockRequisitar,
  }),
}));
const navigation = { navigate: jest.fn() };
let servidor;
let sequencia;
function tela() {
  return (
    <NavigationContainer>
      <DiariosProvider>
        <DiarioScreen navigation={navigation} />
      </DiariosProvider>
    </NavigationContainer>
  );
}
async function abrir(entradas = []) {
  servidor = entradas.map((entrada) => ({ ...entrada, tipo: entrada.tipo.toLowerCase() }));
  const resultado = render(tela());
  await screen.findByLabelText('Atualizar histórico');
  return resultado;
}
const entradaAntiga = {
  id: 1,
  tipo: 'REFLEXAO',
  texto: 'Texto original',
  dataRegistro: '2026-09-15',
  criadaEm: '2026-09-15T20:00:00Z',
  atualizadaEm: '2026-09-15T20:00:00Z',
};
beforeEach(() => {
  servidor = [];
  sequencia = 5;
  mockUsuarioId = 'pessoa-a';
  mockRequisitar.mockReset().mockImplementation(async (caminho, opcoes) => {
    if (!opcoes) return servidor.filter((e) => !e.excluidaEm).map((e) => ({ ...e }));
    const id = Number(caminho.split('/').pop());
    if (opcoes.metodo === 'POST') {
      const entrada = {
        ...opcoes.corpo,
        id: ++sequencia,
        criadaEm: '2026-10-24T12:00:00Z',
        atualizadaEm: '2026-10-24T12:00:00Z',
      };
      servidor.push(entrada);
      return entrada;
    }
    if (opcoes.metodo === 'PATCH') {
      servidor = servidor.map((e) => (e.id === id ? { ...e, ...opcoes.corpo } : e));
      return servidor.find((e) => e.id === id);
    }
    servidor = servidor.map((e) =>
      e.id === id ? { ...e, excluidaEm: '2026-10-24T12:00:00Z' } : e,
    );
    return null;
  });
});
afterEach(() => jest.restoreAllMocks());

it('carrega o histórico da conta e permite digitação sem módulo nativo', async () => {
  await abrir();
  expect(screen.getByText('Diário de crescimento')).toBeTruthy();
  expect(screen.getByLabelText('Reflexão de hoje')).toBeTruthy();
  expect(screen.queryByLabelText('Ditar texto')).toBeNull();
  expect(screen.getByText('Seu diário começa aqui')).toBeTruthy();
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/diario');
});

it('salva na API e recupera a entrada ao reabrir a tela', async () => {
  const primeira = await abrir();
  fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Consegui respeitar meu ritmo.');
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  expect(await screen.findByText('Entrada salva no seu diário.')).toBeTruthy();
  expect(screen.getByText('Consegui respeitar meu ritmo.')).toBeTruthy();
  primeira.unmount();
  render(tela());
  expect(await screen.findByText('Consegui respeitar meu ritmo.')).toBeTruthy();
});

it('exige texto e preserva a linguagem neutra de Deslize', async () => {
  await abrir();
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  expect(screen.getByText('Escreva uma mensagem para continuar.')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Deslize'));
  expect(screen.getByText('Sem culpa: entender o padrão também é progresso.')).toBeTruthy();
  expect(screen.getByLabelText('Registrar e retomar')).toBeTruthy();
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
});

it('edita uma entrada antiga mantendo seu dia original', async () => {
  await abrir([entradaAntiga]);
  fireEvent.press(screen.getByLabelText('Editar entrada de 15/09'));
  fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Texto revisado');
  fireEvent.press(screen.getByLabelText('Salvar alterações'));
  await screen.findByText('Entrada salva no seu diário.');
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-a/diario/1', {
    metodo: 'PATCH',
    corpo: { tipo: 'reflexao', dataRegistro: '2026-09-15', texto: 'Texto revisado' },
  });
  expect(screen.getByText('Texto revisado')).toBeTruthy();
  expect(screen.queryByText('Texto original')).toBeNull();
});

it('mantém o rascunho quando salvar falha e permite tentar de novo', async () => {
  await abrir();
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Meu texto');
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  await screen.findByText(
    'Não foi possível salvar a alteração. Seu texto foi mantido para tentar novamente.',
  );
  expect(screen.getByLabelText('Reflexão de hoje').props.value).toBe('Meu texto');
  expect(screen.queryByText('Entrada salva no seu diário.')).toBeNull();
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  expect(await screen.findByText('Entrada salva no seu diário.')).toBeTruthy();
});

it('não confirma sucesso nem duplica envio enquanto aguarda a API', async () => {
  await abrir();
  let confirmar;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        confirmar = resolve;
      }),
  );
  fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Com calma');
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  fireEvent.press(screen.getByLabelText('Salvando…'));
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  expect(screen.queryByText('Entrada salva no seu diário.')).toBeNull();
  await act(async () =>
    confirmar({ ...entradaAntiga, id: 8, tipo: 'reflexao', texto: 'Com calma' }),
  );
  expect(screen.getByText('Entrada salva no seu diário.')).toBeTruthy();
});

it('mostra erro de carregamento com repetição, sem apresentar histórico vazio', async () => {
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  render(tela());
  await screen.findByText(
    'Não foi possível carregar seu diário. Confira a conexão e tente novamente.',
  );
  expect(screen.queryByText('Seu diário começa aqui')).toBeNull();
  fireEvent.press(screen.getByLabelText('Tentar novamente'));
  expect(await screen.findByText('Seu diário começa aqui')).toBeTruthy();
});

it('exige confirmação para excluir e mantém a entrada quando a API falha', async () => {
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await abrir([entradaAntiga]);
  fireEvent.press(screen.getByLabelText('Excluir entrada de 15/09'));
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
  await act(async () => Alert.alert.mock.calls[0][2].find((b) => b.text === 'Excluir').onPress());
  expect(screen.getByText('Texto original')).toBeTruthy();
  expect(screen.queryByText('Entrada excluída.')).toBeNull();
  fireEvent.press(screen.getByLabelText('Excluir entrada de 15/09'));
  await act(async () => Alert.alert.mock.calls[1][2].find((b) => b.text === 'Excluir').onPress());
  expect(screen.queryByText('Texto original')).toBeNull();
  expect(screen.getByText('Entrada excluída.')).toBeTruthy();
});

it('descarta o histórico atrasado da conta anterior', async () => {
  let responder;
  mockRequisitar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        responder = resolve;
      }),
  );
  const resultado = render(tela());
  mockUsuarioId = 'pessoa-b';
  resultado.rerender(tela());
  await screen.findByText('Seu diário começa aqui');
  await act(async () =>
    responder([{ ...entradaAntiga, tipo: 'reflexao', texto: 'Privado da pessoa A' }]),
  );
  await waitFor(() => expect(screen.queryByText('Privado da pessoa A')).toBeNull());
  expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa-b/diario');
});
