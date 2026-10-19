import { paraDataIso } from '../utils/dateInput';
import { apiClient } from './apiClient';

export async function cadastrar({ nome, email, senha, dataNascimento }) {
  const resposta = await apiClient.post('/api/auth/cadastro', {
    nome,
    email,
    senha,
    dataNascimento: paraDataIso(dataNascimento),
  });

  return { usuarioId: resposta.usuarioId };
}

export async function login({ email, senha }) {
  const resposta = await apiClient.post('/api/auth/login', { email, senha });

  return {
    accessToken: resposta.accessToken,
    accessTokenExpiraEm: resposta.accessTokenExpiraEm,
    refreshToken: resposta.refreshToken,
    refreshTokenExpiraEm: resposta.refreshTokenExpiraEm,
  };
}

/** Login não devolve o id do usuário (só os tokens) — /api/auth/me o resolve a partir do token. */
export async function obterUsuarioAutenticado(accessToken) {
  const resposta = await apiClient.get('/api/auth/me', { token: accessToken });
  return resposta.usuarioId;
}
