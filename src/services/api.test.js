import { criarApi, errosDoFormulario, ErroApi } from './api';

describe('cliente HTTP', () => {
  it('envia JSON e Bearer para o endereço configurado', async () => {
    const executarFetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ usuarioId: 'usuario' }),
    }));
    const api = criarApi({ urlBase: 'https://api.exemplo.com/', executarFetch });
    await api('/api/auth/me', { token: 'acesso' });
    expect(executarFetch).toHaveBeenCalledWith(
      'https://api.exemplo.com/api/auth/me',
      expect.objectContaining({
        headers: { Accept: 'application/json', Authorization: 'Bearer acesso' },
      }),
    );
  });

  it.each([409, 429, 500])('traduz HTTP %s sem exibir detalhes internos', async (status) => {
    const api = criarApi({
      urlBase: 'https://api.exemplo.com',
      executarFetch: async () => ({
        ok: false,
        status,
        json: async () => ({ detail: 'Detalhe interno do servidor' }),
      }),
    });
    await expect(api('/api/auth/login')).rejects.toMatchObject({ status });
    await expect(api('/api/auth/login')).rejects.not.toThrow('Detalhe interno');
  });

  it('mapeia somente os campos reconhecidos de ValidationProblemDetails', () => {
    expect(
      errosDoFormulario(
        new ErroApi('Inválido', 400, {
          nome: ['Informe o nome'],
          dataNascimento: ['Informe a data'],
          '$.dataNascimento': ['Tipo interno'],
        }),
      ),
    ).toEqual({ name: 'Informe o nome', birthDate: 'Informe a data' });
  });

  it('envia FormData sem forçar Content-Type (o fetch define o boundary sozinho)', async () => {
    const executarFetch = jest.fn(async () => ({
      ok: true,
      status: 204,
      json: async () => null,
    }));
    const api = criarApi({ urlBase: 'https://api.exemplo.com', executarFetch });
    const formData = new FormData();
    formData.append('arquivo', 'conteudo-fake');

    await api('/api/usuarios/usuario/foto', { metodo: 'PUT', corpoFormData: formData, token: 'acesso' });

    expect(executarFetch).toHaveBeenCalledWith(
      'https://api.exemplo.com/api/usuarios/usuario/foto',
      expect.objectContaining({
        method: 'PUT',
        body: formData,
        headers: { Accept: 'application/json', Authorization: 'Bearer acesso' },
      }),
    );
  });

  it('interrompe uma conexão que ultrapassa o limite', async () => {
    jest.useFakeTimers();
    const executarFetch = (_, { signal }) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () =>
          reject(Object.assign(new Error(), { name: 'AbortError' })),
        );
      });
    const api = criarApi({ urlBase: 'https://api.exemplo.com', executarFetch, tempoLimite: 100 });
    const resultado = expect(api('/api/auth/login')).rejects.toThrow('demorou demais');
    await jest.advanceTimersByTimeAsync(100);
    await resultado;
    jest.useRealTimers();
  });
});
