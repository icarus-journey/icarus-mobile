import { filtroDoPeriodo, momentoDoRegistro, opcoesDePeriodo } from './apresentacaoHistorico';
it('mostra meses reais, incluindo fevereiro bissexto, e mantém estado/campanha ao trocar o período', () => {
  const opcoes = opcoesDePeriodo(new Date(2024, 1, 15));
  const fevereiro = opcoes.find((p) => p.id === '2024-02');
  expect(fevereiro.fim).toBe('2024-02-29');
  const filtro = filtroDoPeriodo({ estado: 'feita', campanhaId: 7 }, fevereiro);
  expect(filtro).toMatchObject({
    inicio: '2024-02-01',
    fim: '2024-02-29',
    estado: 'feita',
    campanhaId: 7,
  });
  expect(filtroDoPeriodo(filtro, opcoes[0]).inicio).toBeUndefined();
});
it('formata a realização no próprio fuso e não inventa horário ausente', () => {
  expect(momentoDoRegistro('2026-10-30T22:30:00.1234567+00:00', 'America/Sao_Paulo')).toContain(
    '19:30',
  );
  expect(momentoDoRegistro(null, 'UTC')).toBe('Não informado');
  expect(momentoDoRegistro('2026-10-30T22:30:00Z', null)).toContain('horário local não informado');
});
it('os meses seguem o fuso informado pela API quando a data UTC cruza o mês', () => {
  expect(opcoesDePeriodo('2027-01-31T23:00:00Z', 'Asia/Tokyo').find((p) => p.inicio).id).toBe(
    '2027-02',
  );
  expect(
    opcoesDePeriodo('2027-01-31T23:00:00Z', 'America/Sao_Paulo').find((p) => p.inicio).id,
  ).toBe('2027-01');
});
