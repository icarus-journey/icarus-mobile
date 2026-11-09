import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useSessao } from '../state/SessaoContext';
import { useEpics } from '../state/EpicsContext';
import { useCampaigns } from '../state/CampaignsContext';
import { useMissions } from '../state/MissionsContext';
import { useExclusoesPlanejamento } from '../state/ExclusoesPlanejamentoContext';
import { listarEpicos } from '../services/epicos';
import { listarMissoesAvulsas } from '../services/missoes';

export function useAbrirObjetivo(navigation) {
  const { sessao, requisitarAutenticado } = useSessao();
  const epicos = useEpics(),
    campanhas = useCampaigns(),
    missoes = useMissions();
  const { exclusoes } = useExclusoesPlanejamento();
  const usuarioId = sessao?.usuarioId;
  const escopo = useRef({ usuarioId, exclusoes });
  useLayoutEffect(() => {
    escopo.current = { usuarioId, exclusoes };
  }, [usuarioId, exclusoes]);
  const requisicao = useRef(0);
  useLayoutEffect(() => {
    requisicao.current += 1;
  }, [usuarioId]);
  const [estado, setEstado] = useState({ usuarioId, carregando: false, erro: '' });
  useEffect(
    () => () => {
      requisicao.current += 1;
    },
    [],
  );
  async function abrir(tipo, id) {
    const numero = ++requisicao.current;
    const atual = () => requisicao.current === numero && escopo.current.usuarioId === usuarioId;
    const excluido = () =>
      escopo.current.exclusoes[tipo === 'campanha' ? 'campanhas' : 'epicos'].includes(id);
    setEstado({ usuarioId, carregando: true, erro: '' });
    try {
      if (!usuarioId || excluido()) throw new Error('indisponivel');
      const encontrado =
        tipo === 'campanha' ? campanhas.getCampaignById(id) : epicos.getEpicById(id);
      if (!encontrado) {
        const [grafo, avulsas] = await Promise.all([
          listarEpicos({ usuarioId, requisitarAutenticado }),
          listarMissoesAvulsas({ usuarioId, requisitarAutenticado }),
        ]);
        if (!atual()) return;
        const visiveis = grafo.filter((e) => !escopo.current.exclusoes.epicos.includes(e.id));
        const existe =
          tipo === 'epico'
            ? visiveis.some((e) => e.id === id)
            : visiveis.some((e) => e.campanhas?.some((c) => c.id === id));
        if (!existe || excluido()) throw new Error('indisponivel');
        epicos.carregarLista(grafo);
        campanhas.carregarLista(grafo);
        missoes.carregarLista(grafo, avulsas);
      }
      if (atual() && !excluido())
        navigation.navigate(
          tipo === 'campanha' ? 'CampaignDetail' : 'EpicDetail',
          tipo === 'campanha' ? { campaignId: id } : { epicId: id },
        );
    } catch {
      if (atual())
        setEstado({
          usuarioId,
          carregando: false,
          erro: 'Não foi possível abrir este objetivo. Atualize os registros e tente novamente.',
        });
    } finally {
      if (atual()) setEstado((e) => ({ ...e, carregando: false }));
    }
  }
  return {
    ...(estado.usuarioId === usuarioId ? estado : { carregando: false, erro: '' }),
    abrirCampanha: (id) => abrir('campanha', id),
    abrirEpico: (id) => abrir('epico', id),
  };
}
