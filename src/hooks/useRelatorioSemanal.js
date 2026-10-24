import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useServicoAnalise } from './useServicoAnalise';

export function useRelatorioSemanal() {
  const servico = useServicoAnalise();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const versao = useRef(0);
  const temporizador = useRef(null);
  const ocupado = useRef(false);

  const carregar = useCallback(
    async function carregarRelatorio(tipo = 'consultarRelatorio', atual = versao.current) {
      if (ocupado.current || atual !== versao.current) return;
      clearTimeout(temporizador.current);
      ocupado.current = true;
      setCarregando(true);
      setErro('');
      try {
        const resposta = await servico[tipo]();
        if (atual !== versao.current) return;
        if (!resposta?.estado) throw new Error('Resposta indisponível');
        setDados(resposta);
        if (resposta.estado === 'processando') {
          temporizador.current = setTimeout(() => {
            carregarRelatorio('consultarRelatorio', atual);
          }, 2500);
        }
      } catch {
        if (atual === versao.current)
          setErro('Não foi possível consultar sua semana. Confira a conexão e tente novamente.');
      } finally {
        if (atual === versao.current) {
          ocupado.current = false;
          setCarregando(false);
        }
      }
    },
    [servico],
  );

  useFocusEffect(
    useCallback(() => {
      const atual = ++versao.current;
      ocupado.current = false;
      setDados(null);
      carregar('solicitarRelatorio', atual);
      return () => {
        versao.current += 1;
        clearTimeout(temporizador.current);
      };
    }, [carregar]),
  );
  return {
    dados,
    carregando,
    erro,
    atualizar: () => carregar('consultarRelatorio'),
    tentarNovamente: () => carregar('tentarRelatorioNovamente'),
  };
}
