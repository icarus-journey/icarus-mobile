import { useEffect, useRef, useState } from 'react';

import { excluirEpico } from '../services/epicos';
import { excluirCampanha } from '../services/campanhas';
import { excluirMissao } from '../services/missoes';
import { useExclusoesPlanejamento } from '../state/ExclusoesPlanejamentoContext';
import { useSessao } from '../state/SessaoContext';

const operacoes = {
  epicos: { nome: 'épico', executar: excluirEpico },
  campanhas: { nome: 'campanha', executar: excluirCampanha },
  missoes: { nome: 'missão', executar: excluirMissao },
};

export function useExclusaoPlanejamento({ tipo, id, navigation }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const { registrarExclusao } = useExclusoesPlanejamento();
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');
  const ativo = useRef(true);
  const enviando = useRef(false);
  useEffect(() => {
    ativo.current = true;
    return () => {
      ativo.current = false;
    };
  }, [sessao?.usuarioId]);
  const operacao = operacoes[tipo];

  async function excluir() {
    if (enviando.current) return;
    enviando.current = true;
    setExcluindo(true);
    setErro('');
    try {
      await operacao.executar({ usuarioId: sessao.usuarioId, id, requisitarAutenticado });
      if (!ativo.current) return;
      registrarExclusao(tipo, id);
      navigation.popToTop();
    } catch (falha) {
      if (ativo.current)
        setErro(
          falha.status === 409
            ? 'Este item mudou. Volte à lista e tente novamente.'
            : 'Não foi possível excluir. Tente novamente.',
        );
    } finally {
      enviando.current = false;
      if (ativo.current) setExcluindo(false);
    }
  }

  return { excluir, excluindo, erro };
}
