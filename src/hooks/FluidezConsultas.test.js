import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useJornada } from './useJornada';
import { useReferenciasPublicas } from './useReferenciasPublicas';
import { useRelatorioSemanal } from './useRelatorioSemanal';
import { useHistoricoMissoes } from './useHistoricoMissoes';
import { useExtratoPontos } from './useExtratoPontos';
import { useHistoricoRelatorios } from './useHistoricoRelatorios';
import { jornadaDeTeste } from '../testUtils/dadosJornada';
import { relatorioDeTeste, progressoDeTeste } from '../testUtils/dadosAnaliticos';
import { useProgresso } from './useProgresso';
import { SincronizadorDeFuso } from '../state/SincronizadorDeFuso';
import { paginaHistoricoDeTeste } from '../testUtils/historicoMissoes';
import { paginaExtratoDeTeste } from '../testUtils/extratoPontos';
import { paginaRelatoriosDeTeste } from '../testUtils/historicoRelatorios';

const mockRequisitar = jest.fn();
let mockUsuario = 'titular';
const mockFocos = new Set();
let mockEmFoco = true;
jest.mock('../state/SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: mockUsuario }, requisitarAutenticado: mockRequisitar }),
}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) => {
    require('react').useEffect(() => {
      const foco = { callback, cancelar: mockEmFoco ? callback() : null };
      mockFocos.add(foco);
      return () => {
        foco.cancelar?.();
        mockFocos.delete(foco);
      };
    }, [callback]);
  },
}));

function desfocar() {
  mockEmFoco = false;
  mockFocos.forEach((foco) => foco.cancelar?.());
}
function focar() {
  mockEmFoco = true;
  mockFocos.forEach((foco) => (foco.cancelar = foco.callback()));
}
function pendente() {
  let resolver;
  const promessa = new Promise((r) => (resolver = r));
  return { promessa, resolver: (valor) => resolver(valor) };
}
beforeEach(() => {
  mockEmFoco = true;
  mockUsuario = 'titular';
  mockRequisitar.mockReset();
});

