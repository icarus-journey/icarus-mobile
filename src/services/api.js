export class ErroApi extends Error {
  constructor(mensagem, status = 0, erros = {}) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
    this.erros = erros;
  }
}

export function criarApi({
  urlBase = process.env.EXPO_PUBLIC_API_URL,
  executarFetch = (...args) => fetch(...args),
  tempoLimite = 15000,
} = {}) {
  return async function requisitar(caminho, { metodo = 'GET', corpo, corpoFormData, token } = {}) {
    if (!urlBase) {
      throw new ErroApi(
        'Não foi possível conectar ao serviço. Verifique a configuração do aplicativo.',
      );
    }
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), tempoLimite);
    try {
      const resposta = await executarFetch(`${urlBase.replace(/\/+$/, '')}${caminho}`, {
        method: metodo,
        headers: {
          Accept: 'application/json',
          // FormData define o próprio Content-Type (com boundary) — não sobrescrever aqui.
          ...(corpo ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(corpo ? { body: JSON.stringify(corpo) } : {}),
        ...(corpoFormData ? { body: corpoFormData } : {}),
        signal: controlador.signal,
      });
      const dados = resposta.status === 204 ? null : await resposta.json().catch(() => null);
      if (!resposta.ok) {
        const mensagens = {
          400: 'Revise os dados informados.',
          401: 'E-mail ou senha inválidos, ou sessão expirada.',
          409: 'Já existe uma conta associada a este e-mail.',
          429: 'Muitas tentativas de acesso. Aguarde alguns minutos e tente novamente.',
        };
        const erro = new ErroApi(
          mensagens[resposta.status] ??
            'O serviço está indisponível. Tente novamente em instantes.',
          resposta.status,
          resposta.status === 400 ? (dados?.errors ?? {}) : {},
        );
        erro.codigo = typeof dados?.codigo === 'string' ? dados.codigo : undefined;
        throw erro;
      }
      return dados;
    } catch (erro) {
      if (erro instanceof ErroApi) throw erro;
      throw new ErroApi(
        erro.name === 'AbortError'
          ? 'A conexão demorou demais. Tente novamente.'
          : 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
      );
    } finally {
      clearTimeout(limite);
    }
  };
}

export function errosDoFormulario(erro) {
  const campos = { nome: 'name', email: 'email', senha: 'password', dataNascimento: 'birthDate' };
  return Object.fromEntries(
    Object.entries(erro.erros ?? {})
      .filter(([campo, mensagens]) => campos[campo] && Array.isArray(mensagens))
      .map(([campo, mensagens]) => [campos[campo], mensagens.join(' ')]),
  );
}
