import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';

import { criarServicoPerfil, obterFusoDoDispositivo } from '../services/perfil';
import { useSessao } from './SessaoContext';

const SincronizacaoFusoContext = createContext(null);

export function SincronizadorDeFuso({ children }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoPerfil({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const controle = useRef({ ativo: true, ultimoFuso: null, pendente: null });
  const sincronizar = useCallback(
    function sincronizarFuso() {
      const estado = controle.current;
      const fuso = obterFusoDoDispositivo();
      if (!estado.ativo || !usuarioId || !fuso) return Promise.resolve();
      if (estado.pendente) return estado.pendente.then(sincronizarFuso);
      if (fuso === estado.ultimoFuso) return Promise.resolve();
      estado.pendente = servico
        .atualizarFuso(fuso)
        .then(() => {
          if (estado.ativo) estado.ultimoFuso = fuso;
        })
        .finally(() => {
          estado.pendente = null;
        });
      return estado.pendente;
    },
    [usuarioId, servico],
  );

  useEffect(() => {
    const estado = controle.current;
    estado.ativo = true;
    const tentar = () => sincronizar().catch(() => {});
    tentar();
    const assinatura = AppState.addEventListener('change', (proximo) => {
      if (proximo === 'active') tentar();
    });
    return () => {
      estado.ativo = false;
      assinatura.remove();
    };
  }, [sincronizar]);
  return (
    <SincronizacaoFusoContext.Provider value={sincronizar}>
      {children}
    </SincronizacaoFusoContext.Provider>
  );
}

export function useSincronizacaoFuso() {
  return useContext(SincronizacaoFusoContext);
}
