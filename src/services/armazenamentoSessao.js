import * as SecureStore from 'expo-secure-store';

const CHAVE = 'br.icarus.sessao';

export const armazenamentoSessao = {
  async ler() {
    const valor = await SecureStore.getItemAsync(CHAVE);
    if (!valor) return null;
    try {
      return JSON.parse(valor);
    } catch {
      await SecureStore.deleteItemAsync(CHAVE);
      return null;
    }
  },
  async salvar(sessao) {
    await SecureStore.setItemAsync(CHAVE, JSON.stringify(sessao), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async remover() {
    await SecureStore.deleteItemAsync(CHAVE);
  },
};
