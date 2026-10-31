export async function listarMissoesAvulsas({ usuarioId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes`);
}

export async function criarMissao({ usuarioId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes`, {
    metodo: 'POST',
    corpo: dados,
  });
}

export async function atualizarMissao({ usuarioId, missaoId, dados, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes/${missaoId}`, {
    metodo: 'PATCH',
    corpo: dados,
  });
}

export async function concluirMissao({ usuarioId, missaoId, ocorrenciaId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes/${missaoId}/concluir`, {
    metodo: 'POST',
    ...(ocorrenciaId != null ? { corpo: { ocorrenciaId } } : {}),
  });
}

export async function inativarMissao({ usuarioId, missaoId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes/${missaoId}/inativar`, {
    metodo: 'POST',
  });
}

export async function excluirMissao({ usuarioId, id, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes/${id}`, { metodo: 'DELETE' });
}

export async function consultarMissao({ usuarioId, missaoId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/missoes/${missaoId}`);
}
