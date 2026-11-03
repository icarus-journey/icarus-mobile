export async function listarEpicos({ usuarioId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/epicos`);
}

export async function criarEpico({ usuarioId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/epicos`, {
    metodo: 'POST',
    corpo: dados,
  });
}

export async function atualizarEpico({ usuarioId, epicoId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/epicos/${epicoId}`, {
    metodo: 'PATCH',
    corpo: dados,
  });
}

export async function concluirEpico({ usuarioId, epicoId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/epicos/${epicoId}/concluir`, {
    metodo: 'POST',
  });
}

export async function excluirEpico({ usuarioId, id, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/epicos/${id}`, { metodo: 'DELETE' });
}
