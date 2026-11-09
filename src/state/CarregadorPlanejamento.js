import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useSincronizacaoFuso } from './SincronizadorDeFuso';

import { listarEpicos } from '../services/epicos';
import { listarMissoesAvulsas } from '../services/missoes';
import { useSessao } from './SessaoContext';
import { useEpics } from './EpicsContext';
import { useCampaigns } from './CampaignsContext';
import { useMissions } from './MissionsContext';

const PlanejamentoContext = createContext({ carregando: false, erro: '', atualizar: () => {} });

export function CarregadorPlanejamento({ children }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const sincronizarFuso = useSincronizacaoFuso();
  const { carregarLista: carregarEpicos, obterRevisao: revisaoEpicos } = useEpics();
  const { carregarLista: carregarCampanhas, obterRevisao: revisaoCampanhas } = useCampaigns();
  const { carregarLista: carregarMissoes, obterRevisao: revisaoMissoes } = useMissions();
  const [estado, setEstado] = useState({ carregando: true, erro: '' });
  const atualizarRef = useRef(() => {});

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    let pendente = null;
    const revisaoAtual = () => [revisaoEpicos(), revisaoCampanhas(), revisaoMissoes()].join(':');
    async function atualizar() {
      if (pendente || !ativo) return;
      const controlador = new AbortController();
      pendente = controlador;
      setEstado({ carregando: true, erro: '' });
      try {
        if (sincronizarFuso) await sincronizarFuso();
        while (ativo) {
          const revisao = revisaoAtual();
          const opcoes = { usuarioId, requisitarAutenticado, signal: controlador.signal };
          const [epicos, avulsas] = await Promise.all([
            listarEpicos(opcoes),
            listarMissoesAvulsas(opcoes),
          ]);
          if (!ativo) return;
          // Um snapshot iniciado antes de uma edição não pode desfazer o resultado confirmado.
          if (revisao !== revisaoAtual()) continue;
          carregarEpicos(epicos);
          carregarCampanhas(epicos);
          carregarMissoes(epicos, avulsas);
          setEstado({ carregando: false, erro: '' });
          break;
        }
      } catch {
        controlador.abort();
        if (ativo)
          setEstado({
            carregando: false,
            erro: 'Não foi possível atualizar seus próximos passos.',
          });
      } finally {
        if (pendente === controlador) pendente = null;
      }
    }
    atualizarRef.current = atualizar;
    atualizar();
    const assinatura = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') atualizar();
    });
    return () => {
      ativo = false;
      pendente?.abort();
      assinatura.remove();
    };
  }, [
    usuarioId,
    requisitarAutenticado,
    carregarEpicos,
    carregarCampanhas,
    carregarMissoes,
    revisaoEpicos,
    revisaoCampanhas,
    revisaoMissoes,
    sincronizarFuso,
  ]);

  const atualizar = useCallback(() => atualizarRef.current(), []);
  return (
    <PlanejamentoContext.Provider value={{ ...estado, atualizar }}>
      {children}
    </PlanejamentoContext.Provider>
  );
}

export function useCarregamentoPlanejamento() {
  return useContext(PlanejamentoContext);
}
