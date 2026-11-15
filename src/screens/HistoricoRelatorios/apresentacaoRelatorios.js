export function resumoDoRelatorio(r) {
  const p = r.planejamento;
  if (p?.estado === 'disponivel')
    return `${p.concluidas} de ${p.previstas} feitas · ${p.taxaConclusao.toLocaleString('pt-BR')}%`;
  if (r.concluidas != null)
    return `${r.concluidas} ${r.concluidas === 1 ? 'missão feita' : 'missões feitas'}${r.diasComConclusao == null ? '' : ` · ${r.diasComConclusao} ${r.diasComConclusao === 1 ? 'dia com registros' : 'dias com registros'}`}`;
  return r.estado === 'indisponivel'
    ? 'Não foi possível ler as informações desta semana.'
    : 'Informações da semana indisponíveis.';
}
export function mesDoRelatorio(data) {
  const m = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${data}T12:00:00Z`))
    .replace(' de ', ' ');
  return m.charAt(0).toUpperCase() + m.slice(1);
}
export function dataDaGeracao(resumo) {
  if (!resumo.periodo.fusoHorario) return 'Horário local da geração não disponível.';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: resumo.periodo.fusoHorario,
  }).format(new Date(resumo.geradoEm));
}