it('não duplica a jornada quando foco se repete durante uma consulta pendente', async () => {
  const consulta = pendente();
  mockRequisitar.mockReturnValue(consulta.promessa);
  const eventos = {};
  const navigation = {
    isFocused: () => true,
    addListener: (tipo, callback) => {
      eventos[tipo] = callback;
      return jest.fn();
    },
  };
  const { result } = renderHook(() => useJornada(navigation));
  act(() => {
    eventos.focus();
    eventos.focus();
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  await act(async () => consulta.resolver(jornadaDeTeste()));
  expect(result.current.dados.saldoPontos).toBe(1270);
});

it('mantém os indicadores visíveis durante atualização da mesma conta', async () => {
  mockRequisitar.mockResolvedValueOnce(jornadaDeTeste());
  const eventos = {};
  const navigation = {
    isFocused: () => true,
    addListener: (tipo, callback) => {
      eventos[tipo] = callback;
      return jest.fn();
    },
  };
  const { result } = renderHook(() => useJornada(navigation));
  await waitFor(() => expect(result.current.dados?.saldoPontos).toBe(1270));
  const consulta = pendente();
  mockRequisitar.mockReturnValue(consulta.promessa);
  act(() => eventos.focus());
  expect(result.current.dados?.saldoPontos).toBe(1270);
  await act(async () => consulta.resolver(jornadaDeTeste({ saldoPontos: 1300 })));
  expect(result.current.dados.saldoPontos).toBe(1300);
});

it('consulta o relatório persistido sem solicitar geração novamente ao abrir', async () => {
  mockRequisitar.mockResolvedValue(relatorioDeTeste());
  const { result } = renderHook(() => useRelatorioSemanal());
  await waitFor(() => expect(result.current.dados?.estado).toBe('disponivel'));
  expect(mockRequisitar.mock.calls.every(([, opcoes]) => opcoes?.metodo !== 'POST')).toBe(true);
});

it('não consulta referências públicas quando a aba está oculta', () => {
  mockRequisitar.mockResolvedValue({ referencias: [] });
  renderHook(() => useReferenciasPublicas(null, 'todos', false));
  expect(mockRequisitar).not.toHaveBeenCalled();
});

it('trocas rápidas de período cancelam leituras antigas, inclusive ao voltar ao filtro inicial', async () => {
  const primeira = pendente(),
    mes = pendente(),
    ultima = pendente();
  mockRequisitar
    .mockReturnValueOnce(primeira.promessa)
    .mockReturnValueOnce(mes.promessa)
    .mockReturnValueOnce(ultima.promessa);
  const { result, rerender } = renderHook(({ periodo }) => useProgresso(periodo), {
    initialProps: { periodo: 'semanaAnterior' },
  });
  const sinal = mockRequisitar.mock.calls[0][1].signal;
  rerender({ periodo: 'mesAnterior' });
  expect(sinal.aborted).toBe(true);
  rerender({ periodo: 'semanaAnterior' });
  await act(async () =>
    ultima.resolver({ ...progressoDeTeste(), mensagem: 'Leitura mais recente' }),
  );
  await act(async () => {
    primeira.resolver(progressoDeTeste());
    mes.resolver(progressoDeTeste());
  });
  expect(result.current.dados.mensagem).toBe('Leitura mais recente');
});

it('atualização repetida compartilha a consulta em andamento', async () => {
  const consulta = pendente();
  mockRequisitar.mockReturnValue(consulta.promessa);
  const { result } = renderHook(() => useProgresso('semanaAnterior'));
  act(() => {
    result.current.carregar();
    result.current.carregar();
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  await act(async () => consulta.resolver(progressoDeTeste()));
  expect(result.current.dados).toBeTruthy();
});

it('retomadas repetidas atualizam o período sem apagar o resultado ou duplicar consultas', async () => {
  let evento;
  const assinatura = jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    evento = callback;
    return { remove: jest.fn() };
  });
  try {
    mockRequisitar.mockResolvedValueOnce(progressoDeTeste());
    const { result, unmount } = renderHook(() => useProgresso('semanaAnterior'));
    await waitFor(() => expect(result.current.dados).toBeTruthy());
    const consulta = pendente();
    mockRequisitar.mockReturnValue(consulta.promessa);
    act(() => {
      evento('active');
      evento('active');
    });
    expect(result.current.dados).toBeTruthy();
    expect(mockRequisitar).toHaveBeenCalledTimes(2);
    await act(async () =>
      consulta.resolver({ ...progressoDeTeste(), mensagem: 'Atualizado na retomada' }),
    );
    expect(result.current.dados.mensagem).toBe('Atualizado na retomada');
    unmount();
  } finally {
    assinatura.mockRestore();
  }
});

it('progresso e relatório aguardam a mesma sincronização de fuso antes de consultar', async () => {
  const fuso = pendente();
  const assinatura = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  try {
    mockRequisitar.mockImplementation((rota) =>
      rota.endsWith('/fuso')
        ? fuso.promessa
        : Promise.resolve(rota.includes('/progresso?') ? progressoDeTeste() : relatorioDeTeste()),
    );
    const { result, unmount } = renderHook(
      () => ({ progresso: useProgresso('semanaAnterior'), relatorio: useRelatorioSemanal() }),
      { wrapper: ({ children }) => <SincronizadorDeFuso>{children}</SincronizadorDeFuso> },
    );
    expect(mockRequisitar).toHaveBeenCalledTimes(1);
    await act(async () => fuso.resolver({}));
    expect(result.current.progresso.dados).toBeTruthy();
    expect(result.current.relatorio.dados.estado).toBe('disponivel');
    expect(mockRequisitar.mock.calls.filter(([rota]) => rota.endsWith('/fuso'))).toHaveLength(1);
    unmount();
  } finally {
    assinatura.mockRestore();
  }
});

it('solicita um relatório ausente uma vez e para a consulta periódica ao sair da tela', async () => {
  jest.useFakeTimers();
  try {
    const base = relatorioDeTeste();
    mockRequisitar
      .mockResolvedValueOnce({
        estado: 'ausente',
        periodo: base.periodo,
        mensagem: 'Ainda não solicitado.',
      })
      .mockResolvedValueOnce({
        estado: 'processando',
        periodo: base.periodo,
        mensagem: 'Preparando.',
      })
      .mockResolvedValue(base);
    const { result, unmount } = renderHook(() => useRelatorioSemanal());
    await act(async () => {});
    expect(result.current.dados.estado).toBe('processando');
    expect(
      mockRequisitar.mock.calls.filter(([, opcoes]) => opcoes?.metodo === 'POST'),
    ).toHaveLength(1);
    await act(async () => jest.advanceTimersByTime(2500));
    expect(result.current.dados.estado).toBe('disponivel');
    unmount();
    await act(async () => jest.advanceTimersByTime(10000));
    expect(mockRequisitar).toHaveBeenCalledTimes(3);
  } finally {
    jest.useRealTimers();
  }
});

const filtrosMissoes = { estado: 'todos' };
const filtrosExtrato = { natureza: 'todos' };
it.each([
  ['missões', () => useHistoricoMissoes({ estado: 'todos' }), paginaHistoricoDeTeste],
  ['extrato', () => useExtratoPontos({ natureza: 'todos' }), paginaExtratoDeTeste],
])(
  'filtros equivalentes de %s não reiniciam a consulta a cada renderização',
  async (_, usarHook, pagina) => {
    mockRequisitar.mockResolvedValue(pagina());
    const { result, rerender } = renderHook(usarHook);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    rerender();
    rerender();
    expect(mockRequisitar).toHaveBeenCalledTimes(1);
  },
);

it.each([
  ['missões', () => useHistoricoMissoes(filtrosMissoes), paginaHistoricoDeTeste],
  ['extrato', () => useExtratoPontos(filtrosExtrato), paginaExtratoDeTeste],
  ['relatórios', () => useHistoricoRelatorios(), paginaRelatoriosDeTeste],
])('recupera %s ao voltar durante uma atualização interrompida', async (_, usarHook, pagina) => {
  const consulta = pendente();
  mockRequisitar.mockResolvedValueOnce(pagina()).mockReturnValueOnce(consulta.promessa);
  const { result } = renderHook(usarHook);
  await waitFor(() => expect(result.current.carregando).toBe(false));
  act(() => {
    result.current.atualizar();
  });
  act(desfocar);
  mockRequisitar.mockResolvedValue(pagina());
  act(focar);
  await waitFor(() => expect(result.current.carregando).toBe(false));
  await act(async () => consulta.resolver(pagina()));
  expect(result.current.dados).toBeTruthy();
});
