import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { useSincronizacaoFuso } from '../state/SincronizadorDeFuso';

import { consultarMissao } from '../services/missoes';
import { useSessao } from '../state/SessaoContext';

export function useExecucaoMissao(missaoId, navigation, aoReceber) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const sincronizarFuso = useSincronizacaoFuso();
  const chave = `${usuarioId}:${missaoId}`;
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({ chave, carregando: true, dados: null, erro: '' });
  useEffect(() => {
    let ativa = true;
    let emFoco = navigation.isFocused?.() ?? true;
    let requisicao = 0;
    let pendente = null;
    async function carregar() {
      if (!emFoco || !usuarioId || pendente) return;
      setEstado({ chave, carregando: true, dados: null, erro: '' });
      const numero = ++requisicao;
      const controlador = new AbortController();
      pendente = controlador;
      try {
        if (sincronizarFuso) await sincronizarFuso();
        if (!ativa || numero !== requisicao) return;
        const dados = await consultarMissao({
          usuarioId,
          missaoId,
          requisitarAutenticado,
          signal: controlador.signal,
        });
        if (!ativa || numero !== requisicao) return;
        if (!dados?.execucao) throw new Error('Disponibilidade ausente');
        setEstado({ chave, carregando: false, dados, erro: '' });
        aoReceber?.(missaoId, dados);
      } catch (erro) {
        if (ativa && numero === requisicao)
          setEstado({
            chave,
            carregando: false,
            dados: null,
            erro:
              erro.status === 404
                ? 'Esta missão não está mais disponível.'
                : 'Não foi possível carregar a execução. Tente novamente.',
          });
      } finally {
        if (pendente === controlador) pendente = null;
      }
    }
    carregar();
    const foco = navigation.addListener?.('focus', () => {
      emFoco = true;
      carregar();
    });
    const desfoco = navigation.addListener?.('blur', () => {
      emFoco = false;
      requisicao++;
      pendente?.abort();
      pendente = null;
    });
    const assinatura = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') carregar();
    });
    // Uma tela que atravessa a virada do dia também consulta novamente a disponibilidade.
    const intervalo = setInterval(() => {
      if (AppState.currentState === 'active') carregar();
    }, 60000);
    return () => {
      ativa = false;
      requisicao++;
      pendente?.abort();
      pendente = null;
      foco?.();
      desfoco?.();
      assinatura.remove();
      clearInterval(intervalo);
    };
  }, [
    chave,
    missaoId,
    navigation,
    usuarioId,
    requisitarAutenticado,
    tentativa,
    aoReceber,
    sincronizarFuso,
  ]);

  function atualizar() {
    setEstado({ chave, carregando: true, dados: null, erro: '' });
    setTentativa((valor) => valor + 1);
  }
  return {
    ...(estado.chave === chave ? estado : { carregando: true, dados: null, erro: '' }),
    atualizar,
  };
}
