import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { consultarJornada } from '../services/jornada';
import { useSessao } from '../state/SessaoContext';

export function useJornada(navigation) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({ usuarioId, dados: null, carregando: true, erro: '' });

  useEffect(() => {
    let ativa = true;
    let emFoco = navigation.isFocused?.() ?? true;
    let requisicao = 0;
    async function carregar() {
      if (!emFoco || !usuarioId) return;
      const numero = ++requisicao;
      setEstado({ usuarioId, dados: null, carregando: true, erro: '' });
      try {
        const dados = await consultarJornada({ usuarioId, requisitarAutenticado });
        if (ativa && numero === requisicao)
          setEstado({ usuarioId, dados, carregando: false, erro: '' });
      } catch (falha) {
        if (ativa && numero === requisicao)
          setEstado({
            usuarioId,
            dados: null,
            carregando: false,
            erro:
              falha.status === 401
                ? 'Sua sessão terminou. Entre novamente para ver sua sequência.'
                : 'Não foi possível carregar sua sequência. Tente novamente.',
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
    const assinatura = AppState.addEventListener('change', (proximo) => {
      if (proximo === 'active') carregar();
    });
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
  }, [usuarioId, requisitarAutenticado, navigation, tentativa]);

  function atualizar() {
    setEstado({ usuarioId, dados: null, carregando: true, erro: '' });
    setTentativa((valor) => valor + 1);
  }
  return {
    ...(estado.usuarioId === usuarioId ? estado : { dados: null, carregando: true, erro: '' }),
    atualizar,
  };
}
