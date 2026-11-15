import { TextDecoder, TextEncoder } from 'util';

import { convertFormDataAsync } from 'expo/src/winter/fetch/convertFormData';

import { criarApi } from './api';
import { atualizarFotoPerfil, obterFotoPerfil } from './perfil';
import { criarServicoSessao } from './sessao';

// Apenas a leitura nativa do arquivo é simulada; a serialização multipart é a do Expo.
jest.mock('expo-file-system', () => ({
  File: class {
    constructor(uri) {
      this.uri = uri;
      this.name = uri.split('/').pop();
      this.type = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
    }
    async bytes() {
      return new Uint8Array([65, 66, 67]);
    }
  },
}));

const { installFormDataPatch } = jest.requireActual('expo/src/winter/FormData');
const FormDataNativo = jest.requireActual('react-native/Libraries/Network/FormData').default;
const formDataOriginal = global.FormData;
beforeAll(() => {
  global.FormData = installFormDataPatch(FormDataNativo);
});
afterAll(() => {
  global.FormData = formDataOriginal;
});
global.TextEncoder ??= TextEncoder;
global.TextDecoder ??= TextDecoder;

it.each([
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
])('envia os bytes da foto %s com autenticação e tipo correto no Expo', async (extensao, tipo) => {
  let multipart;
  const executarFetch = jest.fn(async (_url, opcoes) => {
    const { body } = await convertFormDataAsync(opcoes.body);
    multipart = new TextDecoder().decode(body);
    return { ok: true, status: 204 };
  });
  const api = criarApi({ urlBase: 'https://api.exemplo.com', executarFetch });

  await atualizarFotoPerfil({
    usuarioId: 'pessoa-a',
    uri: `file:///cache/foto.${extensao}`,
    requisitarAutenticado: (caminho, opcoes) => api(caminho, { ...opcoes, token: 'acesso' }),
  });

  expect(executarFetch).toHaveBeenCalledWith(
    'https://api.exemplo.com/api/usuarios/pessoa-a/foto',
    expect.objectContaining({
      method: 'PUT',
      headers: { Accept: 'application/json', Authorization: 'Bearer acesso' },
    }),
  );
  expect(multipart).toContain(`name="arquivo"; filename="foto.${extensao}"`);
  expect(multipart).toContain(`content-type: ${tipo}`);
  expect(multipart).toContain('\r\n\r\nABC\r\n');
  expect(multipart).not.toContain('file:///cache');
});

it('renova a sessão ao buscar a foto e entrega os bytes para exibição sem nova requisição nativa', async () => {
  const expiraEm = new Date(Date.now() + 900000).toISOString();
  const renovacaoExpiraEm = new Date(Date.now() + 86400000).toISOString();
  const executarFetch = jest.fn(async (url, opcoes) => {
    if (url.endsWith('/me'))
      return { ok: true, status: 200, json: async () => ({ usuarioId: 'pessoa-a' }) };
    if (url.endsWith('/refresh'))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'acesso-novo',
          accessTokenExpiraEm: expiraEm,
          refreshToken: 'renovacao-nova',
          refreshTokenExpiraEm: renovacaoExpiraEm,
        }),
      };
    if (opcoes.headers.Authorization === 'Bearer acesso-antigo')
      return { ok: false, status: 401, json: async () => ({}) };
    return {
      ok: true,
      status: 200,
      headers: new Headers({ 'Content-Type': 'image/png' }),
      arrayBuffer: async () => new Uint8Array([65, 66, 67]).buffer,
    };
  });
  const servico = criarServicoSessao({
    api: criarApi({ urlBase: 'https://api.exemplo.com', executarFetch }),
    armazenamento: {
      ler: async () => ({
        usuarioId: 'pessoa-a',
        accessToken: 'acesso-antigo',
        refreshToken: 'renovacao',
        expiraEm,
        renovacaoExpiraEm,
      }),
      salvar: async () => {},
    },
  });
  await servico.restaurar();
  const foto = await obterFotoPerfil({
    usuarioId: 'pessoa-a',
    requisitarAutenticado: servico.requisitarAutenticado,
  });
  expect(foto).toBe('data:image/png;base64,QUJD');
  const buscas = executarFetch.mock.calls.filter(([url]) => url.endsWith('/foto'));
  expect(buscas.map(([, opcoes]) => opcoes.headers.Authorization)).toEqual([
    'Bearer acesso-antigo',
    'Bearer acesso-novo',
  ]);
  expect(buscas[1][1].headers['Cache-Control']).toBe('no-cache');
});
