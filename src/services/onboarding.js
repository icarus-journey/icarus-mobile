import { apiClient } from './apiClient';

export async function iniciarOnboarding({ usuarioId, token, respostas }) {
  const resposta = await apiClient.post(`/api/usuarios/${usuarioId}/onboarding`, { respostas }, { token });
  return { jobId: resposta.jobId };
}

export async function obterStatusOnboarding({ usuarioId, token, jobId }) {
  return apiClient.get(`/api/usuarios/${usuarioId}/onboarding/${jobId}`, { token });
}
