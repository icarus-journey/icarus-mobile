import * as SecureStore from 'expo-secure-store';

const CHAVE_ACCESS_TOKEN = 'icarus.accessToken';
const CHAVE_ACCESS_TOKEN_EXPIRA_EM = 'icarus.accessTokenExpiraEm';
const CHAVE_REFRESH_TOKEN = 'icarus.refreshToken';
const CHAVE_REFRESH_TOKEN_EXPIRA_EM = 'icarus.refreshTokenExpiraEm';
const CHAVE_USUARIO_ID = 'icarus.usuarioId';

export async function salvarSessao({
  usuarioId,
  accessToken,
  accessTokenExpiraEm,
  refreshToken,
  refreshTokenExpiraEm,
}) {
  await Promise.all([
    SecureStore.setItemAsync(CHAVE_USUARIO_ID, usuarioId),
    SecureStore.setItemAsync(CHAVE_ACCESS_TOKEN, accessToken),
    SecureStore.setItemAsync(CHAVE_ACCESS_TOKEN_EXPIRA_EM, accessTokenExpiraEm),
    SecureStore.setItemAsync(CHAVE_REFRESH_TOKEN, refreshToken),
    SecureStore.setItemAsync(CHAVE_REFRESH_TOKEN_EXPIRA_EM, refreshTokenExpiraEm),
  ]);
}

export async function lerSessao() {
  const [usuarioId, accessToken, accessTokenExpiraEm, refreshToken, refreshTokenExpiraEm] =
    await Promise.all([
      SecureStore.getItemAsync(CHAVE_USUARIO_ID),
      SecureStore.getItemAsync(CHAVE_ACCESS_TOKEN),
      SecureStore.getItemAsync(CHAVE_ACCESS_TOKEN_EXPIRA_EM),
      SecureStore.getItemAsync(CHAVE_REFRESH_TOKEN),
      SecureStore.getItemAsync(CHAVE_REFRESH_TOKEN_EXPIRA_EM),
    ]);

  if (!usuarioId || !accessToken || !refreshToken) {
    return null;
  }

  return { usuarioId, accessToken, accessTokenExpiraEm, refreshToken, refreshTokenExpiraEm };
}

export async function limparSessao() {
  await Promise.all([
    SecureStore.deleteItemAsync(CHAVE_USUARIO_ID),
    SecureStore.deleteItemAsync(CHAVE_ACCESS_TOKEN),
    SecureStore.deleteItemAsync(CHAVE_ACCESS_TOKEN_EXPIRA_EM),
    SecureStore.deleteItemAsync(CHAVE_REFRESH_TOKEN),
    SecureStore.deleteItemAsync(CHAVE_REFRESH_TOKEN_EXPIRA_EM),
  ]);
}
