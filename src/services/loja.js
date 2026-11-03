export function criarServicoLoja({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}/loja`;
  return {
    consultar: () => requisitarAutenticado(base),
    salvar: (dados, id) =>
      requisitarAutenticado(`${base}/recompensas${id ? `/${id}` : ''}`, {
        metodo: id ? 'PATCH' : 'POST',
        corpo: dados,
      }),
    excluir: (id) => requisitarAutenticado(`${base}/recompensas/${id}`, { metodo: 'DELETE' }),
    resgatar: (id, operacaoId) =>
      requisitarAutenticado(
        id ? `${base}/recompensas/${id}/resgates` : `${base}/protecao/resgates`,
        { metodo: 'POST', corpo: { operacaoId } },
      ),
    desfazer: (id) => requisitarAutenticado(`${base}/resgates/${id}/desfazer`, { metodo: 'POST' }),
    utilizar: (id) => requisitarAutenticado(`${base}/resgates/${id}/utilizar`, { metodo: 'POST' }),
  };
}

const MENSAGENS = {
  saldo_insuficiente: 'Você ainda não possui pontos suficientes para este resgate.',
  limite_protecoes: 'Você já possui três proteções de sequência.',
  recompensa_imutavel: 'Esta recompensa já foi resgatada e não pode ser editada.',
  estado_invalido: 'O estado deste item mudou. Atualize a loja e tente novamente.',
  recompensa_nao_encontrada: 'Esta recompensa não está mais disponível.',
  resgate_nao_encontrado: 'Este resgate não está mais disponível.',
  dados_atualizados: 'Seus dados mudaram. Atualize a loja e tente novamente.',
};

export function mensagemLoja(erro) {
  return (
    MENSAGENS[erro.codigo] ??
    (erro.status === 400
      ? 'Revise o nome, a descrição e o custo informado.'
      : 'Não foi possível concluir a operação. Atualize a loja antes de tentar novamente.')
  );
}

export { criarOperacaoId } from '../utils/criarOperacaoId';
