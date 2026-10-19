import { ErroApi } from './api';

function sessaoValida(sessao) {
  return (
    typeof sessao?.usuarioId === 'string' &&
    typeof sessao.accessToken === 'string' &&
    sessao.accessToken.length > 0 &&
    typeof sessao.refreshToken === 'string' &&
    sessao.refreshToken.length > 0 &&
    Number.isFinite(Date.parse(sessao.expiraEm)) &&
    Number.isFinite(Date.parse(sessao.renovacaoExpiraEm))
  );
}

function montarSessao(resposta, usuarioId) {
  return {
    usuarioId,
    accessToken: resposta?.accessToken,
    expiraEm: resposta?.accessTokenExpiraEm,
    refreshToken: resposta?.refreshToken,
    renovacaoExpiraEm: resposta?.refreshTokenExpiraEm,
  };
}

// Uma instância por aplicativo: renovações simultâneas compartilham a mesma requisição.
export function criarServicoSessao({ api, armazenamento, agora = Date.now }) {
  let sessao = null;
  let versao = 0;
  let renovacao = null;
  let escrita = Promise.resolve();
  const ouvintes = new Set();

  function publicar(valor) {
    sessao = valor;
    ouvintes.forEach((ouvinte) => ouvinte(valor));
  }

  function gravar(operacao) {
    escrita = escrita.catch(() => {}).then(operacao);
    return escrita;
  }

  function conferirVersao(revisao) {
    if (revisao !== versao) throw new ErroApi('A sessão foi encerrada. Entre novamente.', 401);
  }

  async function revogarRemotamente(valor) {
    if (valor?.refreshToken) {
      await api('/api/auth/logout', {
        metodo: 'POST',
        corpo: { refreshToken: valor.refreshToken },
      }).catch(() => {});
    }
  }

  async function persistir(valor, revisao) {
    if (!sessaoValida(valor)) throw new ErroApi('O serviço retornou uma sessão inválida.');
    await gravar(async () => {
      if (revisao !== versao) return;
      try {
        await armazenamento.salvar(valor);
      } catch {
        await revogarRemotamente(valor);
        throw new ErroApi('Não foi possível salvar a sessão com segurança. Tente novamente.');
      }
      if (revisao === versao) publicar(valor);
    });
    if (revisao !== versao) {
      await revogarRemotamente(valor);
      throw new ErroApi('A sessão foi encerrada. Entre novamente.', 401);
    }
    return valor;
  }

  async function invalidar(revisao) {
    if (revisao !== versao) return;
    versao += 1;
    publicar(null);
    await gravar(() => armazenamento.remover());
  }

  async function renovar(valor = sessao) {
    if (renovacao) return renovacao;
    const revisao = versao;
    renovacao = (async () => {
      if (!sessaoValida(valor) || Date.parse(valor.renovacaoExpiraEm) <= agora()) {
        await invalidar(revisao);
        throw new ErroApi('Sua sessão expirou. Entre novamente.', 401);
      }
      try {
        const nova = await api('/api/auth/refresh', {
          metodo: 'POST',
          corpo: { refreshToken: valor.refreshToken },
        });
        return await persistir(montarSessao(nova, valor.usuarioId), revisao);
      } catch (erro) {
        if (erro.status === 401) await invalidar(revisao);
        throw erro;
      }
    })().finally(() => {
      renovacao = null;
    });
    return renovacao;
  }

  async function requisitarAutenticado(caminho, opcoes) {
    const revisao = versao;
    if (!sessao) throw new ErroApi('Entre para continuar.', 401);
    let atual = sessao;
    if (Date.parse(atual.expiraEm) <= agora() + 30000) atual = await renovar();
    conferirVersao(revisao);
    try {
      const resposta = await api(caminho, { ...opcoes, token: atual.accessToken });
      conferirVersao(revisao);
      return resposta;
    } catch (erro) {
      if (erro.status !== 401 || revisao !== versao) throw erro;
      // Outra requisição pode já ter renovado o token enquanto esta aguardava a API.
      atual = sessao?.accessToken !== atual.accessToken ? sessao : await renovar();
      conferirVersao(revisao);
      try {
        const resposta = await api(caminho, { ...opcoes, token: atual.accessToken });
        conferirVersao(revisao);
        return resposta;
      } catch (novaFalha) {
        if (novaFalha.status === 401) await invalidar(revisao);
        throw novaFalha;
      }
    }
  }

  return {
    observar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    async cadastrar({ name, email, password, birthDate }) {
      const [dia, mes, ano] = birthDate.split('/');
      return api('/api/auth/cadastro', {
        metodo: 'POST',
        corpo: {
          nome: name.trim(),
          email: email.trim().toLowerCase(),
          senha: password,
          dataNascimento: `${ano}-${mes}-${dia}`,
        },
      });
    },
    async entrar(email, senha) {
      const revisao = ++versao;
      const resposta = await api('/api/auth/login', {
        metodo: 'POST',
        corpo: { email: email.trim().toLowerCase(), senha },
      });
      const identidade = await api('/api/auth/me', { token: resposta?.accessToken });
      const nova = montarSessao(resposta, identidade?.usuarioId);
      return persistir(nova, revisao);
    },
    async restaurar() {
      const revisao = versao;
      const salva = sessao ?? (await armazenamento.ler());
      if (!salva) return null;
      if (!sessaoValida(salva) || Date.parse(salva.renovacaoExpiraEm) <= agora()) {
        await invalidar(revisao);
        return null;
      }
      try {
        const atual = Date.parse(salva.expiraEm) <= agora() + 30000 ? await renovar(salva) : salva;
        let identidade;
        try {
          identidade = await api('/api/auth/me', { token: atual.accessToken });
        } catch (erro) {
          if (erro.status !== 401) throw erro;
          const nova = await renovar(atual);
          identidade = await api('/api/auth/me', { token: nova.accessToken });
          if (identidade?.usuarioId !== nova.usuarioId) throw new ErroApi('Sessão inválida.', 401);
          return revisao === versao ? nova : sessao;
        }
        if (identidade?.usuarioId !== atual.usuarioId) throw new ErroApi('Sessão inválida.', 401);
        if (revisao === versao) publicar(atual);
        return revisao === versao ? atual : sessao;
      } catch (erro) {
        if (erro.status === 401) {
          await invalidar(revisao);
          return sessao;
        }
        throw erro;
      }
    },
    async sair() {
      const anterior = sessao ?? (await armazenamento.ler());
      ++versao;
      // A remoção precisa terminar antes de liberar outro login ou confirmar a saída.
      await gravar(() => armazenamento.remover());
      publicar(null);
      await revogarRemotamente(anterior);
    },
    renovar,
    requisitarAutenticado,
  };
}
