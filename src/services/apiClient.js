const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5138';

/**
 * Erro normalizado a partir do ProblemDetails/ValidationProblemDetails que a API devolve.
 * `errors` (quando presente) é o mapa `{ campo: [mensagens] }` do FluentValidation.
 */
export class ErroApi extends Error {
  constructor({ status, title, detail, errors }) {
    super(detail || title || 'Não foi possível completar a solicitação.');
    this.status = status;
    this.title = title;
    this.errors = errors;
  }
}

async function solicitar(caminho, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ErroApi({ status: 0, title: 'Sem conexão com o servidor.' });
  }

  if (resposta.status === 204) {
    return null;
  }

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ErroApi({
      status: resposta.status,
      title: dados?.title,
      detail: dados?.detail,
      errors: dados?.errors,
    });
  }

  return dados;
}

export const apiClient = {
  get: (caminho, opcoes) => solicitar(caminho, { ...opcoes, method: 'GET' }),
  post: (caminho, body, opcoes) => solicitar(caminho, { ...opcoes, method: 'POST', body }),
};
