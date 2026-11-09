import { criarServicoHistoricoRelatorios } from './historicoRelatorios';
import {
  detalheRelatorioDeTeste,
  paginaRelatoriosDeTeste,
  resumoRelatorioDeTeste,
} from '../testUtils/historicoRelatorios';
it('consulta somente pelo cliente autenticado, com cursor escapado e detalhe por id', async () => {
  const requisitarAutenticado = jest
    .fn()
    .mockResolvedValueOnce(paginaRelatoriosDeTeste())
    .mockResolvedValueOnce(detalheRelatorioDeTeste());
  const s = criarServicoHistoricoRelatorios({ usuarioId: 'a', requisitarAutenticado });
  await s.listar('a+b/c=');
  await s.consultar(1);
  const url = new URL(requisitarAutenticado.mock.calls[0][0], 'https://teste.local');
  expect(url.pathname).toBe('/api/usuarios/a/relatorios/semanais');
  expect(url.searchParams.get('cursor')).toBe('a+b/c=');
  expect(requisitarAutenticado).toHaveBeenLastCalledWith('/api/usuarios/a/relatorios/semanais/1');
  expect(requisitarAutenticado.mock.calls.every(([, opcoes]) => opcoes == null)).toBe(true);
});
it.each([
  { versaoContrato: '2' },
  { relatorios: [resumoRelatorioDeTeste(), resumoRelatorioDeTeste()] },
  { relatorios: [resumoRelatorioDeTeste({ concluidas: '2' })] },
  {
    relatorios: [
      resumoRelatorioDeTeste({
        periodo: { inicio: '2026-02-31', fim: '2026-03-07', fusoHorario: null },
      }),
    ],
  },
])('rejeita resposta de lista incompatível sem preencher ausências: %j', async (dados) => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(paginaRelatoriosDeTeste(dados));
  await expect(
    criarServicoHistoricoRelatorios({ usuarioId: 'a', requisitarAutenticado }).listar(),
  ).rejects.toThrow();
});
it('mantém fuso/comparação ausentes e aceita zero registrado sem converter ausência em zero', async () => {
  const dados = detalheRelatorioDeTeste();
  dados.resumo.periodo.fusoHorario = null;
  dados.resumo.concluidas = 0;
  dados.relatorio.indicadores.concluidas = 0;
  const requisitarAutenticado = jest.fn().mockResolvedValue(dados);
  const r = await criarServicoHistoricoRelatorios({
    usuarioId: 'a',
    requisitarAutenticado,
  }).consultar(1);
  expect(r.resumo.periodo.fusoHorario).toBeNull();
  expect(r.resumo.planejamento).toBeNull();
  expect(r.resumo.concluidas).toBe(0);
});
it('não exibe detalhe de outro id ou fontes atuais no lugar do que não foi preservado', async () => {
  const requisitarAutenticado = jest.fn().mockResolvedValue(detalheRelatorioDeTeste());
  const s = criarServicoHistoricoRelatorios({ usuarioId: 'a', requisitarAutenticado });
  await expect(s.consultar(2)).rejects.toThrow();
  requisitarAutenticado.mockResolvedValue(
    detalheRelatorioDeTeste({ disponibilidadeReferencias: 'gold_atual' }),
  );
  await expect(s.consultar(1)).rejects.toThrow();
});
it('propaga expiração e falha de persistência sem tratá-las como lista vazia', async () => {
  const requisitarAutenticado = jest
    .fn()
    .mockRejectedValue(Object.assign(new Error('Sessão'), { status: 401 }));
  const s = criarServicoHistoricoRelatorios({ usuarioId: 'a', requisitarAutenticado });
  await expect(s.listar()).rejects.toMatchObject({ status: 401 });
  requisitarAutenticado.mockRejectedValue(Object.assign(new Error('Registro'), { status: 503 }));
  await expect(s.consultar(1)).rejects.toMatchObject({ status: 503 });
});

it('aceita orientação ausente só no snapshot novo e preserva compatibilidade do histórico', async () => {
  const d = detalheRelatorioDeTeste();
  d.relatorio.versaoIndicadores = '1.2.0';
  d.relatorio.texto.proximoAjuste = null;
  const requisitarAutenticado = jest.fn(async () => d);
  const servico = criarServicoHistoricoRelatorios({ usuarioId: 'a', requisitarAutenticado });
  expect((await servico.consultar(1)).relatorio.texto.proximoAjuste).toBeNull();
  d.relatorio.versaoIndicadores = '1.1.0';
  await expect(servico.consultar(1)).rejects.toThrow('Relatório indisponível.');
});
