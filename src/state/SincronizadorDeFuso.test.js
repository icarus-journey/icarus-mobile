import { AppState } from 'react-native';
import { act, render, renderHook, waitFor } from '@testing-library/react-native';
import { SincronizadorDeFuso, useSincronizacaoFuso } from './SincronizadorDeFuso';
import { useJornada } from '../hooks/useJornada';
import { jornadaDeTeste } from '../testUtils/dadosJornada';

const mockRequisitar = jest.fn();
jest.mock('./SessaoContext', () => ({
  useSessao: () => ({ sessao: { usuarioId: 'pessoa' }, requisitarAutenticado: mockRequisitar }),
}));
it('envia o fuso IANA, repete após falha e atualiza ao mudar o fuso do dispositivo', async () => {
  let fuso = 'America/Sao_Paulo';
  const formatador = jest
    .spyOn(Intl, 'DateTimeFormat')
    .mockImplementation(() => ({ resolvedOptions: () => ({ timeZone: fuso }) }));
  let aoMudar;
  const remover = jest.fn();
  const assinatura = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_evento, funcao) => {
      aoMudar = funcao;
      return { remove: remover };
    });
  mockRequisitar.mockRejectedValueOnce(new Error('Sem rede')).mockResolvedValue({});
  const resultado = render(<SincronizadorDeFuso />);
  await waitFor(() => expect(mockRequisitar).toHaveBeenCalledTimes(1));
  await act(async () => {
    aoMudar('active');
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/pessoa/fuso', {
    metodo: 'PUT',
    corpo: { fusoHorario: 'America/Sao_Paulo' },
  });
  await act(async () => {
    aoMudar('active');
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  fuso = 'Europe/Lisbon';
  await act(async () => {
    aoMudar('active');
  });
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/pessoa/fuso', {
    metodo: 'PUT',
    corpo: { fusoHorario: 'Europe/Lisbon' },
  });
  resultado.unmount();
  expect(remover).toHaveBeenCalled();
  assinatura.mockRestore();
  formatador.mockRestore();
});

it('voltar ao fuso inicial durante uma alteração pendente preserva o último fuso do dispositivo', async () => {
  let fuso = 'America/Sao_Paulo',
    liberar;
  const formatador = jest
    .spyOn(Intl, 'DateTimeFormat')
    .mockImplementation(() => ({ resolvedOptions: () => ({ timeZone: fuso }) }));
  const assinatura = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  mockRequisitar
    .mockReset()
    .mockResolvedValueOnce({})
    .mockReturnValueOnce(new Promise((resolver) => (liberar = resolver)))
    .mockResolvedValue({});
  const { result, unmount } = renderHook(useSincronizacaoFuso, {
    wrapper: ({ children }) => <SincronizadorDeFuso>{children}</SincronizadorDeFuso>,
  });
  await act(async () => {});
  fuso = 'Europe/Lisbon';
  let ida, volta;
  act(() => {
    ida = result.current();
  });
  fuso = 'America/Sao_Paulo';
  act(() => {
    volta = result.current();
  });
  await act(async () => {
    liberar({});
    await ida;
    await volta;
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(3);
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/pessoa/fuso', {
    metodo: 'PUT',
    corpo: { fusoHorario: 'America/Sao_Paulo' },
  });
  unmount();
  assinatura.mockRestore();
  formatador.mockRestore();
});

it('uma mudança de fuso durante a sincronização aguarda e confirma o valor mais recente', async () => {
  let fuso = 'America/Sao_Paulo',
    liberar;
  const formatador = jest
    .spyOn(Intl, 'DateTimeFormat')
    .mockImplementation(() => ({ resolvedOptions: () => ({ timeZone: fuso }) }));
  const assinatura = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  mockRequisitar
    .mockReset()
    .mockReturnValueOnce(new Promise((resolver) => (liberar = resolver)))
    .mockResolvedValue({});
  const { result, unmount } = renderHook(useSincronizacaoFuso, {
    wrapper: ({ children }) => <SincronizadorDeFuso>{children}</SincronizadorDeFuso>,
  });
  fuso = 'Europe/Lisbon';
  let nova;
  act(() => {
    nova = result.current();
  });
  await act(async () => {
    liberar({});
    await nova;
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(2);
  expect(mockRequisitar).toHaveBeenLastCalledWith('/api/usuarios/pessoa/fuso', {
    metodo: 'PUT',
    corpo: { fusoHorario: 'Europe/Lisbon' },
  });
  unmount();
  assinatura.mockRestore();
  formatador.mockRestore();
});

it('a jornada aguarda o fuso pendente sem duplicar a sincronização nem mostrar indisponibilidade transitória', async () => {
  let liberar;
  const fuso = new Promise((resolver) => (liberar = resolver));
  mockRequisitar
    .mockReset()
    .mockImplementation((rota) =>
      rota.endsWith('/fuso') ? fuso : Promise.resolve(jornadaDeTeste()),
    );
  const assinatura = jest
    .spyOn(AppState, 'addEventListener')
    .mockReturnValue({ remove: jest.fn() });
  const navigation = { isFocused: () => true, addListener: () => jest.fn() };
  const { result, unmount } = renderHook(() => useJornada(navigation), {
    wrapper: ({ children }) => <SincronizadorDeFuso>{children}</SincronizadorDeFuso>,
  });
  expect(mockRequisitar).toHaveBeenCalledTimes(1);
  expect(mockRequisitar.mock.calls[0][0]).toMatch(/\/fuso$/);
  expect(result.current.carregando).toBe(true);
  await act(async () => liberar({}));
  await waitFor(() => expect(result.current.dados?.sequencia.diasAtuais).toBe(3));
  expect(mockRequisitar.mock.calls.filter(([rota]) => rota.endsWith('/fuso'))).toHaveLength(1);
  expect(result.current.erro).toBe('');
  unmount();
  assinatura.mockRestore();
});
