import { criarServicoExtratoPontos } from './extratoPontos';
import { movimentoDeTeste, paginaExtratoDeTeste } from '../testUtils/extratoPontos';

it('usa exclusivamente o cliente autenticado e combina filtros com cursor escapado', async () => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(paginaExtratoDeTeste());
  const servico = criarServicoExtratoPontos({ usuarioId: 'conta', requisitarAutenticado });
  await servico.listar({ natureza: 'usados', inicio: '2026-10-01', fim: '2026-10-31' }, 'a+b/c=');
  const url = new URL(requisitarAutenticado.mock.calls[0][0], 'https://teste.local');
  expect(url.pathname).toBe('/api/usuarios/conta/extrato');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    natureza: 'usados',
    limite: '20',
    inicio: '2026-10-01',
    fim: '2026-10-31',
    cursor: 'a+b/c=',
  });
});
it.each([
  { versaoContrato: '2' },
  { saldoAtual: null },
  { fusoHorario: 'inexistente' },
  { movimentos: [movimentoDeTeste(), movimentoDeTeste()] },
  { movimentos: [movimentoDeTeste({ quantidade: '30' })] },
  { movimentos: [movimentoDeTeste({ saldoApos: undefined })] },
  { movimentos: [movimentoDeTeste({ tipo: 'desconhecido' })] },
])('rejeita contrato incompatível sem inventar valores: %j', async (dados) => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(paginaExtratoDeTeste(dados));
  await expect(
    criarServicoExtratoPontos({ usuarioId: 'a', requisitarAutenticado }).listar({}),
  ).rejects.toThrow();
});
it('preserva saldo ausente, zero e devolução sem mudar o tipo', async () => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(
    paginaExtratoDeTeste({
      movimentos: [
        movimentoDeTeste({ id: 1, saldoApos: null }),
        movimentoDeTeste({ id: 2, saldoApos: 0, tipo: 'estornoResgate' }),
      ],
    }),
  );
  const p = await criarServicoExtratoPontos({ usuarioId: 'a', requisitarAutenticado }).listar({
    todoHistorico: true,
  });
  expect(p.movimentos[0].saldoApos).toBeNull();
  expect(p.movimentos[1].saldoApos).toBe(0);
  expect(p.movimentos[1].tipo).toBe('estornoResgate');
});
it('rejeita detalhe de outro id e propaga expiração da sessão', async () => {
  const requisitarAutenticado = jest.fn().mockResolvedValue({
    versaoContrato: '1.0.0',
    fusoHorario: 'UTC',
    movimento: movimentoDeTeste(),
  });
  const s = criarServicoExtratoPontos({ usuarioId: 'a', requisitarAutenticado });
  await expect(s.consultar(99)).rejects.toThrow();
  requisitarAutenticado.mockRejectedValue(Object.assign(new Error('Sessão'), { status: 401 }));
  await expect(s.listar({})).rejects.toMatchObject({ status: 401 });
});
