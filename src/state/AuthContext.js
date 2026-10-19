import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { cadastrar, login, obterUsuarioAutenticado } from '../services/autenticacao';
import { lerSessao, limparSessao, salvarSessao } from '../services/armazenamentoToken';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarioId, setUsuarioId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    let montado = true;

    lerSessao().then((sessao) => {
      if (!montado) return;
      if (sessao) {
        setUsuarioId(sessao.usuarioId);
        setAccessToken(sessao.accessToken);
      }
      setCarregandoSessao(false);
    });

    return () => {
      montado = false;
    };
  }, []);

  const entrar = useCallback(async (email, senha) => {
    const resultado = await login({ email, senha });
    const usuarioIdAutenticado = await obterUsuarioAutenticado(resultado.accessToken);

    await salvarSessao({ usuarioId: usuarioIdAutenticado, ...resultado });
    setUsuarioId(usuarioIdAutenticado);
    setAccessToken(resultado.accessToken);

    return usuarioIdAutenticado;
  }, []);

  const registrar = useCallback(
    async ({ nome, email, senha, dataNascimento }) => {
      // POST /api/auth/cadastro não devolve sessão (só o id) — entra em seguida com as
      // mesmas credenciais pra já existir um token válido quando o onboarding começar.
      await cadastrar({ nome, email, senha, dataNascimento });
      return entrar(email, senha);
    },
    [entrar],
  );

  const sair = useCallback(async () => {
    await limparSessao();
    setUsuarioId(null);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({ usuarioId, accessToken, carregandoSessao, entrar, registrar, sair }),
    [usuarioId, accessToken, carregandoSessao, entrar, registrar, sair],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
