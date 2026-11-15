const idValido = (v) => Number.isSafeInteger(v) && v > 0;
const dataValida = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const instanteValido = (v) =>
  v === null ||
  (typeof v === 'string' && Number.isFinite(Date.parse(v.replace(/(\.\d{3})\d+/, '$1'))));
const estados = ['pendente', 'atrasada', 'feita', 'feitaComAtraso', 'cancelada'];
function campanhaValida(c) {
  return (
    c &&
    idValido(c.id) &&
    typeof c.titulo === 'string' &&
    c.titulo.trim() &&
    typeof c.removida === 'boolean'
  );
}
export function validarRegistroHistorico(r) {
  if (
    !r ||
    !idValido(r.id) ||
    !idValido(r.missaoId) ||
    !r.titulo?.trim() ||
    !dataValida(r.dataPrevista) ||
    !estados.includes(r.estado) ||
    typeof r.tituloPreservado !== 'boolean' ||
    typeof r.missaoRemovida !== 'boolean' ||
    !(r.campanha === null || campanhaValida(r.campanha)) ||
    !instanteValido(r.realizadaEm) ||
    !instanteValido(r.registradaEm) ||
    !(r.fusoHorarioRealizacao === null || typeof r.fusoHorarioRealizacao === 'string') ||
    !(
      r.pontosRecebidos === null ||
      (Number.isSafeInteger(r.pontosRecebidos) && r.pontosRecebidos >= 0)
    )
  )
    throw new Error('Registro do histórico indisponível.');
  return r;
}
export function criarServicoHistoricoMissoes({ usuarioId, requisitarAutenticado }) {
  const raiz = `/api/usuarios/${usuarioId}/historico/missoes`;
  return {
    async listar(filtros, cursor = null) {
      const p = new URLSearchParams({ estado: filtros.estado ?? 'todos', limite: '20' });
      if (filtros.inicio) {
        p.set('inicio', filtros.inicio);
        p.set('fim', filtros.fim);
      }
      if (filtros.campanhaId) p.set('campanhaId', String(filtros.campanhaId));
      if (filtros.avulsas) p.set('avulsas', 'true');
      if (cursor) p.set('cursor', cursor);
      const r = await requisitarAutenticado(`${raiz}?${p}`);
      if (
        r?.versaoContrato !== '1.0.0' ||
        !Array.isArray(r.registros) ||
        !dataValida(r.filtro?.inicio) ||
        !dataValida(r.filtro?.fim) ||
        typeof r.fusoHorario !== 'string' ||
        !r.consultadoEm ||
        !instanteValido(r.consultadoEm) ||
        typeof r.historicoParcial !== 'boolean' ||
        typeof r.temRegistros !== 'boolean' ||
        !(r.proximoCursor === null || typeof r.proximoCursor === 'string')
      )
        throw new Error('Histórico indisponível.');
      r.registros.forEach(validarRegistroHistorico);
      if (new Set(r.registros.map((item) => item.id)).size !== r.registros.length)
        throw new Error('Histórico indisponível.');
      return r;
    },
    async consultar(id) {
      const r = await requisitarAutenticado(`${raiz}/${id}`);
      if (r?.versaoContrato !== '1.0.0' || typeof r.fusoHorario !== 'string')
        throw new Error('Registro indisponível.');
      validarRegistroHistorico(r.registro);
      if (r.registro.id !== id) throw new Error('Registro indisponível.');
      return r;
    },
    async campanhas() {
      const r = await requisitarAutenticado(`${raiz}/campanhas`);
      if (!Array.isArray(r) || r.some((c) => !campanhaValida(c)))
        throw new Error('Campanhas indisponíveis.');
      return r;
    },
  };
}
