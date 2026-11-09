import { criarServicoHistoricoMissoes } from './historicoMissoes';
import { paginaHistoricoDeTeste, registroHistoricoDeTeste } from '../testUtils/historicoMissoes';
it('usa somente o cliente autenticado, com filtros e cursor codificados', async () => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(paginaHistoricoDeTeste());
  const s = criarServicoHistoricoMissoes({ usuarioId: 'pessoa', requisitarAutenticado });
  await s.listar(
    { estado: 'feita', inicio: '2026-10-01', fim: '2026-10-31', campanhaId: 7 },
    'a+b/c=',
  );
  expect(requisitarAutenticado).toHaveBeenCalledWith(
    '/api/usuarios/pessoa/historico/missoes?estado=feita&limite=20&inicio=2026-10-01&fim=2026-10-31&campanhaId=7&cursor=a%2Bb%2Fc%3D',
  );
});
it.each([
  [
    'versão incompatível',
    (r) => {
      r.versaoContrato = '2.0.0';
    },
  ],
  [
    'crédito inválido',
    (r) => {
      r.registros[0].pontosRecebidos = -1;
    },
  ],
  [
    'estado desconhecido',
    (r) => {
      r.registros[0].estado = 'fantasia';
    },
  ],
  [
    'id repetido',
    (r) => {
      r.registros.push(r.registros[0]);
    },
  ],
])('recusa %s', async (_, alterar) => {
  const r = paginaHistoricoDeTeste();
  alterar(r);
  const s = criarServicoHistoricoMissoes({
    usuarioId: 'a',
    requisitarAutenticado: jest.fn().mockResolvedValue(r),
  });
  await expect(s.listar({})).rejects.toThrow();
});
it('aceita ausência de pontos/realização e valida a identidade do detalhe', async () => {
  const r = registroHistoricoDeTeste({
    pontosRecebidos: null,
    realizadaEm: null,
    fusoHorarioRealizacao: null,
  });
  const requisitarAutenticado = jest
    .fn()
    .mockResolvedValue({ versaoContrato: '1.0.0', fusoHorario: 'UTC', registro: r });
  const s = criarServicoHistoricoMissoes({ usuarioId: 'a', requisitarAutenticado });
  expect((await s.consultar(12)).registro.pontosRecebidos).toBeNull();
  await expect(s.consultar(13)).rejects.toThrow();
});
it('campanhas removidas continuam disponíveis como filtro, sem aceitar payload inválido', async () => {
  const requisitarAutenticado = jest
    .fn()
    .mockResolvedValue([{ id: 7, titulo: 'Curso', removida: true }]);
  const s = criarServicoHistoricoMissoes({ usuarioId: 'a', requisitarAutenticado });
  expect((await s.campanhas())[0].removida).toBe(true);
  requisitarAutenticado.mockResolvedValue([{ id: 7, titulo: 'Curso' }]);
  await expect(s.campanhas()).rejects.toThrow();
});
