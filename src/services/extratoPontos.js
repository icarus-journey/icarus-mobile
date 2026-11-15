const inteiro = (n) => Number.isSafeInteger(n);
const instante = (s) => typeof s === 'string' && Number.isFinite(Date.parse(s));
const data = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const fusoValido = (s) => {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: s }).format();
    return typeof s === 'string' && s.length > 0;
  } catch {
    return false;
  }
};
const TIPOS = ['ganhoMissao', 'bonus', 'compraItem', 'ajuste', 'estornoResgate'];
export function validarMovimentoExtrato(m) {
  if (
    !m ||
    !inteiro(m.id) ||
    m.id <= 0 ||
    !TIPOS.includes(m.tipo) ||
    !inteiro(m.quantidade) ||
    !(m.saldoApos === null || inteiro(m.saldoApos)) ||
    !(m.tituloOrigem === null || (typeof m.tituloOrigem === 'string' && m.tituloOrigem.trim())) ||
    typeof m.tituloPreservado !== 'boolean' ||
    typeof m.origemRemovida !== 'boolean' ||
    !instante(m.registradoEm) ||
    !data(m.dataLocal)
  )
    throw new Error('Movimento indisponível.');
  return m;
}
export function criarServicoExtratoPontos({ usuarioId, requisitarAutenticado }) {
  const raiz = `/api/usuarios/${usuarioId}/extrato`;
  return {
    async listar(filtros, cursor) {
      const p = new URLSearchParams({ natureza: filtros.natureza ?? 'todos', limite: '20' });
      if (filtros.todoHistorico) p.set('todoHistorico', 'true');
      if (filtros.inicio) {
        p.set('inicio', filtros.inicio);
        p.set('fim', filtros.fim);
      }
      if (cursor) p.set('cursor', cursor);
      const r = await requisitarAutenticado(`${raiz}?${p}`),
        f = r?.filtro;
      if (
        r?.versaoContrato !== '1.0.0' ||
        !f ||
        !Array.isArray(r.movimentos) ||
        !inteiro(r.saldoAtual) ||
        !fusoValido(r.fusoHorario) ||
        !instante(r.consultadoEm) ||
        typeof r.temRegistros !== 'boolean' ||
        !(
          r.proximoCursor === null ||
          (typeof r.proximoCursor === 'string' && r.proximoCursor.length > 0)
        ) ||
        typeof f.todoHistorico !== 'boolean' ||
        !['todos', 'recebidos', 'usados'].includes(f.natureza) ||
        !inteiro(f.limite) ||
        f.limite < 1 ||
        f.limite > 50 ||
        (f.todoHistorico ? f.inicio !== null || f.fim !== null : !data(f.inicio) || !data(f.fim))
      )
        throw new Error('Extrato indisponível.');
      r.movimentos.forEach(validarMovimentoExtrato);
      if (new Set(r.movimentos.map((m) => m.id)).size !== r.movimentos.length)
        throw new Error('Extrato indisponível.');
      return r;
    },
    async consultar(id) {
      const r = await requisitarAutenticado(`${raiz}/${id}`);
      if (r?.versaoContrato !== '1.0.0' || !fusoValido(r.fusoHorario))
        throw new Error('Movimento indisponível.');
      validarMovimentoExtrato(r.movimento);
      if (r.movimento.id !== id) throw new Error('Movimento indisponível.');
      return r;
    },
  };
}
