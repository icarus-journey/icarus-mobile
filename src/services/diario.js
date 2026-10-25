function normalizarEntrada(entrada) {
  return { ...entrada, tipo: entrada.tipo.toUpperCase() };
}

export function criarServicoDiario({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}/diario`;
  const corpo = (entrada) => ({
    tipo: entrada.tipo.toLowerCase(),
    dataRegistro: entrada.dataRegistro,
    texto: entrada.texto.trim(),
  });
  return {
    async listar() {
      const entradas = await requisitarAutenticado(base);
      if (!Array.isArray(entradas)) throw new Error('Resposta de diário inválida.');
      return entradas.map(normalizarEntrada);
    },
    async criar(entrada) {
      return normalizarEntrada(
        await requisitarAutenticado(base, { metodo: 'POST', corpo: corpo(entrada) }),
      );
    },
    async atualizar(id, entrada) {
      return normalizarEntrada(
        await requisitarAutenticado(`${base}/${id}`, { metodo: 'PATCH', corpo: corpo(entrada) }),
      );
    },
    excluir: (id) => requisitarAutenticado(`${base}/${id}`, { metodo: 'DELETE' }),
  };
}

export function mensagemDiario(falha) {
  if (falha.status === 400)
    return 'Revise o texto, o tipo e a data. O limite é de 10.000 caracteres.';
  if (falha.status === 401) return 'Sua sessão expirou. Entre novamente para acessar seu diário.';
  if (falha.status === 404) return 'Essa entrada não está mais disponível. Atualize o histórico.';
  if (falha.status === 409)
    return 'Essa entrada foi atualizada. Atualize o histórico e tente novamente.';
  return 'Não foi possível salvar a alteração. Seu texto foi mantido para tentar novamente.';
}
