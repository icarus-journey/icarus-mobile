import { validarRelatorioSemanal } from './validarRelatorioSemanal';
const contagem = (n) => Number.isSafeInteger(n) && n >= 0;
const opcional = (n) => n === null || contagem(n);
const instante = (s) => typeof s === 'string' && Number.isFinite(Date.parse(s));
const dataCivil = (s) =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().slice(0, 10) === s;
const texto = (s) => typeof s === 'string' && s.trim().length > 0;
function fusoValido(s) {
  if (s === null) return true;
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: s }).format();
    return texto(s);
  } catch {
    return false;
  }
}
export function validarResumoRelatorio(r) {
  const p = r?.periodo,
    a = r?.planejamento;
  let valido =
    contagem(r?.id) &&
    r.id > 0 &&
    p &&
    dataCivil(p.inicio) &&
    dataCivil(p.fim) &&
    (r.estado === 'indisponivel'
      ? Date.parse(p.fim) >= Date.parse(p.inicio)
      : Date.parse(p.fim) - Date.parse(p.inicio) === 6 * 86400000) &&
    fusoValido(p.fusoHorario) &&
    instante(r.geradoEm) &&
    ['disponivel', 'indisponivel'].includes(r.estado) &&
    (r.estado === 'disponivel' ? texto(r.titulo) : r.titulo === null) &&
    opcional(r.concluidas) &&
    opcional(r.diasComConclusao);
  if (a !== null)
    valido &&=
      a &&
      ['disponivel', 'sem_planejamento', 'historico_parcial'].includes(a.estado) &&
      opcional(a.previstas) &&
      opcional(a.concluidas) &&
      (a.estado === 'disponivel'
        ? a.previstas > 0 &&
          contagem(a.concluidas) &&
          a.concluidas <= a.previstas &&
          typeof a.taxaConclusao === 'number' &&
          Number.isFinite(a.taxaConclusao) &&
          a.taxaConclusao >= 0 &&
          a.taxaConclusao <= 100
        : a.taxaConclusao === null);
  if (!valido) throw new Error('Relatório indisponível.');
  return r;
}
export function criarServicoHistoricoRelatorios({ usuarioId, requisitarAutenticado }) {
  const raiz = `/api/usuarios/${usuarioId}/relatorios/semanais`;
  return {
    async listar(cursor) {
      const p = new URLSearchParams({ limite: '20' });
      if (cursor) p.set('cursor', cursor);
      const r = await requisitarAutenticado(`${raiz}?${p}`);
      if (
        r?.versaoContrato !== '1.0.0' ||
        !instante(r.consultadoEm) ||
        !Array.isArray(r.relatorios) ||
        !(r.proximoCursor === null || texto(r.proximoCursor))
      )
        throw new Error('Histórico indisponível.');
      r.relatorios.forEach(validarResumoRelatorio);
      if (new Set(r.relatorios.map((v) => v.id)).size !== r.relatorios.length)
        throw new Error('Histórico indisponível.');
      return r;
    },
    async consultar(id) {
      if (!contagem(id) || id === 0) throw new Error('Relatório indisponível.');
      const r = await requisitarAutenticado(`${raiz}/${id}`);
      if (r?.versaoContrato !== '1.0.0' || r.disponibilidadeReferencias !== 'nao_registradas')
        throw new Error('Relatório indisponível.');
      validarResumoRelatorio(r.resumo);
      const relatorio = r.relatorio;
      if (
        r.resumo.id !== id ||
        relatorio?.id !== id ||
        !instante(relatorio.geradoEm) ||
        Date.parse(r.resumo.geradoEm) !== Date.parse(relatorio.geradoEm) ||
        !['titulo', 'resumo', 'reflexao'].every((k) => texto(relatorio.texto?.[k])) ||
        relatorio.texto.titulo !== r.resumo.titulo ||
        !(
          texto(relatorio.texto.proximoAjuste) ||
          (relatorio.versaoIndicadores === '1.2.0' && relatorio.texto.proximoAjuste === null)
        ) ||
        !texto(relatorio.geracao?.provedor) ||
        !texto(relatorio.geracao?.modelo) ||
        !['1.0.0', '1.1.0', '1.2.0'].includes(relatorio.versaoIndicadores) ||
        !relatorio.indicadores ||
        !Array.isArray(relatorio.indicadores.distribuicaoPorArea) ||
        !opcional(relatorio.indicadores.concluidas) ||
        !contagem(relatorio.indicadores.diasComConclusao)
      )
        throw new Error('Relatório indisponível.');
      validarRelatorioSemanal({ relatorio });
      const semana = relatorio.comparacaoSemanal?.semana;
      if (
        semana
          ? !r.resumo.planejamento ||
            ['estado', 'previstas', 'concluidas', 'taxaConclusao'].some(
              (k) => semana[k] !== r.resumo.planejamento[k],
            )
          : r.resumo.planejamento !== null
      )
        throw new Error('Relatório indisponível.');
      return r;
    },
  };
}
