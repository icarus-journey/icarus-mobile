import { criarApi } from './api';
import { consultarMissao, atualizarMissao } from './missoes';

function cliente(resposta) {
  const executarFetch = jest.fn(async () => resposta);
  const api = criarApi({ urlBase: 'http://api.test', executarFetch });
  return {
    executarFetch,
    requisitarAutenticado: (rota, opcoes) => api(rota, { ...opcoes, token: 'sessao-atual' }),
  };
}

it('lê a configuração e a versão por HTTP autenticado sem inferir dias ou datas', async () => {
  const dados = {
    versaoContrato: '1.1.0',
    versao: 'opaca',
    configuracaoRecorrencia: { tipo: 'mensal', diaDoMes: 31, dataFim: null },
  };
  const c = cliente({ ok: true, status: 200, json: async () => dados });
  await expect(consultarMissao({ usuarioId: 'titular', missaoId: 4, ...c })).resolves.toEqual(
    dados,
  );
  expect(c.executarFetch).toHaveBeenCalledWith(
    'http://api.test/api/usuarios/titular/missoes/4',
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({ Authorization: 'Bearer sessao-atual' }),
    }),
  );
});

it('envia o PATCH versionado e preserva nulos explícitos para remover o fim da repetição', async () => {
  const c = cliente({ ok: true, status: 200, json: async () => ({ versao: 'nova' }) });
  const dados = {
    titulo: 'Estudar',
    recorrencia: 'diaria',
    dataFimRecorrencia: null,
    diasSemana: null,
    versaoEsperada: 'opaca',
  };
  await atualizarMissao({ usuarioId: 'titular', missaoId: 4, dados, ...c });
  expect(c.executarFetch).toHaveBeenCalledWith(
    expect.stringContaining('/missoes/4'),
    expect.objectContaining({ method: 'PATCH', body: JSON.stringify(dados) }),
  );
});

it.each([401, 404, 409])(
  'mantém HTTP %s para tratamento de sessão, ausência ou conflito',
  async (status) => {
    const c = cliente({ ok: false, status, json: async () => ({ codigo: 'dados_atualizados' }) });
    await expect(
      consultarMissao({ usuarioId: 'titular', missaoId: 4, ...c }),
    ).rejects.toMatchObject({ status, codigo: 'dados_atualizados' });
  },
);
