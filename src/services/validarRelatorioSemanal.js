const contagem = (n) => Number.isSafeInteger(n) && n >= 0;
const numero = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0;

function semanaValida(semana) {
  if (!semana) return false;
  const { estado, previstas, concluidas, taxaConclusao } = semana;
  if (estado === 'historico_parcial')
    return [previstas, concluidas, taxaConclusao].every((n) => n === null);
  if (estado === 'sem_planejamento')
    return previstas === 0 && concluidas === 0 && taxaConclusao === null;
  return (
    estado === 'disponivel' &&
    contagem(previstas) &&
    previstas > 0 &&
    contagem(concluidas) &&
    concluidas <= previstas &&
    numero(taxaConclusao) &&
    taxaConclusao <= 100
  );
}

export function validarRelatorioSemanal(resposta) {
  const comparacao = resposta?.relatorio?.comparacaoSemanal;
  if (comparacao == null) return resposta;
  const {
    semana,
    semanasAnteriores,
    mediaQuatroSemanas: media,
    podeCompararSemanaAnterior,
    podeCompararMediaQuatroSemanas,
  } = comparacao;
  let valida =
    semanaValida(semana) &&
    Array.isArray(semanasAnteriores) &&
    semanasAnteriores.length === 4 &&
    semanasAnteriores.every(semanaValida) &&
    typeof podeCompararSemanaAnterior === 'boolean' &&
    typeof podeCompararMediaQuatroSemanas === 'boolean' &&
    media != null;
  if (valida) {
    const valores = [media.previstas, media.concluidas, media.taxaConclusao];
    valida =
      valores.every((n) => n === null) ||
      (valores.every(numero) && media.concluidas <= media.previstas && media.taxaConclusao <= 100);
    if (podeCompararSemanaAnterior)
      valida &&= semana.taxaConclusao != null && semanasAnteriores[0].taxaConclusao != null;
    if (podeCompararMediaQuatroSemanas)
      valida &&= semana.taxaConclusao != null && valores.every(numero);
  }
  if (!valida) throw new Error('Comparação da semana indisponível.');
  return resposta;
}
