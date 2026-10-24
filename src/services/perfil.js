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
