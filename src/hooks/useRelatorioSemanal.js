import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

import { useServicoAnalise } from './useServicoAnalise';
import { useSessao } from '../state/SessaoContext';
import { useSincronizacaoFuso } from '../state/SincronizadorDeFuso';

export function useRelatorioSemanal(ativo = true) {
  const servico = useServicoAnalise();
  const sincronizarFuso = useSincronizacaoFuso();
  const { sessao } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const [estado, setEstado] = useState({ usuarioId, dados: null, carregando: true, erro: '' });
  const versao = useRef(0);
  const temporizador = useRef(null);
  const ocupado = useRef(false);
  const emFoco = useRef(false);
  const controlador = useRef(null);

  const carregar = useCallback(
    async function carregarRelatorio(tipo = 'consultarRelatorio', atual = versao.current) {
      if (!ativo || !usuarioId || !emFoco.current || ocupado.current || atual !== versao.current)
        return;
      clearTimeout(temporizador.current);
      ocupado.current = true;
      const leitura = new AbortController();
      controlador.current = leitura;
      setEstado((anterior) => ({
        usuarioId,
        dados: anterior.usuarioId === usuarioId ? anterior.dados : null,
        carregando: true,
        erro: '',
      }));
      try {
        if (sincronizarFuso) await sincronizarFuso();
        if (atual !== versao.current) return;
        let resposta = await servico[tipo](
          tipo === 'consultarRelatorio' ? leitura.signal : undefined,
        );
        if (atual !== versao.current) return;
        if (tipo === 'consultarRelatorio' && resposta.estado === 'ausente') {
          resposta = await servico.solicitarRelatorio();
          if (atual !== versao.current) return;
        }
        if (!resposta?.estado) throw new Error('Resposta indisponível');
        setEstado({ usuarioId, dados: resposta, carregando: false, erro: '' });
        if (resposta.estado === 'processando') {
          temporizador.current = setTimeout(() => {
            carregarRelatorio('consultarRelatorio', atual);
          }, 2500);
        }
      } catch (falha) {
        if (atual === versao.current)
          setEstado({
            usuarioId,
            dados: null,
            carregando: false,
            erro:
              falha.status === 401
                ? 'Sua sessão terminou. Entre novamente para ver sua semana.'
                : 'Não foi possível consultar sua semana. Confira a conexão e tente novamente.',
          });
      } finally {
        if (atual === versao.current) ocupado.current = false;
        if (controlador.current === leitura) controlador.current = null;
      }
    },
    [ativo, servico, usuarioId, sincronizarFuso],
  );

  useFocusEffect(
    useCallback(() => {
      emFoco.current = true;
      const atual = ++versao.current;
      ocupado.current = false;
      carregar('consultarRelatorio', atual);
      return () => {
        emFoco.current = false;
        versao.current++;
        clearTimeout(temporizador.current);
        controlador.current?.abort();
        controlador.current = null;
      };
    }, [carregar]),
  );
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') carregar();
    });
    return () => assinatura?.remove();
  }, [carregar]);
  return {
    ...(estado.usuarioId === usuarioId ? estado : { dados: null, carregando: true, erro: '' }),
    atualizar: () => carregar('consultarRelatorio'),
    tentarNovamente: () => carregar('tentarRelatorioNovamente'),
  };
}
