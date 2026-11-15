export function numeroPublico(valor) {
  return valor == null
    ? 'Não disponível'
    : Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function resumoDaReferencia(dados) {
  const valores = dados.valores;
  if (valores.mediana != null) return `${numeroPublico(valores.mediana)} min · mediana`;
  if (valores.percentual != null) return `${numeroPublico(valores.percentual)}%`;
  if (dados.medida === 'distribuicao_periodos') return 'Minutos por período do dia';
  return 'Associação observada';
}

export function tipoDiaDaReferencia(tipo) {
  return (
    {
      todos: 'Todos os dias',
      segunda_sexta: 'Segunda a sexta',
      sabado_domingo: 'Sábado e domingo',
    }[tipo] ?? tipo
  );
}

export function duracaoPublica(minutos) {
  if (minutos == null || !Number.isFinite(Number(minutos)) || Number(minutos) < 0)
    return 'Não disponível';
  const total = Math.round(Number(minutos));
  const horas = Math.floor(total / 60);
  const restante = total % 60;
  if (horas === 0) return `${restante} min`;
  return restante === 0 ? `${horas} h` : `${horas} h ${restante} min`;
}
