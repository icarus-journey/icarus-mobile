const inteiro = (v) => Number.isSafeInteger(v) && v >= 0;
const id = (v) => inteiro(v) && v > 0;
const numero = (v) => typeof v === 'number' && Number.isFinite(v);
const data = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const instante = (v) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const quantidade = (v) => v === null || inteiro(v);
const naoNegativo = (v) => v === null || (numero(v) && v >= 0);
const titulo = (v) => typeof v === 'string' && v.trim().length > 0;

function atividade(a) {
  return (
    a &&
    quantidade(a.concluidasNoPeriodo) &&
    inteiro(a.registrosConfirmadosNoPeriodo) &&
    inteiro(a.diasComRegistrosNoPeriodo) &&
    a.diasComRegistrosNoPeriodo <= a.registrosConfirmadosNoPeriodo &&
    (a.concluidasNoPeriodo === null || a.concluidasNoPeriodo === a.registrosConfirmadosNoPeriodo) &&
    quantidade(a.concluidasNosUltimosSeteDias) &&
    (a.ultimaRealizacao === null || instante(a.ultimaRealizacao))
  );
}
function resultado(r) {
  if (
    !r ||
    ![
      'meta_nao_definida',
      'unidade_sem_resultado_mensurado',
      'sem_registros_no_periodo',
      'medicoes_nao_comparaveis',
      'disponivel',
    ].includes(r.estado)
  )
    return false;
  const e = r.evolucaoNoPeriodo,
    c = r.cenarioAtual;
  if (
    !e ||
    !Array.isArray(e.pontos) ||
    !naoNegativo(e.faltante) ||
    !(e.avancoRegistrado === null || numero(e.avancoRegistrado)) ||
    !c ||
    typeof c.disponivel !== 'boolean' ||
    !inteiro(r.registrosNoPeriodo) ||
    !inteiro(r.diasComRegistrosNoPeriodo) ||
    r.diasComRegistrosNoPeriodo > r.registrosNoPeriodo ||
    ![null, 'registro_anterior', 'primeiro_registro_do_periodo'].includes(r.baseDoAvanco) ||
    e.pontos.some(
      (p) => !data(p.data) || !numero(p.valor) || p.valor < 0 || typeof p.revisado !== 'boolean',
    )
  )
    return false;
  if (['meta_nao_definida', 'unidade_sem_resultado_mensurado'].includes(r.estado))
    return (
      r.valorAtual === null &&
      r.valorMensurado === null &&
      r.unidade === null &&
      e.avancoRegistrado === null &&
      e.pontos.length === 0 &&
      !c.disponivel
    );
  return (
    naoNegativo(r.valorAtual) &&
    numero(r.valorMensurado) &&
    r.valorMensurado > 0 &&
    titulo(r.unidade) &&
    !['ponto', 'pontos', 'xp'].includes(r.unidade.trim().toLowerCase()) &&
    (!c.disponivel || (id(c.semanasAproximadas) && numero(c.ritmoSemanal) && c.ritmoSemanal > 0))
  );
}
export function validarObjetivos(o) {
  if (
    !o ||
    !instante(o.consultadoEm) ||
    !data(o.janelaRecente?.inicio) ||
    !data(o.janelaRecente?.fim) ||
    !titulo(o.janelaRecente?.fusoHorario) ||
    !inteiro(o.campanhasEmAndamento) ||
    !inteiro(o.epicosEmAndamento) ||
    !quantidade(o.campanhasSemRegistroRecente) ||
    !Array.isArray(o.campanhas) ||
    !Array.isArray(o.epicos) ||
    !['disponivel', 'sem_realizacao_recente', 'historico_incompleto'].includes(o.estadoDestaque)
  )
    return false;
  const epicos = new Set(o.epicos.map((e) => e.id));
  if (
    epicos.size !== o.epicos.length ||
    new Set(o.campanhas.map((c) => c.id)).size !== o.campanhas.length
  )
    return false;
  if (
    o.epicos.some(
      (e) =>
        !id(e.id) ||
        !titulo(e.titulo) ||
        !['emAndamento', 'concluido'].includes(e.estado) ||
        !e.campanhas ||
        ![e.campanhas.planejadas, e.campanhas.emAndamento, e.campanhas.concluidas].every(inteiro) ||
        !atividade(e.atividade),
    )
  )
    return false;
  if (
    o.campanhas.some(
      (c) =>
        !id(c.id) ||
        !epicos.has(c.epicoId) ||
        !titulo(c.titulo) ||
        !data(c.prazoFim) ||
        !['emAndamento', 'planejada', 'concluida'].includes(c.estado) ||
        !titulo(c.areaDaVida) ||
        !atividade(c.atividade) ||
        !resultado(c.resultado),
    )
  )
    return false;
  const ativas = o.campanhas.filter((c) => c.estado === 'emAndamento');
  if (
    ativas.length !== o.campanhasEmAndamento ||
    o.epicos.filter((e) => e.estado === 'emAndamento').length !== o.epicosEmAndamento
  )
    return false;
  const incertas = ativas.some((c) => c.atividade.concluidasNosUltimosSeteDias === null);
  if (
    incertas
      ? o.campanhasSemRegistroRecente !== null
      : o.campanhasSemRegistroRecente !==
        ativas.filter((c) => c.atividade.concluidasNosUltimosSeteDias === 0).length
  )
    return false;
  return o.estadoDestaque === 'disponivel'
    ? ativas.some(
        (c) => c.id === o.campanhaEmDestaqueId && c.atividade.concluidasNosUltimosSeteDias > 0,
      )
    : o.campanhaEmDestaqueId === null;
}
