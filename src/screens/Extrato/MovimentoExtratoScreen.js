import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconeVoltar from '../../assets/icons/icone-voltar-extrato.svg';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { ValorComMoeda } from '../../components/Pontos/ValorComMoeda';
import { useSessao } from '../../state/SessaoContext';
import { criarServicoExtratoPontos } from '../../services/extratoPontos';
import { nomeDoFuso } from '../../utils/formatarProgresso';
import { colors } from '../../theme/colors';
import { TIPOS_MOVIMENTO } from './apresentacaoExtrato';
import { estilos as e } from './styles';

export function MovimentoExtratoScreen(props) {
  const { sessao } = useSessao();
  return (
    <MovimentoDaSessao key={`${sessao?.usuarioId}:${props.route.params.movimentoId}`} {...props} />
  );
}
function MovimentoDaSessao({ navigation, route }) {
  const { sessao, requisitarAutenticado } = useSessao();
  const servico = useMemo(
    () => criarServicoExtratoPontos({ usuarioId: sessao?.usuarioId, requisitarAutenticado }),
    [sessao?.usuarioId, requisitarAutenticado],
  );
  const [tentativa, setTentativa] = useState(0),
    [estado, setEstado] = useState({ dados: null, carregando: true, erro: '', expirada: false });
  const id = route.params.movimentoId,
    margens = useSafeAreaInsets();
  useEffect(() => {
    let atual = true;
    servico
      .consultar(id)
      .then((dados) => {
        if (atual) setEstado({ dados, carregando: false, erro: '', expirada: false });
      })
      .catch((f) => {
        if (atual)
          setEstado({
            dados: null,
            carregando: false,
            expirada: f.status === 401,
            erro:
              f.status === 401
                ? 'Sua sessão terminou. Entre novamente.'
                : f.status === 404
                  ? 'Este movimento não está disponível.'
                  : 'Não foi possível carregar este movimento.',
          });
      });
    return () => {
      atual = false;
    };
  }, [servico, id, tentativa]);
  const m = estado.dados?.movimento;
  return (
    <View style={[e.tela, { paddingTop: margens.top }]}>
      <View style={e.cabecalho}>
        <ScreenHeader
          title="Detalhe"
          onBack={() => navigation.goBack()}
          corVoltar={colors.surface}
          IconeVoltar={IconeVoltar}
          estiloTitulo={e.tituloCabecalho}
          style={e.semMargem}
        />
      </View>
      <ScrollView contentContainerStyle={[e.conteudo, { paddingBottom: margens.bottom + 24 }]}>
        {estado.carregando ? (
          <View style={e.processando}>
            <ActivityIndicator color={colors.brand} />
            <Text style={e.texto} accessibilityLiveRegion="polite">
              Buscando o movimento…
            </Text>
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
                onPress={() => {
                  setEstado({ dados: null, carregando: true, erro: '', expirada: false });
                  setTentativa((t) => t + 1);
                }}
              />
            ) : null}
          </View>
        ) : null}
        {m ? (
          <>
            <View style={e.hero}>
              <ValorComMoeda valor={m.quantidade} comSinal tamanho="grande" tamanhoMoeda={32} />
              <Text style={e.texto}>{TIPOS_MOVIMENTO[m.tipo]}</Text>
            </View>
            <View style={e.cartao}>
              <View style={e.grupo}>
                <Text style={e.legenda}>
                  {m.tituloOrigem && !m.tituloPreservado ? 'Origem · nome atual' : 'Origem'}
                </Text>
                <Text style={e.titulo}>{m.tituloOrigem ?? 'Detalhes da origem indisponíveis'}</Text>
                {m.origemRemovida ? <Text style={e.legenda}>Removida</Text> : null}
              </View>
              <View style={e.grupo}>
                <Text style={e.legenda}>Quando foi registrado</Text>
                <Text style={e.texto}>
                  {new Intl.DateTimeFormat('pt-BR', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: estado.dados.fusoHorario,
                  }).format(new Date(m.registradoEm))}
                </Text>
                <Text style={e.legenda}>{nomeDoFuso(estado.dados.fusoHorario)}</Text>
              </View>
            </View>
            <View style={e.saldo}>
              <Text style={e.rotuloSaldo}>Saldo após este movimento</Text>
              {m.saldoApos == null ? (
                <>
                  <Text style={e.titulo}>Indisponível</Text>
                  <Text style={e.texto}>O saldo deste movimento não está disponível.</Text>
                </>
              ) : (
                <ValorComMoeda
                  valor={m.saldoApos}
                  tamanho="medio"
                  rotulo="Saldo após este movimento"
                />
              )}
            </View>
            {m.tipo === 'estornoResgate' ? (
              <Text style={e.texto}>Devolução pelo resgate desfeito.</Text>
            ) : null}
            <SecondaryButton
              label="Voltar ao extrato"
              onPress={() => navigation.goBack()}
              style={e.pill}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
