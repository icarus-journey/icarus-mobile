import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { criarServicoDiario, mensagemDiario } from '../services/diario';
import { useSessao } from './SessaoContext';

const DiariosContext = createContext(null);
const ordenar = (entradas) =>
  [...entradas].sort(
    (a, b) =>
      b.dataRegistro.localeCompare(a.dataRegistro) ||
      b.criadaEm.localeCompare(a.criadaEm) ||
      b.id - a.id,
  );

export function DiariosProvider({ children }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  return (
    <DadosDoDiario
      key={usuarioId ?? 'visitante'}
      usuarioId={usuarioId}
      requisitarAutenticado={requisitarAutenticado}
    >
      {children}
    </DadosDoDiario>
  );
}

function DadosDoDiario({ children, usuarioId, requisitarAutenticado }) {
  const servico = useMemo(
    () => criarServicoDiario({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const [entradas, setEntradas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const requisicao = useRef(0);
  const ocupado = useRef(false);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const recarregar = useCallback(async () => {
    if (!usuarioId || ocupado.current) return;
    const numero = ++requisicao.current;
    const atual = () => montado.current && numero === requisicao.current;
    setCarregando(true);
    setErro('');
    try {
      const resultado = await servico.listar();
      if (atual()) setEntradas(resultado);
    } catch {
      if (atual())
        setErro('Não foi possível carregar seu diário. Confira a conexão e tente novamente.');
    } finally {
      if (atual()) setCarregando(false);
    }
  }, [servico, usuarioId]);

  async function executar(operacao, aplicar) {
    if (!usuarioId || ocupado.current) return false;
    ocupado.current = true;
    const numero = ++requisicao.current;
    const atual = () => montado.current && numero === requisicao.current;
    setEnviando(true);
    setCarregando(false);
    setErro('');
    try {
      const resultado = await operacao();
      if (!atual()) return false;
      setEntradas((anteriores) => ordenar(aplicar(anteriores, resultado)));
      return true;
    } catch (falha) {
      if (atual()) setErro(mensagemDiario(falha));
      return false;
    } finally {
      if (atual()) {
        ocupado.current = false;
        setEnviando(false);
      }
    }
  }

  return (
    <DiariosContext.Provider
      value={{
        entradas,
        carregando,
        enviando,
        erro,
        recarregar,
        adicionarEntrada: (dados) =>
          executar(
            () => servico.criar(dados),
            (anteriores, entrada) => [entrada, ...anteriores],
          ),
        atualizarEntrada: (id, dados) =>
          executar(
            () => servico.atualizar(id, dados),
            (anteriores, entrada) => anteriores.map((item) => (item.id === id ? entrada : item)),
          ),
        excluirEntrada: (id) =>
          executar(
            () => servico.excluir(id),
            (anteriores) => anteriores.filter((item) => item.id !== id),
          ),
      }}
    >
      {children}
    </DiariosContext.Provider>
  );
}

export function useDiarios() {
  const contexto = useContext(DiariosContext);
  if (!contexto) throw new Error('useDiarios deve ser usado dentro de um DiariosProvider');
  return contexto;
}
