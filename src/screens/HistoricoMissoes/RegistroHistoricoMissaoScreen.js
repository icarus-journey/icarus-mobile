import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { useSessao } from '../../state/SessaoContext';
import { criarServicoHistoricoMissoes } from '../../services/historicoMissoes';
import { nomeDoFuso } from '../../utils/formatarProgresso';
import { colors } from '../../theme/colors';
import { dataDoRegistro, momentoDoRegistro, ROTULOS_ESTADO } from './apresentacaoHistorico';
import { estilos as e } from './styles';

export function RegistroHistoricoMissaoScreen(props) {
  const { sessao } = useSessao();
  return <RegistroDaSessao key={sessao?.usuarioId ?? 'visitante'} {...props} />;
}
function RegistroDaSessao({ navigation, route }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoHistoricoMissoes({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const id = route.params.ocorrenciaId,
    insets = useSafeAreaInsets();
  const [resposta, setEstado] = useState({
      id,
      tentativa: 0,
      dados: null,
      carregando: true,
      erro: '',
      expirada: false,
    }),
    [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let atual = true;
    servico
      .consultar(id)
      .then((dados) => {
        if (atual)
          setEstado({ id, tentativa, dados, carregando: false, erro: '', expirada: false });
      })
      .catch((f) => {
        if (atual)
          setEstado({
            id,
            tentativa,
            dados: null,
            carregando: false,
            expirada: f.status === 401,
            erro:
              f.status === 401
                ? 'Sua sessão terminou. Entre novamente.'
                : f.status === 404
                  ? 'Este registro não está disponível.'
                  : 'Não foi possível carregar este registro.',
          });
      });
    return () => {
      atual = false;
    };
  }, [servico, id, tentativa]);
  const estado =
    resposta.id === id && resposta.tentativa === tentativa
      ? resposta
      : { dados: null, carregando: true, erro: '', expirada: false };
  const dados = estado.id === id ? estado.dados : null,
    r = dados?.registro;
  const pares = r
    ? [
        [
          'Campanha',
          r.campanha
            ? `${r.campanha.titulo}${r.campanha.removida ? ' · Removida' : ''}`
            : 'Missão avulsa',
        ],
        ['Prevista para', dataDoRegistro(r.dataPrevista)],
        ['Realizada em', momentoDoRegistro(r.realizadaEm, r.fusoHorarioRealizacao)],
        ['Registrada em', momentoDoRegistro(r.registradaEm, dados.fusoHorario)],
      ]
    : [];
  return (
    <View style={[e.tela, { paddingTop: insets.top }]}>
      <View style={e.cabecalho}>
        <ScreenHeader title="Registro da missão" onBack={() => navigation.goBack()} />
      </View>
      <ScrollView contentContainerStyle={[e.conteudo, { paddingBottom: insets.bottom + 24 }]}>
        {estado.carregando ? (
          <View style={e.processando}>
            <ActivityIndicator color={colors.brand} />
            <Text style={e.texto}>Buscando o registro…</Text>
          </View>
        ) : null}
        {estado.erro ? (
          <View style={e.aviso}>
            <Text style={e.erro} accessibilityRole="alert">
              {estado.erro}
            </Text>
            {!estado.expirada ? (
              <SecondaryButton
                label="Tentar novamente"
                onPress={() => setTentativa((n) => n + 1)}
              />
            ) : null}
          </View>
        ) : null}
        {r ? (
          <>
            <Text style={e.titulo} accessibilityRole="header">
              {r.titulo}
            </Text>
            {!r.tituloPreservado ? <Text style={e.legenda}>Nome atual da missão.</Text> : null}
            {r.missaoRemovida ? <Text style={e.legenda}>Missão removida da rotina.</Text> : null}
            <View style={e.suave}>
              <Text style={[e.rotulo, e.marca]}>{ROTULOS_ESTADO[r.estado]}</Text>
              {r.pontosRecebidos !== null ? (
                <Text style={[e.titulo, e.marca]}>
                  +{r.pontosRecebidos.toLocaleString('pt-BR')} pts recebidos
                </Text>
              ) : r.estado.startsWith('feita') ? (
                <Text style={e.legenda}>Pontos não disponíveis neste registro.</Text>
              ) : null}
            </View>
            <View style={e.detalhes}>
              {pares.map(([label, valor]) => (
                <View key={label} style={e.par}>
                  <Text style={e.legenda}>{label}</Text>
                  <Text style={e.rotulo}>{valor}</Text>
                </View>
              ))}
            </View>
            <Text style={e.legenda}>
              {r.fusoHorarioRealizacao === dados.fusoHorario
                ? nomeDoFuso(dados.fusoHorario)
                : `${r.fusoHorarioRealizacao ? `Realização: ${nomeDoFuso(r.fusoHorarioRealizacao)}\n` : ''}Registro: ${nomeDoFuso(dados.fusoHorario)}`}
            </Text>
          </>
        ) : null}
        <PrimaryButton
          label="Voltar ao histórico"
          showIcon={false}
          onPress={() => navigation.goBack()}
        />
      </ScrollView>
    </View>
  );
}
