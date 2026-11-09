import { formatDateDaysFromNow, isValidDateString, paraDataIso } from '../../utils/dateInput';

export function agruparMissoesPorDia(missoes, hoje = formatDateDaysFromNow(0)) {
  const [dia, mes, ano] = hoje.split('/').map(Number);
  const amanha = formatDateDaysFromNow(1, new Date(ano, mes - 1, dia, 12));
  const grupos = new Map();

  for (const missao of missoes) {
    const data = isValidDateString(missao.dataLimite) ? missao.dataLimite : null;
    const chave = data ? paraDataIso(data) : 'sem-data';
    if (!grupos.has(chave)) {
      const dataCurta = data?.slice(0, 5);
      const titulo = !data
        ? 'Sem data'
        : data === hoje
          ? `Hoje · ${dataCurta}`
          : data === amanha
            ? `Amanhã · ${dataCurta}`
            : dataCurta;
      grupos.set(chave, { key: `dia-${chave}`, titulo, tipo: 'dia', data: [] });
    }
    grupos.get(chave).data.push(missao);
  }

  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, grupo]) => grupo);
}
