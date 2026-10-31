const inteiro = (valor) => Number.isSafeInteger(valor) && valor >= 0;

export function validarProgresso(resposta) {
  if (!/^1\./.test(resposta?.versaoContrato ?? ''))
    throw new Error('Resposta de progresso indisponível.');
  const adesao = resposta.adesao;
  if (adesao == null) return resposta; // API anterior preserva atividade e gráfico.
  const {
    estado,
    previstasRegistradas,
    concluidasDoPlanejamento,
    pendentes,
    atrasadas,
    taxaConclusao,
  } = adesao;
  let valida = inteiro(previstasRegistradas);
  if (estado === 'historico_parcial') {
    valida &&= [concluidasDoPlanejamento, pendentes, atrasadas, taxaConclusao].every(
      (v) => v === null,
    );
  } else if (estado === 'disponivel' || estado === 'sem_planejamento') {
    valida &&=
      [concluidasDoPlanejamento, pendentes, atrasadas].every(inteiro) &&
      concluidasDoPlanejamento + pendentes + atrasadas === previstasRegistradas;
    valida &&=
      estado === 'sem_planejamento'
        ? previstasRegistradas === 0 && taxaConclusao === null
        : previstasRegistradas > 0 &&
          typeof taxaConclusao === 'number' &&
          Number.isFinite(taxaConclusao) &&
          taxaConclusao >= 0 &&
          taxaConclusao <= 100;
  } else valida = false;
  if (!valida) throw new Error('Resposta de progresso indisponível.');
  return resposta;
}
