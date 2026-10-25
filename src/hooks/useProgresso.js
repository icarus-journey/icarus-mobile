import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useServicoAnalise } from './useServicoAnalise';

export function useProgresso(periodo) {
  const servico = useServicoAnalise();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const versao = useRef(0);
  const carregar = useCallback(async () => {
    const atual = ++versao.current;
    setCarregando(true);
    setDados(null);
    setErro('');
    try {
      const resposta = await servico.progresso(periodo);
      if (atual === versao.current) setDados(resposta);
    } catch {
      if (atual === versao.current)
        setErro('Não foi possível carregar seus registros. Confira a conexão e tente novamente.');
    } finally {
      if (atual === versao.current) setCarregando(false);
    }
  }, [periodo, servico]);
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
