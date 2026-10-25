import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '../../navigation/RootNavigator';
import { ErroApi } from '../../services/api';
import { LojaProvider } from '../../state/LojaContext';

const mockRequisitar = jest.fn();
jest.mock('../../state/SessaoContext', () => ({
  useSessao: () => ({
    sessao: { usuarioId: 'pessoa' },
    novaConta: false,
    requisitarAutenticado: mockRequisitar,
  }),
}));

let mockLoja;
let mockFalhar;

beforeEach(() => {
  mockFalhar = false;
  mockLoja = {
    saldoPontos: 300,
    recompensas: [
      {
        id: 1,
        titulo: 'Pausa sem culpa',
        descricao: '30 min de descanso',
        custo: 120,
        estado: 'disponivel',
        imutavel: false,
        resgateId: null,
      },
    ],
    protecao: { titulo: 'Proteção de sequência', custo: 100, quantidade: 0, limite: 3 },
    resgates: [],
  };
  mockRequisitar.mockReset().mockImplementation(async (caminho, opcoes) => {
    if (opcoes && mockFalhar)
      throw Object.assign(new ErroApi('Conflito', 409), { codigo: 'saldo_insuficiente' });
    if (opcoes?.metodo === 'POST' && caminho.endsWith('/recompensas')) {
      mockLoja.recompensas.unshift({
        id: 2,
        ...opcoes.corpo,
        estado: 'disponivel',
        imutavel: false,
      });
    } else if (caminho.endsWith('/resgates')) {
      mockLoja.saldoPontos -= 120;
      mockLoja.recompensas[0] = {
        ...mockLoja.recompensas[0],
        estado: 'resgatada',
        imutavel: true,
        resgateId: 9,
      };
      mockLoja.resgates = [
        {
          id: 9,
          titulo: 'Pausa sem culpa',
          custo: 120,
          estado: 'resgatado',
          resgatadoEm: '2026-10-19T12:00:00Z',
        },
      ];
    } else if (caminho.endsWith('/utilizar')) {
      mockLoja.recompensas[0].estado = 'utilizada';
      mockLoja.resgates[0].estado = 'utilizado';
    }
    return JSON.parse(JSON.stringify(mockLoja));
  });
});

async function abrir() {
  render(
    <LojaProvider>
      <NavigationContainer>
        <RootNavigator initialRouteName="Loja" />
      </NavigationContainer>
    </LojaProvider>,
  );
  await screen.findByText('300 pontos');
}

describe('loja integrada ao contrato da API', () => {
  it('cria uma recompensa e a exibe ao retornar à loja', async () => {
    await abrir();
    fireEvent.press(screen.getByLabelText('Adicionar recompensa'));
    fireEvent.changeText(screen.getByLabelText('Nome da recompensa'), 'Café especial');
    fireEvent.changeText(screen.getByLabelText('Descrição'), 'Celebrar o progresso');
    fireEvent.changeText(screen.getByLabelText('Custo em pontos'), '90');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Criar recompensa'));
    });
    expect(screen.getByText('Loja de recompensas')).toBeTruthy();
    expect(await screen.findByText('Café especial')).toBeTruthy();
    expect(mockRequisitar).toHaveBeenCalledWith('/api/usuarios/pessoa/loja/recompensas', {
      metodo: 'POST',
      corpo: { titulo: 'Café especial', descricao: 'Celebrar o progresso', custo: 90 },
    });
  });

  it('exibe custo e saldo antes do resgate e só envia após confirmar', async () => {
    await abrir();
    fireEvent.press(screen.getByLabelText('Pausa sem culpa, 120 pontos'));
    fireEvent.press(screen.getByLabelText('Resgatar recompensa'));
    expect(screen.getByText(/Seu saldo atual é 300 pontos/)).toBeTruthy();
    expect(
      mockRequisitar.mock.calls.filter(([, opcoes]) => opcoes?.metodo === 'POST'),
    ).toHaveLength(0);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Confirmar resgate'));
    });
    expect(await screen.findByText('180 pontos')).toBeTruthy();
    expect(screen.getByText('Resgatadas')).toBeTruthy();
  });

  it('exige confirmação de uso irreversível e permite cancelar sem enviar', async () => {
    mockLoja.recompensas[0] = {
      ...mockLoja.recompensas[0],
      estado: 'resgatada',
      imutavel: true,
      resgateId: 9,
    };
    mockLoja.resgates = [
      {
        id: 9,
        titulo: 'Pausa sem culpa',
        custo: 120,
        estado: 'resgatado',
        resgatadoEm: '2026-10-19T12:00:00Z',
      },
    ];
    await abrir();
    fireEvent.press(screen.getByLabelText('Pausa sem culpa, 120 pontos, Resgatada'));
    fireEvent.press(screen.getByLabelText('Utilizar recompensa'));
    expect(screen.getByText(/A utilização é irreversível/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Cancelar'));
    expect(mockRequisitar.mock.calls.some(([caminho]) => caminho.endsWith('/utilizar'))).toBe(
      false,
    );
    fireEvent.press(screen.getByLabelText('Utilizar recompensa'));
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Confirmar utilização'));
    });
    expect(await screen.findByText('Utilizadas')).toBeTruthy();
    expect(screen.queryByLabelText('Desfazer resgate')).toBeNull();
  });

  it('uma falha não debita localmente nem fecha a confirmação como sucesso', async () => {
    await abrir();
    mockFalhar = true;
    fireEvent.press(screen.getByLabelText('Pausa sem culpa, 120 pontos'));
    fireEvent.press(screen.getByLabelText('Resgatar recompensa'));
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Confirmar resgate'));
    });
    expect(
      await screen.findByText('Você ainda não possui pontos suficientes para este resgate.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Confirmar resgate')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Cancelar'));
    fireEvent.press(screen.getByLabelText('Fechar'));
    expect(screen.getByText('300 pontos')).toBeTruthy();
    expect(screen.queryByText('Resgatadas')).toBeNull();
  });

  it('bloqueia o quarto resgate de proteção e apresenta o motivo', async () => {
    mockLoja.protecao.quantidade = 3;
    await abrir();
    fireEvent.press(
      screen.getByLabelText('Proteção de sequência, 100 pontos, 3 de 3 proteções no inventário'),
    );
    expect(screen.getByText('Limite de três proteções atingido.')).toBeTruthy();
    expect(screen.getByLabelText('Resgatar recompensa')).toBeDisabled();
  });

  it('trata falha de carregamento e permite tentar novamente', async () => {
    mockRequisitar.mockRejectedValueOnce(new Error('Sem rede'));
    render(
      <LojaProvider>
        <NavigationContainer>
          <RootNavigator initialRouteName="Loja" />
        </NavigationContainer>
      </LojaProvider>,
    );
    await screen.findByText(
      'Não foi possível carregar a loja. Confira a conexão e tente novamente.',
    );
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Atualizar loja'));
    });
    await waitFor(() => expect(screen.getByText('300 pontos')).toBeTruthy());
  });
});
