import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  criarServicoProgressoCampanha,
  mensagemProgressoCampanha,
} from '../../services/progressoCampanha';
import { criarOperacaoId } from '../../utils/criarOperacaoId';
import { lerValorProgresso } from '../../utils/valorProgresso';

export function useProgressoCampanha({
  usuarioId,
  campanhaId,
  requisitarAutenticado,
  aoAtualizar,
}) {
  const servico = useMemo(
    () => criarServicoProgressoCampanha({ usuarioId, campanhaId, requisitarAutenticado }),
    [usuarioId, campanhaId, requisitarAutenticado],
  );
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const montado = useRef(true);
  const ocupado = useRef(false);
  const requisicao = useRef(0);
  const operacao = useRef(null);

  const aplicar = useCallback(
    (resposta) => {
      setDados(resposta);
      aoAtualizar(campanhaId, resposta);
    },
    [aoAtualizar, campanhaId],
  );

  const carregar = useCallback(() => {
    if (!usuarioId || ocupado.current) return;
    const numero = ++requisicao.current;
    const atual = () => montado.current && numero === requisicao.current;
    return servico
      .consultar()
      .then((resposta) => {
        if (atual()) aplicar(resposta);
      })
      .catch((falha) => {
        if (atual())
          setErro(
            falha.status === 401 || falha.status === 404
              ? mensagemProgressoCampanha(falha)
              : 'Não foi possível carregar seu progresso. Tente novamente.',
          );
      })
      .finally(() => {
        if (atual()) setCarregando(false);
      });
  }, [servico, usuarioId, aplicar]);

  useFocusEffect(
    useCallback(() => {
      montado.current = true;
      ocupado.current = false;
      setEnviando(false);
      setCarregando(true);
      setErro('');
      carregar();
      return () => {
        montado.current = false;
        requisicao.current += 1;
      };
    }, [carregar]),
  );

  function recarregar() {
    if (ocupado.current) return;
    setCarregando(true);
    setErro('');
    return carregar();
  }

  function alterarValor(texto) {
    setValor(texto);
    operacao.current = null;
    setSucesso('');
  }

  function abrirRegistro() {
    operacao.current = null;
    setValor(dados?.valorAtual == null ? '' : String(dados.valorAtual).replace('.', ','));
    setEditando(true);
    setSucesso('');
    setErro('');
  }

  async function registrar() {
    if (ocupado.current || !dados?.podeRegistrar) return;
    const numero = lerValorProgresso(valor);
    if (numero == null) {
      setErro('Informe um valor a partir de zero, com até duas casas decimais.');
      return;
    }
    ocupado.current = true;
    const tentativa = ++requisicao.current;
    operacao.current ??= criarOperacaoId();
    setEnviando(true);
    setErro('');
    setSucesso('');
    try {
      const resposta = await servico.registrar({
        valorAtual: numero,
        versaoEsperada: dados.versao,
        operacaoId: operacao.current,
      });
      if (!montado.current || tentativa !== requisicao.current) return;
      aplicar(resposta);
      operacao.current = null;
      setEditando(false);
      setSucesso('Progresso registrado.');
    } catch (falha) {
      if (montado.current && tentativa === requisicao.current)
        setErro(mensagemProgressoCampanha(falha));
    } finally {
      if (montado.current && tentativa === requisicao.current) {
        ocupado.current = false;
        setEnviando(false);
      }
    }
  }

  return {
    dados,
    carregando,
    enviando,
    editando,
    valor,
    erro,
    sucesso,
    recarregar,
    alterarValor,
    abrirRegistro,
    registrar,
    cancelar: () => setEditando(false),
  };
}
