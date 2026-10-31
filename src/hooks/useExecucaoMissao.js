import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { consultarMissao } from '../services/missoes';
import { useSessao } from '../state/SessaoContext';

export function useExecucaoMissao(missaoId, navigation, aoReceber) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const chave = `${usuarioId}:${missaoId}`;
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({ chave, carregando: true, dados: null, erro: '' });
  useEffect(() => {
    let ativa = true;
    let emFoco = navigation.isFocused?.() ?? true;
    let requisicao = 0;
    async function carregar() {
      if (!emFoco || !usuarioId) return;
      setEstado({ chave, carregando: true, dados: null, erro: '' });
      const numero = ++requisicao;
      try {
        const dados = await consultarMissao({
          usuarioId,
          missaoId,
          requisitarAutenticado,
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
      foco?.();
      desfoco?.();
      assinatura.remove();
      clearInterval(intervalo);
    };
  }, [chave, missaoId, navigation, usuarioId, requisitarAutenticado, tentativa, aoReceber]);

  function atualizar() {
    setEstado({ chave, carregando: true, dados: null, erro: '' });
    setTentativa((valor) => valor + 1);
  }
  return {
    ...(estado.chave === chave ? estado : { carregando: true, dados: null, erro: '' }),
    atualizar,
  };
}
