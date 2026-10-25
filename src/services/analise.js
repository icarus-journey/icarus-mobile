export function criarServicoAnalise({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}`;
  return {
    progresso: (periodo = 'semanaAnterior') =>
      requisitarAutenticado(`${base}/progresso?periodo=${encodeURIComponent(periodo)}`),
    consultarRelatorio: () => requisitarAutenticado(`${base}/relatorios/semanais/atual`),
    solicitarRelatorio: () =>
      requisitarAutenticado(`${base}/relatorios/semanais`, { metodo: 'POST' }),
    tentarRelatorioNovamente: () =>
      requisitarAutenticado(`${base}/relatorios/semanais/tentar-novamente`, { metodo: 'POST' }),
    referencias: (areaDaVida, tipoDia = 'todos') => {
      const parametros = [`tipoDia=${encodeURIComponent(tipoDia)}`];
      if (areaDaVida) parametros.push(`areaDaVida=${encodeURIComponent(areaDaVida)}`);
      return requisitarAutenticado(`${base}/referencias-publicas?${parametros.join('&')}`);
    },
  };
}
