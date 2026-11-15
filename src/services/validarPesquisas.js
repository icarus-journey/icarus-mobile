const texto = (valor) => typeof valor === 'string' && valor.trim().length > 0;
const percentual = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor) && valor >= 0 && valor <= 100;

export function validarPesquisas(resposta) {
  if (!/^1\./.test(resposta?.versaoContrato ?? ''))
    throw new Error('Resposta das pesquisas indisponível.');
  if (resposta.leituras == null && /^1\.[01]\./.test(resposta.versaoContrato)) return resposta;
  if (
    !Array.isArray(resposta.leituras) ||
    new Set(resposta.leituras.map((l) => l?.id)).size !== resposta.leituras.length ||
    !resposta.leituras.every(
      (l) =>
        l &&
        [
          l.id,
          l.titulo,
          l.medida,
          l.atalho,
          l.leitura,
          l.dadosDaPesquisa,
          l.fonte,
          l.recomendacao?.titulo,
          l.recomendacao?.texto,
        ].every(texto) &&
        l.urlFonte?.startsWith('https://') &&
        Array.isArray(l.grupos) &&
        l.grupos.length === 2 &&
        l.grupos.every((g) => texto(g?.rotulo) && percentual(g?.percentual)) &&
        Array.isArray(l.referenciasIds) &&
        l.referenciasIds.length > 0 &&
        l.referenciasIds.every(texto),
    )
  )
    throw new Error('Resposta das pesquisas indisponível.');
  return resposta;
}
