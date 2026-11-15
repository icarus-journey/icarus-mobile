const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function lerData(iso) {
  const [ano, mes, dia] = (iso ?? '').split('-').map(Number);
  if (!ano || !mes || !dia || mes > 12 || dia > 31) return null;
  return { ano, mes, dia };
}

export function periodoCurto(periodo) {
  const inicio = lerData(periodo?.inicio);
  const fim = lerData(periodo?.fim);
  if (!inicio || !fim) return '';
  if (periodo.inicio === periodo.fim) return `${inicio.dia} ${MESES[inicio.mes - 1]} ${inicio.ano}`;
  if (inicio.mes === fim.mes && inicio.ano === fim.ano)
    return `${inicio.dia}–${fim.dia} ${MESES[fim.mes - 1]} ${fim.ano}`;
  const anoInicio = inicio.ano !== fim.ano ? ` ${inicio.ano}` : '';
  return `${inicio.dia} ${MESES[inicio.mes - 1]}${anoInicio} – ${fim.dia} ${MESES[fim.mes - 1]} ${fim.ano}`;
}

export function rotuloDoPonto(ponto, granularidade) {
  const data = lerData(ponto.inicio);
  const fim = lerData(ponto.fim);
  if (!data || !fim) return '';
  if (granularidade === 'mes') return MESES[data.mes - 1];
  if (granularidade === 'semana') return `${data.dia}–${fim.dia}`;
  return DIAS[new Date(Date.UTC(data.ano, data.mes - 1, data.dia)).getUTCDay()];
}

export function intervaloDoPonto(ponto) {
  return periodoCurto(ponto);
}

export function nomeDoFuso(fuso) {
  if (fuso === 'America/Sao_Paulo') return 'Horário de São Paulo';
  if (fuso === 'UTC') return 'Horário UTC';
  return fuso ? `Horário de ${fuso.split('/').pop().replaceAll('_', ' ')}` : '';
}
