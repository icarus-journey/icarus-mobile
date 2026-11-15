import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { criarApi } from '../services/api';
import { armazenamentoSessao } from '../services/armazenamentoSessao';
import { criarServicoSessao } from '../services/sessao';

const servicoPadrao = criarServicoSessao({ api: criarApi(), armazenamento: armazenamentoSessao });
const SessaoContext = createContext(null);

export function SessaoProvider({ children, servico = servicoPadrao }) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erroRestauracao, setErroRestauracao] = useState('');
  const [novaConta, setNovaConta] = useState(false);

  const restaurar = useCallback(async () => {
    setCarregando(true);
    setErroRestauracao('');
    try {
      setSessao(await servico.restaurar());
    } catch {
      setErroRestauracao(
        'Não foi possível verificar sua sessão. Confira a conexão e tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  }, [servico]);

  useEffect(() => {
    let ativo = true;
    const cancelar = servico.observar(setSessao);
    servico
      .restaurar()
      .then((valor) => {
        if (ativo) setSessao(valor);
      })
      .catch(() => {
        if (ativo)
          setErroRestauracao(
            'Não foi possível verificar sua sessão. Confira a conexão e tente novamente.',
          );
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
      cancelar();
    };
  }, [servico]);

  useEffect(() => {
    if (!sessao) return;
    const renovar = async () => {
      try {
        await servico.renovar();
      } catch (erro) {
        if (erro.status !== 401)
          setErroRestauracao(
            'Não foi possível renovar sua sessão. Confira a conexão e tente novamente.',
          );
      }
    };
    const temporizador = setTimeout(
      renovar,
      Math.max(0, Date.parse(sessao.expiraEm) - Date.now() - 30000),
    );
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && Date.parse(sessao.expiraEm) <= Date.now() + 30000) renovar();
    });
    return () => {
      clearTimeout(temporizador);
      assinatura.remove();
    };
  }, [servico, sessao]);

  async function entrar(email, senha, aposCadastro = false) {
    setNovaConta(aposCadastro);
    await servico.entrar(email, senha);
    setErroRestauracao('');
  }

  async function sair() {
    setNovaConta(false);
    await servico.sair();
    setErroRestauracao('');
  }

  return (
    <SessaoContext.Provider
      value={{
        sessao,
        carregando,
        erroRestauracao,
        novaConta,
        entrar,
        cadastrar: servico.cadastrar,
        sair,
        restaurar,
        requisitarAutenticado: servico.requisitarAutenticado,
      }}
    >
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) throw new Error('useSessao deve ser usado dentro de um SessaoProvider');
  return contexto;
}
