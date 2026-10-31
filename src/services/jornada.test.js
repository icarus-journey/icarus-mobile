import { consultarJornada } from './jornada';
import { jornadaDeTeste } from '../testUtils/dadosJornada';

it('consulta o resumo autenticado sem calcular saldo ou sequência no cliente', async () => {
  const dados = jornadaDeTeste();
  const requisitarAutenticado = jest.fn(async () => dados);
  expect(await consultarJornada({ usuarioId: 'titular', requisitarAutenticado })).toBe(dados);
  expect(requisitarAutenticado).toHaveBeenCalledWith('/api/usuarios/titular/jornada');
});

it.each([401, 404, 503])(
  'propaga HTTP %s sem transformar indisponibilidade em zero',
  async (status) => {
    await expect(
      consultarJornada({
        usuarioId: 'titular',
        requisitarAutenticado: jest.fn().mockRejectedValue({ status }),
      }),
    ).rejects.toMatchObject({ status });
  },
);

it.each([
  null,
  { saldoPontos: 100 },
  jornadaDeTeste({ versaoContrato: '2.0.0' }),
  jornadaDeTeste({ saldoPontos: -1 }),
  jornadaDeTeste({ saldoPontos: Number.MAX_SAFE_INTEGER + 1 }),
  jornadaDeTeste({ sequencia: { estado: 'disponivel', diasAtuais: 0, dias: [] } }),
])('rejeita contrato incompatível ou incompleto', async (dados) => {
  await expect(
    consultarJornada({ usuarioId: 'titular', requisitarAutenticado: async () => dados }),
  ).rejects.toThrow('indisponível');
});

it('preserva ausência, fuso não informado e dias de calendário desconhecidos', async () => {
  const base = jornadaDeTeste();
  const casos = [
    jornadaDeTeste({
      sequencia: {
        ...base.sequencia,
        estado: 'historico_incompleto',
        diasAtuais: null,
        realizouHoje: null,
        dias: base.sequencia.dias.map((dia) => ({ ...dia, realizada: null })),
      },
    }),
    jornadaDeTeste({
      sequencia: {
        estado: 'fuso_nao_informado',
        diasAtuais: null,
        realizouHoje: null,
        hoje: null,
        fusoHorario: null,
        dias: [],
      },
    }),
  ];
  for (const dados of casos)
    expect(
      await consultarJornada({ usuarioId: 'titular', requisitarAutenticado: async () => dados }),
    ).toBe(dados);
});
