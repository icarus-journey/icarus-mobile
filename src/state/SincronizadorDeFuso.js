import { useEffect } from 'react';
import { AppState } from 'react-native';

import { criarServicoPerfil, obterFusoDoDispositivo } from '../services/perfil';
import { useSessao } from './SessaoContext';

export function SincronizadorDeFuso() {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;

  useEffect(() => {
    if (!usuarioId) return;
    let ativo = true;
    let enviando = false;
    let ultimoFuso;
    const servico = criarServicoPerfil({ usuarioId, requisitarAutenticado });
    async function sincronizar() {
      const fuso = obterFusoDoDispositivo();
      if (!ativo || enviando || !fuso || fuso === ultimoFuso) return;
      enviando = true;
      try {
        await servico.atualizarFuso(fuso);
        if (ativo) ultimoFuso = fuso;
      } catch {
        // Uma falha de rede permite nova tentativa ao voltar ao aplicativo.
      } finally {
        enviando = false;
      }
    }
    sincronizar();
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') sincronizar();
    });
    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, [usuarioId, requisitarAutenticado]);

  return null;
}
