export async function criarCampanha({ usuarioId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas`, {
    metodo: 'POST',
    corpo: dados,
  });
}

export async function atualizarCampanha({ usuarioId, campanhaId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas/${campanhaId}`, {
    metodo: 'PATCH',
    corpo: dados,
  });
}

export async function concluirCampanha({ usuarioId, campanhaId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas/${campanhaId}/concluir`, {
    metodo: 'POST',
  });
}

export async function excluirCampanha({ usuarioId, id, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/campanhas/${id}`, { metodo: 'DELETE' });
}
