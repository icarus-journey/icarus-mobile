export const movimentoDeTeste = (alteracoes = {}) => ({
  id: 12,
  tipo: 'ganhoMissao',
  quantidade: 30,
  saldoApos: 300,
  tituloOrigem: 'Estudar redes',
  tituloPreservado: true,
  origemRemovida: false,
  registradoEm: '2026-10-22T15:30:00Z',
  dataLocal: '2026-10-22',
  ...alteracoes,
});
export const paginaExtratoDeTeste = (alteracoes = {}) => ({
  versaoContrato: '1.0.0',
  filtro: {
    inicio: '2026-09-23',
    fim: '2026-10-22',
    todoHistorico: false,
    natureza: 'todos',
    limite: 20,
  },
  fusoHorario: 'America/Sao_Paulo',
  consultadoEm: '2026-10-22T16:00:00Z',
  saldoAtual: 300,
  movimentos: [movimentoDeTeste()],
  proximoCursor: null,
  temRegistros: true,
  ...alteracoes,
});
