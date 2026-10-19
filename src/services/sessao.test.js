import { ErroApi } from './api';
import { criarServicoSessao } from './sessao';

function criarSessao(alteracoes = {}) {
  return {
    usuarioId: 'usuario-a',
    accessToken: 'acesso-a',
    refreshToken: 'renovacao-a',
    expiraEm: new Date(Date.now() + 900000).toISOString(),
    renovacaoExpiraEm: new Date(Date.now() + 86400000).toISOString(),
    ...alteracoes,
  };
}

function respostaPlataforma(sessao) {
  return {
    accessToken: sessao.accessToken,
    accessTokenExpiraEm: sessao.expiraEm,
    refreshToken: sessao.refreshToken,
    refreshTokenExpiraEm: sessao.renovacaoExpiraEm,
  };
}

function preparar(salva = null) {
  let conteudo = salva;
  const armazenamento = {
    ler: jest.fn(async () => conteudo),
    salvar: jest.fn(async (valor) => {
      conteudo = valor;
    }),
    remover: jest.fn(async () => {
      conteudo = null;
    }),
  };
  const api = jest.fn(async () => null);
  const servico = criarServicoSessao({ api, armazenamento });
  const observar = jest.fn();
  servico.observar(observar);
  return { servico, api, armazenamento, observar };
}

