import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Text, View } from 'react-native';

import { EvolucaoDaMeta } from '../../components/Analise/EvolucaoDaMeta';
import { estilosPainel as estilos } from '../../components/Analise/estilosPainel';
import { SecondaryButton } from '../../components/Button';
import {
  criarServicoProgressoCampanha,
  mensagemProgressoCampanha,
} from '../../services/progressoCampanha';
import { useSessao } from '../../state/SessaoContext';
import { useCampaigns } from '../../state/CampaignsContext';
import { colors } from '../../theme/colors';

export function EvolucaoDaMetaEmFoco({ campanhaId }) {
  const { sessao, requisitarAutenticado } = useSessao();
  return (
    <DadosDaEvolucao
      key={`${sessao?.usuarioId}:${campanhaId}`}
      usuarioId={sessao?.usuarioId}
      campanhaId={campanhaId}
      requisitarAutenticado={requisitarAutenticado}
    />
  );
}

function DadosDaEvolucao({ usuarioId, campanhaId, requisitarAutenticado }) {
  const { aplicarProgresso } = useCampaigns();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const requisicao = useRef(0);
  const carregar = useCallback(() => {
    const numero = ++requisicao.current;
    const atual = () => numero === requisicao.current;
    setCarregando(true);
    setErro('');
    return criarServicoProgressoCampanha({ usuarioId, campanhaId, requisitarAutenticado })
      .consultar()
      .then((resposta) => {
        if (atual()) {
          setDados(resposta);
          aplicarProgresso(campanhaId, resposta);
        }
      })
      .catch((falha) => {
        if (atual())
          setErro(
            falha.status === 401 || falha.status === 404
              ? mensagemProgressoCampanha(falha)
              : 'Não foi possível atualizar o avanço da meta.',
          );
      })
      .finally(() => {
        if (atual()) setCarregando(false);
      });
  }, [usuarioId, campanhaId, requisitarAutenticado, aplicarProgresso]);
  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => {
        requisicao.current += 1;
      };
    }, [carregar]),
  );
  if (carregando)
    return (
      <ActivityIndicator color={colors.brand} accessibilityLabel="Atualizando avanço da meta" />
    );
  if (erro)
    return (
      <View>
        <Text style={estilos.erro} accessibilityRole="alert">
          {erro}
        </Text>
        <SecondaryButton label="Atualizar avanço da meta" onPress={carregar} />
      </View>
    );
  return <EvolucaoDaMeta dados={dados} />;
}
