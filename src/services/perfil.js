import { File } from 'expo-file-system';
import { fromByteArray } from 'base64-js';

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

export async function atualizarFotoPerfil({ usuarioId, uri, requisitarAutenticado }) {
  const formData = new FormData();
  formData.append('arquivo', new File(uri));

  return requisitarAutenticado(`/api/usuarios/${usuarioId}/foto`, {
    metodo: 'PUT',
    corpoFormData: formData,
  });
}

export async function obterFotoPerfil({ usuarioId, requisitarAutenticado }) {
  const { conteudo, tipo } = await requisitarAutenticado(`/api/usuarios/${usuarioId}/foto`, {
    formatoResposta: 'binario',
  });
  return `data:${tipo};base64,${fromByteArray(conteudo)}`;
}
