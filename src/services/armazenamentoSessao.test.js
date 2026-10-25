import * as Keychain from 'react-native-keychain';

import { armazenamentoSessao } from './armazenamentoSessao';

const OPCOES = { service: 'br.icarus.sessao' };

describe('armazenamento de sessão no cliente nativo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retorna ausência quando não há credencial salva', async () => {
    await expect(armazenamentoSessao.ler()).resolves.toBeNull();
  });

  it('recupera a sessão existente no mesmo serviço', async () => {
    const sessao = { usuarioId: 'conta-teste', token: 'token-ficticio' };
    Keychain.getGenericPassword.mockResolvedValueOnce({ password: JSON.stringify(sessao) });

    await expect(armazenamentoSessao.ler()).resolves.toEqual(sessao);
    expect(Keychain.getGenericPassword).toHaveBeenCalledWith(OPCOES);
  });

  it('remove credencial corrompida sem expor seu conteúdo', async () => {
    Keychain.getGenericPassword.mockResolvedValueOnce({ password: '{invalido' });

    await expect(armazenamentoSessao.ler()).resolves.toBeNull();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(OPCOES);
  });

  it('salva com proteção do dispositivo desbloqueado', async () => {
    const sessao = { usuarioId: 'conta-teste', token: 'token-ficticio' };

    await armazenamentoSessao.salvar(sessao);

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      sessao.usuarioId,
      JSON.stringify(sessao),
      { ...OPCOES, accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY },
    );
  });

  it('não confirma salvamento recusado pelo armazenamento seguro', async () => {
    Keychain.setGenericPassword.mockResolvedValueOnce(false);

    await expect(armazenamentoSessao.salvar({ usuarioId: 'conta-teste' })).rejects.toThrow(
      'Não foi possível salvar a sessão com segurança.',
    );
  });

  it('remove a credencial do mesmo serviço ao sair', async () => {
    await armazenamentoSessao.remover();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(OPCOES);
  });
});
