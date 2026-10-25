import { AppState } from 'react-native';
import { act, render, waitFor } from '@testing-library/react-native';
import { SincronizadorDeFuso } from './SincronizadorDeFuso';

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
