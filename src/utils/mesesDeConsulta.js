export function mesesDeConsulta(referencia, fuso) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'numeric',
    timeZone: fuso,
  }).formatToParts(new Date(referencia));
  const ano = Number(partes.find((p) => p.type === 'year').value),
    mes = Number(partes.find((p) => p.type === 'month').value) - 1;
  return Array.from({ length: 12 }, (_, i) => {
    const inicio = new Date(Date.UTC(ano, mes - i, 1)),
      fim = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth() + 1, 0));
    const titulo = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
      .format(inicio)
      .replace(' de ', ' ');
    return {
      id: inicio.toISOString().slice(0, 7),
      titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1),
      inicio: inicio.toISOString().slice(0, 10),
      fim: fim.toISOString().slice(0, 10),
    };
  });
}
