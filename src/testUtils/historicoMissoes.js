export function registroHistoricoDeTeste(alteracoes = {}) {
  return {
    id: 12,
    missaoId: 3,
    titulo: 'Estudar redes',
    tituloPreservado: true,
    missaoRemovida: false,
    dataPrevista: '2026-10-30',
    estado: 'feita',
    campanha: { id: 7, titulo: 'Fundamentos de redes', removida: false },
    realizadaEm: '2026-10-30T22:30:00.123456+00:00',
    registradaEm: '2026-10-31T12:00:00+00:00',
    fusoHorarioRealizacao: 'America/Sao_Paulo',
    pontosRecebidos: 30,
    ...alteracoes,
  };
}
export function paginaHistoricoDeTeste(alteracoes = {}) {
  return {
    versaoContrato: '1.0.0',
    filtro: {
      inicio: '2026-10-02',
      fim: '2026-10-31',
      estado: 'todos',
      campanhaId: null,
      avulsas: false,
      limite: 20,
    },
    fusoHorario: 'America/Sao_Paulo',
    consultadoEm: '2026-10-31T15:00:00+00:00',
    registros: [registroHistoricoDeTeste()],
    proximoCursor: null,
    historicoParcial: false,
    temRegistros: true,
    ...alteracoes,
  };
}
