export async function iniciarOnboarding({ usuarioId, respostas, requisitarAutenticado }) {
  const resposta = await requisitarAutenticado(`/api/usuarios/${usuarioId}/onboarding`, {
    metodo: 'POST',
    corpo: { respostas },
  });
  return { jobId: resposta.jobId };
}

export async function obterStatusOnboarding({ usuarioId, jobId, requisitarAutenticado }) {
  return requisitarAutenticado(`/api/usuarios/${usuarioId}/onboarding/${jobId}`);
}
