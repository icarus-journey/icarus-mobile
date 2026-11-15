import { criarServicoProgressoCampanha, mensagemProgressoCampanha } from './progressoCampanha';
import { evolucaoDaMetaDeTeste } from '../testUtils/dadosAnaliticos';

it('consome evolução 1.1.0 calculada na API e rejeita extensão incompleta', async () => {
  const dados = evolucaoDaMetaDeTeste();
  const requisitarAutenticado = jest
    .fn()
    .mockResolvedValueOnce(dados)
    .mockResolvedValueOnce({ ...dados, cenario: null });
  const servico = criarServicoProgressoCampanha({
    usuarioId: 'titular',
    campanhaId: 12,
    requisitarAutenticado,
  });
  expect(await servico.consultar()).toEqual(dados);
  await expect(servico.consultar()).rejects.toThrow('Resposta de progresso indisponível.');
});

it('usa o cliente autenticado e envia somente os campos do registro', async () => {
  const requisitarAutenticado = jest.fn(async () => ({
    versaoContrato: '1.0.0',
    versao: 'v1',
    medicoes: [],
  }));
  const servico = criarServicoProgressoCampanha({
    usuarioId: 'titular',
    campanhaId: 7,
    requisitarAutenticado,
  });
  await servico.consultar();
  expect(requisitarAutenticado).toHaveBeenLastCalledWith(
    '/api/usuarios/titular/campanhas/7/progresso',
  );
  await servico.registrar({
    valorAtual: 3,
    versaoEsperada: 'v1',
    operacaoId: 'op',
    saldo: 999,
    registradaEm: 'ontem',
  });
  expect(requisitarAutenticado).toHaveBeenLastCalledWith(
    '/api/usuarios/titular/campanhas/7/progresso',
    {
      metodo: 'POST',
      corpo: { valorAtual: 3, versaoEsperada: 'v1', operacaoId: 'op' },
    },
  );
});

it('rejeita contrato inesperado e propaga indisponibilidade sem inventar histórico', async () => {
  const requisitarAutenticado = jest
    .fn()
    .mockResolvedValueOnce({})
    .mockRejectedValueOnce(new Error('Falha'));
  const servico = criarServicoProgressoCampanha({
    usuarioId: 'titular',
    campanhaId: 7,
    requisitarAutenticado,
  });
  await expect(servico.consultar()).rejects.toThrow();
  await expect(servico.consultar()).rejects.toThrow('Falha');
});

it.each([401, 404, 400, 409])('informa o estado HTTP %s em linguagem de usuário', (status) => {
  expect(mensagemProgressoCampanha({ status })).toEqual(expect.any(String));
  expect(mensagemProgressoCampanha({ status }).length).toBeGreaterThan(20);
});
