const estados = ['disponivel', 'sem_registros', 'historico_incompleto', 'fuso_nao_informado'];
const dataCivil = (valor) => typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor);
const booleanoOuAusente = (valor) => typeof valor === 'boolean' || valor === null;

export async function consultarJornada({ usuarioId, requisitarAutenticado }) {
  const resposta = await requisitarAutenticado(`/api/usuarios/${usuarioId}/jornada`);
  const sequencia = resposta?.sequencia;
  if (
    !/^1\./.test(resposta?.versaoContrato ?? '') ||
    !Number.isSafeInteger(resposta?.saldoPontos) ||
    resposta.saldoPontos < 0 ||
    !estados.includes(sequencia?.estado) ||
    !(
      sequencia.diasAtuais === null ||
      (Number.isSafeInteger(sequencia.diasAtuais) && sequencia.diasAtuais >= 0)
    ) ||
    !booleanoOuAusente(sequencia.realizouHoje) ||
    !Array.isArray(sequencia.dias) ||
    (sequencia.estado === 'fuso_nao_informado'
      ? sequencia.hoje !== null || sequencia.dias.length !== 0
      : !dataCivil(sequencia.hoje) || sequencia.dias.length !== 7) ||
    sequencia.dias.some((dia) => !dataCivil(dia.data) || !booleanoOuAusente(dia.realizada))
  )
    throw new Error('Resposta da jornada indisponível.');
  return resposta;
}
