import { criarApi } from './api';
import { excluirEpico } from './epicos';
import { excluirCampanha } from './campanhas';
import { excluirMissao } from './missoes';

it.each([
  ['epicos', excluirEpico],
  ['campanhas', excluirCampanha],
  ['missoes', excluirMissao],
])('consome DELETE autenticado sem corpo e aceita 204 em %s', async (rota, excluir) => {
  const executarFetch = jest.fn(async () => ({ ok: true, status: 204 }));
  const api = criarApi({ urlBase: 'http://api.test', executarFetch });
  const requisitarAutenticado = (caminho, opcoes) => api(caminho, { ...opcoes, token: 'sessao' });
  await expect(
    excluir({ usuarioId: 'titular', id: 42, requisitarAutenticado }),
  ).resolves.toBeNull();
  expect(executarFetch).toHaveBeenCalledWith(
    `http://api.test/api/usuarios/titular/${rota}/42`,
    expect.objectContaining({
      method: 'DELETE',
      headers: expect.objectContaining({ Authorization: 'Bearer sessao' }),
    }),
  );
});

it.each([excluirEpico, excluirCampanha, excluirMissao])(
  'preserva a falha HTTP para tratamento de sessão/erro',
  async (excluir) => {
    const requisitarAutenticado = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Sessão expirada'), { status: 401 }));
    await expect(
      excluir({ usuarioId: 'titular', id: 42, requisitarAutenticado }),
    ).rejects.toMatchObject({ status: 401 });
  },
);
