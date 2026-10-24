import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { useServicoAnalise } from './useServicoAnalise';

export function useReferenciasPublicas(areaDaVida, tipoDia = 'todos') {
  const servico = useServicoAnalise();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const versao = useRef(0);
  const carregar = useCallback(async () => {
    const atual = ++versao.current;
    setCarregando(true);
    setErro('');
    setDados(null);
    try {
      const resposta = await servico.referencias(areaDaVida, tipoDia);
      if (atual === versao.current) setDados(resposta);
    } catch {
      if (atual === versao.current)
        setErro('Não foi possível carregar as referências. Confira a conexão e tente novamente.');
    } finally {
      if (atual === versao.current) setCarregando(false);
    }
  }, [servico, areaDaVida, tipoDia]);
  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => {
        versao.current += 1;
      };
    }, [carregar]),
  );
  return { dados, carregando, erro, carregar };
}
