export function jornadaDeTeste(alteracoes = {}) {
  return {
    versaoContrato: '1.0.0',
    saldoPontos: 1270,
    sequencia: {
      estado: 'disponivel',
      diasAtuais: 3,
      realizouHoje: true,
      hoje: '2026-10-31',
      fusoHorario: 'America/Sao_Paulo',
      dias: Array.from({ length: 7 }, (_, i) => ({ data: `2026-10-${25 + i}`, realizada: i >= 4 })),
    },
    ...alteracoes,
  };
}