describe('sessão integrada ao contrato da API', () => {
  it('mapeia o cadastro para o contrato existente, com data ISO e e-mail normalizado', async () => {
    const { servico, api } = preparar();
    await servico.cadastrar({
      name: ' Ana ',
      email: ' ANA@EXEMPLO.COM ',
      password: 'senha1234',
      birthDate: '31/12/2000',
    });
    expect(api).toHaveBeenCalledWith('/api/auth/cadastro', {
      metodo: 'POST',
      corpo: {
        nome: 'Ana',
        email: 'ana@exemplo.com',
        senha: 'senha1234',
        dataNascimento: '2000-12-31',
      },
    });
  });

  it('não armazena credenciais nem libera sessão quando o login é recusado', async () => {
    const { servico, api, armazenamento, observar } = preparar();
    api.mockRejectedValue(new ErroApi('Credenciais inválidas', 401));
    await expect(servico.entrar('ana@exemplo.com', 'errada')).rejects.toMatchObject({
      status: 401,
    });
    expect(armazenamento.salvar).not.toHaveBeenCalled();
    expect(observar).not.toHaveBeenCalled();
  });

  it('salva somente a sessão retornada e só então libera o acesso', async () => {
    const { servico, api, armazenamento, observar } = preparar();
    const sessao = criarSessao();
    api.mockResolvedValueOnce(respostaPlataforma(sessao)).mockResolvedValueOnce({
      usuarioId: sessao.usuarioId,
    });
    await servico.entrar('ana@exemplo.com', 'senha1234');
    expect(api).toHaveBeenCalledWith('/api/auth/me', { token: sessao.accessToken });
    expect(armazenamento.salvar).toHaveBeenCalledWith(sessao);
    expect(JSON.stringify(armazenamento.salvar.mock.calls)).not.toContain('senha1234');
    expect(observar).toHaveBeenLastCalledWith(sessao);
  });

  it('revoga a sessão recém-criada se o armazenamento seguro falhar', async () => {
    const { servico, api, armazenamento, observar } = preparar();
    api.mockResolvedValueOnce(respostaPlataforma(criarSessao())).mockResolvedValueOnce({
      usuarioId: 'usuario-a',
    });
    armazenamento.salvar.mockRejectedValue(new Error('Keystore indisponível'));
    await expect(servico.entrar('ana@exemplo.com', 'senha1234')).rejects.toThrow(
      'salvar a sessão com segurança',
    );
    expect(observar).not.toHaveBeenCalled();
    expect(api).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ corpo: { refreshToken: 'renovacao-a' } }),
    );
  });

  it('restaura a sessão somente depois de conferir a identidade no servidor', async () => {
    const salva = criarSessao();
    const { servico, api, observar } = preparar(salva);
    api.mockResolvedValue({ usuarioId: salva.usuarioId });
    expect(await servico.restaurar()).toEqual(salva);
    expect(api).toHaveBeenCalledWith('/api/auth/me', { token: salva.accessToken });
    expect(observar).toHaveBeenCalledWith(salva);
  });

  it('preserva a sessão armazenada se estiver sem conexão, sem liberar acesso', async () => {
    const { servico, api, armazenamento, observar } = preparar(criarSessao());
    api.mockRejectedValue(new ErroApi('Sem conexão'));
    await expect(servico.restaurar()).rejects.toThrow('Sem conexão');
    expect(armazenamento.remover).not.toHaveBeenCalled();
    expect(observar).not.toHaveBeenCalled();
  });

  it('renova o acesso expirado e descarta a sessão quando a renovação é recusada', async () => {
    const { servico, api, armazenamento } = preparar(
      criarSessao({ expiraEm: new Date(0).toISOString() }),
    );
    api.mockRejectedValue(new ErroApi('Sessão expirada', 401));
    expect(await servico.restaurar()).toBeNull();
    expect(api).toHaveBeenCalledWith('/api/auth/refresh', expect.anything());
    expect(armazenamento.remover).toHaveBeenCalled();
  });

  it('compartilha a renovação entre requisições concorrentes', async () => {
    const { servico, api } = preparar();
    api.mockResolvedValueOnce(respostaPlataforma(criarSessao())).mockResolvedValueOnce({
      usuarioId: 'usuario-a',
    });
    await servico.entrar('ana@exemplo.com', 'senha1234');
    const nova = criarSessao({ accessToken: 'novo', refreshToken: 'nova-renovacao' });
    api.mockResolvedValue(respostaPlataforma(nova));
    const respostas = await Promise.all([servico.renovar(), servico.renovar()]);
    expect(respostas).toEqual([nova, nova]);
    expect(api.mock.calls.filter(([rota]) => rota === '/api/auth/refresh')).toHaveLength(1);
  });

  it('não ressuscita uma sessão se a renovação terminar depois do logout', async () => {
    const { servico, api, armazenamento, observar } = preparar();
    api.mockResolvedValueOnce(respostaPlataforma(criarSessao())).mockResolvedValueOnce({
      usuarioId: 'usuario-a',
    });
    await servico.entrar('ana@exemplo.com', 'senha1234');
    let concluir;
    api.mockImplementation((rota) =>
      rota === '/api/auth/refresh'
        ? new Promise((resolve) => {
            concluir = resolve;
          })
        : Promise.resolve(null),
    );
    const pendente = servico.renovar();
    const rejeicao = expect(pendente).rejects.toMatchObject({ status: 401 });
    await servico.sair();
    concluir(respostaPlataforma(criarSessao({ refreshToken: 'nova-renovacao' })));
    await rejeicao;
    expect(await armazenamento.ler()).toBeNull();
    expect(observar).toHaveBeenLastCalledWith(null);
  });

  it('não restaura a sessão se a verificação de identidade terminar depois do logout', async () => {
    const { servico, api, armazenamento } = preparar(criarSessao());
    let concluir;
    api.mockImplementation((rota) =>
      rota === '/api/auth/me'
        ? new Promise((resolve) => {
            concluir = resolve;
          })
        : Promise.resolve(null),
    );
    const restauracao = servico.restaurar();
    await Promise.resolve();
    await servico.sair();
    concluir({ usuarioId: 'usuario-a' });
    expect(await restauracao).toBeNull();
    expect(await armazenamento.ler()).toBeNull();
  });

  it('renova e repete uma única vez uma requisição recusada com 401', async () => {
    const { servico, api, observar } = preparar();
    api.mockResolvedValueOnce(respostaPlataforma(criarSessao())).mockResolvedValueOnce({
      usuarioId: 'usuario-a',
    });
    await servico.entrar('ana@exemplo.com', 'senha1234');
    api
      .mockRejectedValueOnce(new ErroApi('Expirou', 401))
      .mockResolvedValueOnce(
        respostaPlataforma(criarSessao({ accessToken: 'novo', refreshToken: 'nova-renovacao' })),
      )
      .mockRejectedValueOnce(new ErroApi('Inválido', 401));
    await expect(servico.requisitarAutenticado('/api/auth/me')).rejects.toMatchObject({
      status: 401,
    });
    expect(api.mock.calls.filter(([rota]) => rota === '/api/auth/me')).toHaveLength(3);
    expect(observar).toHaveBeenLastCalledWith(null);
  });

  it('remove a sessão local mesmo que o servidor esteja indisponível no logout', async () => {
    const { servico, api, armazenamento, observar } = preparar();
    api.mockResolvedValueOnce(respostaPlataforma(criarSessao())).mockResolvedValueOnce({
      usuarioId: 'usuario-a',
    });
    await servico.entrar('ana@exemplo.com', 'senha1234');
    api.mockRejectedValue(new ErroApi('Sem conexão'));
    await servico.sair();
    expect(await armazenamento.ler()).toBeNull();
    expect(observar).toHaveBeenLastCalledWith(null);
  });
});
