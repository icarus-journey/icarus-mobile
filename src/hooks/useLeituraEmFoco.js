import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState } from 'react-native';

export function useLeituraEmFoco({ chave, consultar, mensagemErro, ativo = true, preparar }) {
  const [estado, setEstado] = useState({ chave, dados: null, carregando: true, erro: '' });
  const escopo = useRef(chave);
  const emFoco = useRef(false);
  const pendente = useRef(null);
  const versao = useRef(0);
  useLayoutEffect(() => {
    escopo.current = chave;
  }, [chave]);

  const carregar = useCallback(() => {
    if (!chave || !ativo || !emFoco.current) return;
    if (pendente.current?.chave === chave) return pendente.current.promessa;
    const numero = ++versao.current;
    const controlador = new AbortController();
    const valido = () => numero === versao.current && escopo.current === chave;
    setEstado((anterior) => ({
      chave,
      dados: anterior.chave === chave ? anterior.dados : null,
      carregando: true,
      erro: '',
    }));
    const leitura = { chave, controlador };
    pendente.current = leitura;
    leitura.promessa = (async () => {
      try {
        if (preparar) await preparar();
        if (!valido()) return;
        const dados = await consultar(controlador.signal);
        if (valido()) setEstado({ chave, dados, carregando: false, erro: '' });
      } catch (falha) {
        if (valido())
          setEstado((anterior) => ({
            chave,
            dados:
              ![401, 404].includes(falha.status) && anterior.chave === chave
                ? anterior.dados
                : null,
            carregando: false,
            erro: mensagemErro(falha),
          }));
      } finally {
        if (pendente.current === leitura) pendente.current = null;
      }
    })();
    return leitura.promessa;
  }, [chave, ativo, consultar, mensagemErro, preparar]);

  useFocusEffect(
    useCallback(() => {
      emFoco.current = true;
      carregar();
      return () => {
        emFoco.current = false;
        versao.current++;
        pendente.current?.controlador.abort();
        pendente.current = null;
      };
    }, [carregar]),
  );

  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') carregar();
    });
    return () => assinatura?.remove();
  }, [carregar]);

  const exibido = estado.chave === chave ? estado : { dados: null, carregando: true, erro: '' };
  return { ...exibido, atualizando: exibido.carregando && !!exibido.dados, carregar };
}
