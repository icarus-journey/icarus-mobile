import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { criarOperacaoId, criarServicoLoja, mensagemLoja } from '../services/loja';
import { useSessao } from './SessaoContext';

const LojaContext = createContext(null);

export function LojaProvider({ children }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const servico = useMemo(
    () => criarServicoLoja({ usuarioId: sessao?.usuarioId, requisitarAutenticado }),
    [sessao?.usuarioId, requisitarAutenticado],
  );
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const requisicao = useRef(0);
  const ocupado = useRef(false);
  const leitura = useRef(null);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      leitura.current?.abort();
    };
  }, []);
  const operacoes = useRef({});

  const recarregar = useCallback(async () => {
    if (ocupado.current || leitura.current) return;
    const numero = ++requisicao.current;
    const controlador = new AbortController();
    leitura.current = controlador;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await servico.consultar(controlador.signal);
      if (montado.current && numero === requisicao.current) setLoja(resultado);
    } catch {
      if (montado.current && numero === requisicao.current)
        setErro('Não foi possível carregar a loja. Confira a conexão e tente novamente.');
    } finally {
      if (montado.current && numero === requisicao.current) setCarregando(false);
      if (leitura.current === controlador) leitura.current = null;
    }
  }, [servico]);

  async function executar(operacao) {
    if (ocupado.current) return false;
    ocupado.current = true;
    const numero = ++requisicao.current;
    leitura.current?.abort();
    leitura.current = null;
    setCarregando(false);
    setEnviando(true);
    setErro('');
    try {
      const resultado = await operacao();
      if (!montado.current || numero !== requisicao.current) return false;
      setLoja(resultado);
      return true;
    } catch (falha) {
      if (montado.current && numero === requisicao.current) setErro(mensagemLoja(falha));
      return false;
    } finally {
      if (montado.current && numero === requisicao.current) {
        ocupado.current = false;
        setEnviando(false);
      }
    }
  }

  async function resgatar(id) {
    const chave = id ?? 'protecao';
    operacoes.current[chave] ??= criarOperacaoId();
    const sucesso = await executar(() => servico.resgatar(id, operacoes.current[chave]));
    if (sucesso) delete operacoes.current[chave];
    return sucesso;
  }

  return (
    <LojaContext.Provider
      value={{
        loja,
        carregando,
        enviando,
        erro,
        recarregar,
        resgatar,
        salvar: (dados, id) => executar(() => servico.salvar(dados, id)),
        excluir: (id) => executar(() => servico.excluir(id)),
        desfazer: (id) => executar(() => servico.desfazer(id)),
        utilizar: (id) => executar(() => servico.utilizar(id)),
      }}
    >
      {children}
    </LojaContext.Provider>
  );
}

export function useLoja() {
  const contexto = useContext(LojaContext);
  if (!contexto) throw new Error('useLoja deve ser usado dentro de LojaProvider.');
  return contexto;
}
