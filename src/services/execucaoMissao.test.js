import { criarApi } from './api';
import { concluirMissao } from './missoes';

it.each([40, undefined])(
  'conclui a execução apresentada (%s), mantendo compatibilidade sem corpo',
  async (ocorrenciaId) => {
    const executarFetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ repetida: true, pontuacaoCreditada: 30 }),
    }));
    const api = criarApi({ urlBase: 'http://api.test', executarFetch });
    const requisitarAutenticado = (rota, opcoes) => api(rota, { ...opcoes, token: 'sessao-atual' });
    await expect(
      concluirMissao({ usuarioId: 'titular', missaoId: 4, ocorrenciaId, requisitarAutenticado }),
    ).resolves.toMatchObject({ repetida: true });
    expect(executarFetch).toHaveBeenCalledWith(
      'http://api.test/api/usuarios/titular/missoes/4/concluir',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer sessao-atual' }),
      }),
    );
    const opcoes = executarFetch.mock.calls[0][1];
    expect(opcoes.body).toBe(ocorrenciaId == null ? undefined : JSON.stringify({ ocorrenciaId }));
  },
);

it('envia o momento civil e a execução esperada por HTTP autenticado', async () => {
  const executarFetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      realizadaEm: '2026-10-29T23:00:00Z',
      concluidaEm: '2026-10-31T01:10:00Z',
    }),
  }));
  const api = criarApi({ urlBase: 'http://api.test', executarFetch });
  const realizacao = {
    dataRealizacao: '2026-10-29',
    horarioRealizacao: '20:00:00',
    dataPrevistaEsperada: '2026-10-30',
  };
  const resposta = await concluirMissao({
    usuarioId: 'titular',
    missaoId: 4,
    ocorrenciaId: 40,
    realizacao,
    requisitarAutenticado: (rota, opcoes) => api(rota, { ...opcoes, token: 'sessao-atual' }),
  });
  expect(executarFetch).toHaveBeenCalledWith(
    expect.stringContaining('/missoes/4/concluir'),
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ ocorrenciaId: 40, ...realizacao }),
      headers: expect.objectContaining({ Authorization: 'Bearer sessao-atual' }),
    }),
  );
  expect(resposta.realizadaEm).not.toBe(resposta.concluidaEm);
});
