import * as Keychain from 'react-native-keychain';

const OPCOES = { service: 'br.icarus.sessao' };

export const armazenamentoSessao = {
  async ler() {
    const credenciais = await Keychain.getGenericPassword(OPCOES);
    if (!credenciais) return null;
    try {
      return JSON.parse(credenciais.password);
    } catch {
      await Keychain.resetGenericPassword(OPCOES);
      return null;
    }
  },
  async salvar(sessao) {
    const resultado = await Keychain.setGenericPassword(sessao.usuarioId, JSON.stringify(sessao), {
      ...OPCOES,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    if (!resultado) throw new Error('Não foi possível salvar a sessão com segurança.');
  },
  async remover() {
    await Keychain.resetGenericPassword(OPCOES);
  },
};
