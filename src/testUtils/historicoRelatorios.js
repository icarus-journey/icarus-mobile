import { relatorioDeTeste, PERIODO_ANALITICO } from './dadosAnaliticos';
export function resumoRelatorioDeTeste(alteracoes = {}) {
  return {
    id: 1,
    periodo: { ...PERIODO_ANALITICO },
    geradoEm: '2026-10-19T11:00:00Z',
    estado: 'disponivel',
    titulo: 'Sua semana de registros',
    planejamento: null,
    concluidas: 2,
    diasComConclusao: 2,
    ...alteracoes,
  };
}
export function detalheRelatorioDeTeste(alteracoes = {}) {
  return {
    versaoContrato: '1.0.0',
    resumo: resumoRelatorioDeTeste(),
    relatorio: {
      ...relatorioDeTeste().relatorio,
      geradoEm: '2026-10-19T11:00:00Z',
      comparacaoSemanal: null,
      versaoIndicadores: '1.0.0',
    },
    disponibilidadeReferencias: 'nao_registradas',
    ...alteracoes,
  };
}
export function paginaRelatoriosDeTeste(alteracoes = {}) {
  return {
    versaoContrato: '1.0.0',
    consultadoEm: '2026-10-20T12:00:00Z',
    relatorios: [resumoRelatorioDeTeste()],
    proximoCursor: null,
    ...alteracoes,
  };
}
