export async function obterPerfil({ usuarioId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}`);
}

export async function atualizarFotoPerfil({ usuarioId, uri, nomeArquivo, contentType, requisitarAutenticado }) {
  const formData = new FormData();
  formData.append('arquivo', { uri, name: nomeArquivo, type: contentType });

  return requisitarAutenticado(`/api/usuarios/${usuarioId}/foto`, {
    metodo: 'PUT',
    corpoFormData: formData,
  });
}

/** URL da foto de perfil — usada direto num componente Image (autenticação via header). */
export function urlFotoPerfil(usuarioId) {
  const urlBase = process.env.EXPO_PUBLIC_API_URL ?? '';
  return `${urlBase.replace(/\/+$/, '')}/api/usuarios/${usuarioId}/foto`;
}
