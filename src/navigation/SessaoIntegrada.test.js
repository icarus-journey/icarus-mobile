import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { ConteudoDaSessao } from '../../App';
import { criarApi } from '../services/api';
import { criarServicoSessao } from '../services/sessao';
import { SessaoProvider } from '../state/SessaoContext';
import { SessaoGate } from './SessaoGate';

function iniciar({ salva = null, semConexao = false } = {}) {
  let armazenada = salva;
  let conta = 'a';
  const armazenamento = {
    ler: async () => armazenada,
    salvar: async (sessao) => {
      armazenada = sessao;
    },
    remover: async () => {
      armazenada = null;
    },
  };
  const executarFetch = jest.fn(async (url, opcoes) => {
    if (semConexao) throw new Error('Sem rede');
    if (url.endsWith('/login')) {
      const credenciais = JSON.parse(opcoes.body);
      if (credenciais.senha === 'errada') return { ok: false, status: 401, json: async () => ({}) };
      return {
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: `acesso-${conta}`,
          accessTokenExpiraEm: new Date(Date.now() + 900000).toISOString(),
          refreshToken: `renovacao-${conta}`,
          refreshTokenExpiraEm: new Date(Date.now() + 86400000).toISOString(),
        }),
      };
    }
    if (url.endsWith('/logout')) return { ok: true, status: 204 };
    if (url.endsWith(`/api/usuarios/usuario-${conta}`))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: `usuario-${conta}`,
          nome: `Pessoa ${conta}`,
          email: `${conta}@exemplo.com`,
          dataNascimento: '2000-01-01',
          estuda: null,
          trabalha: null,
        }),
      };
    return { ok: true, status: 200, json: async () => ({ usuarioId: `usuario-${conta}` }) };
  });
  const servico = criarServicoSessao({
    api: criarApi({ urlBase: 'https://api.exemplo.com', executarFetch }),
    armazenamento,
  });
  const resultado = render(
    <SessaoProvider servico={servico}>
      <SessaoGate>
        <ConteudoDaSessao />
      </SessaoGate>
    </SessaoProvider>,
  );
  return {
    ...resultado,
    executarFetch,
    ficarSemConexao: () => {
      semConexao = true;
    },
    outraConta: () => {
      conta = 'b';
    },
  };
}

async function entrar(senha = 'senha1234') {
  await screen.findByLabelText('E-mail');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@exemplo.com');
  fireEvent.changeText(screen.getByLabelText('Senha'), senha);
  fireEvent.press(screen.getByLabelText('Entrar na minha jornada'));
}

it('bloqueia credenciais incorretas e abre as telas privadas somente após a resposta da API', async () => {
  iniciar();
  await entrar('errada');
  expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
  expect(screen.queryByText('Seus próximos passos.')).toBeNull();
  await entrar();
  expect(await screen.findByText('Seus próximos passos.')).toBeTruthy();
  expect(screen.queryByLabelText('Senha')).toBeNull();
});

it('limpa o diário e a navegação ao sair e entrar com outra conta', async () => {
  const { outraConta } = iniciar();
  await entrar();
  await screen.findByText('Seus próximos passos.');
  fireEvent.press(screen.getByLabelText('Diário'));
  fireEvent.changeText(
    screen.getByLabelText('Reflexão de hoje'),
    'Reflexão privada da primeira conta',
  );
  fireEvent.press(screen.getByLabelText('Registrar reflexão'));
  expect(screen.getByText('Reflexão privada da primeira conta')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Perfil'));
  await screen.findByLabelText('Nome: Pessoa a');
  fireEvent.press(screen.getByLabelText('Sair da conta'));
  fireEvent.press(screen.getByLabelText('Cancelar'));
  expect(screen.getByLabelText('Nome: Pessoa a')).toBeTruthy();
  fireEvent.press(screen.getByLabelText('Sair da conta'));
  fireEvent.press(screen.getByLabelText('Sim, sair da conta'));
  await screen.findByLabelText('E-mail');
  outraConta();
  await entrar();
  await screen.findByText('Seus próximos passos.');
  fireEvent.press(screen.getByLabelText('Diário'));
  expect(screen.queryByText('Reflexão privada da primeira conta')).toBeNull();
  fireEvent.press(screen.getByLabelText('Perfil'));
  expect(await screen.findByLabelText('Nome: Pessoa b')).toBeTruthy();
  expect(screen.queryByText('Pessoa a')).toBeNull();
});

it('permite tentar novamente sem liberar telas privadas se a restauração estiver sem rede', async () => {
  iniciar({
    semConexao: true,
    salva: {
      usuarioId: 'usuario-a',
      accessToken: 'acesso',
      refreshToken: 'renovacao',
      expiraEm: new Date(Date.now() + 900000).toISOString(),
      renovacaoExpiraEm: new Date(Date.now() + 86400000).toISOString(),
    },
  });
  await waitFor(() => expect(screen.getByLabelText('Tentar novamente')).toBeTruthy());
  expect(screen.queryByText('Seus próximos passos.')).toBeNull();
});

it('confirma a saída e volta ao login mesmo sem rede', async () => {
  const { ficarSemConexao } = iniciar();
  await entrar();
  await screen.findByText('Seus próximos passos.');
  ficarSemConexao();
  fireEvent.press(screen.getByLabelText('Perfil'));
  await screen.findByText(/Não foi possível carregar seu perfil/);
  fireEvent.press(screen.getByLabelText('Sair da conta'));
  fireEvent.press(screen.getByLabelText('Sim, sair da conta'));
  expect(await screen.findByLabelText('Entrar na minha jornada')).toBeTruthy();
  expect(screen.queryByText('Perfil e configurações')).toBeNull();
});
