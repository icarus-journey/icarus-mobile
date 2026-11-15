import { criarServicoDiario, mensagemDiario } from './diario';

it('usa somente a API autenticada com o titular e os campos permitidos', async () => {
  const retorno = { id: 7, tipo: 'reflexao', dataRegistro: '2026-10-20', texto: 'Texto' };
  const requisitar = jest
    .fn()
    .mockResolvedValueOnce([retorno])
    .mockResolvedValueOnce(retorno)
    .mockResolvedValueOnce(retorno)
    .mockResolvedValueOnce(null);
  const servico = criarServicoDiario({ usuarioId: 'pessoa-a', requisitarAutenticado: requisitar });
  expect((await servico.listar())[0].tipo).toBe('REFLEXAO');
  const entrada = {
    tipo: 'REFLEXAO',
    dataRegistro: '2026-10-20',
    texto: '  Texto  ',
    usuarioId: 'pessoa-b',
    audio: 'arquivo-local',
  };
  await servico.criar(entrada);
  await servico.atualizar(7, entrada);
  await servico.excluir(7);
  expect(requisitar.mock.calls).toEqual([
    ['/api/usuarios/pessoa-a/diario'],
    [
      '/api/usuarios/pessoa-a/diario',
      {
        metodo: 'POST',
        corpo: { tipo: 'reflexao', dataRegistro: '2026-10-20', texto: 'Texto' },
      },
    ],
    [
      '/api/usuarios/pessoa-a/diario/7',
      { metodo: 'PATCH', corpo: { tipo: 'reflexao', dataRegistro: '2026-10-20', texto: 'Texto' } },
    ],
    ['/api/usuarios/pessoa-a/diario/7', { metodo: 'DELETE' }],
  ]);
});

it('propaga falhas e recusa uma lista inválida em vez de simular histórico vazio', async () => {
  const requisitar = jest.fn().mockResolvedValueOnce({}).mockRejectedValueOnce({ status: 401 });
  const servico = criarServicoDiario({ usuarioId: 'pessoa-a', requisitarAutenticado: requisitar });
  await expect(servico.listar()).rejects.toThrow();
  await expect(servico.listar()).rejects.toEqual({ status: 401 });
});

it.each([400, 401, 404, 409, 500])(
  'traduz falha %s para uma mensagem própria do diário',
  (status) => {
    expect(mensagemDiario({ status })).toBeTruthy();
    expect(mensagemDiario({ status })).not.toContain('e-mail');
  },
);
