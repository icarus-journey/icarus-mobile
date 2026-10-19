export async function criarCampanha({ usuarioId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas`, { metodo: 'POST', corpo: dados });
}

export async function atualizarCampanha({ usuarioId, campanhaId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas/${campanhaId}`, { metodo: 'PATCH', corpo: dados });
}
