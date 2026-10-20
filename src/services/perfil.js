export function criarServicoPerfil({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}`;
  return {
    consultar: () => requisitarAutenticado(base),
    salvar: (dados) => requisitarAutenticado(`${base}/perfil`, { metodo: 'PUT', corpo: dados }),
    atualizarFuso: (fusoHorario) =>
      requisitarAutenticado(`${base}/fuso`, { metodo: 'PUT', corpo: { fusoHorario } }),
  };
}

export function obterFusoDoDispositivo() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
