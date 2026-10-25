function validarResposta(dados) {
  if (
    dados?.versaoContrato !== '1.0.0' ||
    !Array.isArray(dados.medicoes) ||
    typeof dados.versao !== 'string'
  ) {
    throw new Error('Resposta de progresso indisponível.');
  }
  return dados;
}

export function criarServicoProgressoCampanha({ usuarioId, campanhaId, requisitarAutenticado }) {
  const caminho = `/api/usuarios/${usuarioId}/campanhas/${campanhaId}/progresso`;
  return {
    consultar: async () => validarResposta(await requisitarAutenticado(caminho)),
    registrar: async ({ valorAtual, versaoEsperada, operacaoId }) =>
      validarResposta(
        await requisitarAutenticado(caminho, {
          metodo: 'POST',
          corpo: { valorAtual, versaoEsperada, operacaoId },
        }),
      ),
  };
}

export function mensagemProgressoCampanha(erro) {
  if (erro.status === 401) return 'Sua sessão expirou. Entre novamente para acessar sua meta.';
  if (erro.status === 404) return 'Esta campanha não está mais disponível.';
  if (erro.status === 400) return 'Informe um valor válido, com até duas casas decimais.';
  if (erro.codigo === 'campanha_encerrada')
    return 'Esta campanha já foi encerrada. Atualize o histórico.';
  if (erro.codigo === 'meta_nao_definida')
    return 'Defina a quantidade e a unidade da sua meta primeiro.';
  if (erro.status === 409)
    return 'Sua meta mudou. Atualize o histórico e revise o valor antes de tentar novamente.';
  return 'Não foi possível salvar. O valor foi mantido para você tentar novamente.';
}
