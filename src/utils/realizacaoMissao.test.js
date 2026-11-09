import {
  aceitaRealizacaoInformada,
  camposDoMomento,
  formatarRealizacao,
  mascararHorario,
  mensagemErroRealizacao,
  paraRealizacaoNaApi,
  validarRealizacao,
} from './realizacaoMissao';

it('preenche campos no fuso da conta, sem converter a data pelo fuso do aparelho', () => {
  const agora = new Date('2026-10-31T01:10:30Z');
  expect(camposDoMomento('America/Sao_Paulo', agora)).toEqual({
    data: '30/10/2026',
    horario: '22:10',
  });
  expect(camposDoMomento('Asia/Tokyo', agora)).toEqual({ data: '31/10/2026', horario: '10:10' });
  expect(camposDoMomento('UTC', new Date('2026-10-31T00:00:00Z')).horario).toBe('00:00');
});
it('exibe o momento preservado e mantém ausência de legado sem inventar uma realização', () => {
  expect(formatarRealizacao('2026-10-31T01:10:00Z', 'America/Sao_Paulo')).toBe(
    '30/10/2026 às 22:10',
  );
  expect(formatarRealizacao(null, 'UTC')).toBeNull();
});
it('aceita data válida e constrói valores civis para a API resolver o fuso', () => {
  expect(validarRealizacao({ data: '29/02/2028', horario: '23:59' })).toEqual({});
  expect(paraRealizacaoNaApi({ data: '29/10/2026', horario: '20:00' })).toEqual({
    dataRealizacao: '2026-10-29',
    horarioRealizacao: '20:00:00',
  });
  expect(mascararHorario('20x00')).toBe('20:00');
});
it.each(['31/02/2026', '29/02/2027', '01/01/0000', ''])(
  'rejeita data incompleta ou inexistente: %s',
  (data) => {
    expect(validarRealizacao({ data, horario: '20:00' }).data).toBeTruthy();
  },
);
it.each(['24:00', '12:60', '1:00', ''])('rejeita horário inválido: %s', (horario) => {
  expect(validarRealizacao({ data: '30/10/2026', horario }).horario).toBeTruthy();
});
it.each([
  [{ codigo: 'realizacao_futura' }, 'passou'],
  [{ codigo: 'horario_ambiguo' }, 'repete'],
  [{ codigo: 'horario_inexistente' }, 'não existe'],
  [{ status: 409 }, 'execução mudou'],
  [{ status: 401 }, 'sessão expirou'],
  [{ status: 404 }, 'não está mais disponível'],
  [{ status: 400 }, 'Revise'],
  [{ status: 503 }, 'Tente novamente'],
])('traduz recusa em linguagem de usuário: %j', (erro, texto) => {
  expect(mensagemErroRealizacao(erro)).toContain(texto);
});

it.each([
  ['1.2.0', false],
  ['1.3.0', true],
  ['1.4.0', true],
  ['2.0.0', false],
  [undefined, false],
])('habilita a exceção somente com contrato compatível: %s', (versao, esperado) => {
  expect(aceitaRealizacaoInformada(versao)).toBe(esperado);
});
