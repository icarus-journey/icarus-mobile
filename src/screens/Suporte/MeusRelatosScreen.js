import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import IconSeta from '../../assets/icons/icon-chevron-left.svg';
import { SecondaryButton } from '../../components/Button';
import { colors } from '../../theme/colors';
import {
  AvisoSuporte,
  CarregandoSuporte,
  MarcadorStatus,
  TelaSuporte,
  estilos,
  rotulosStatus,
  useConsultaSuporte,
  useServicoSuporte,
} from './SuporteUI';

const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

export function MeusRelatosScreen({ navigation }) {
  const servico = useServicoSuporte();
  const { dados, carregando, atualizar, falha } = useConsultaSuporte(servico.listar);

  return (
    <TelaSuporte
      navigation={navigation}
      titulo="Meus relatos"
      atualizar={atualizar}
      carregando={carregando}
    >
      {carregando && !dados ? <CarregandoSuporte /> : null}
      {falha ? (
        <AvisoSuporte>Não foi possível atualizar seus relatos. Tente novamente.</AvisoSuporte>
      ) : null}
      {dados?.length === 0 && !falha ? (
        <>
          <Text style={estilos.texto}>Você ainda não enviou relatos.</Text>
          <SecondaryButton
            label="Relatar problema"
            onPress={() => navigation.navigate('RelatarProblema')}
          />
        </>
      ) : null}
      <View style={lista.espacamento}>
        {dados?.map((relato) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${relato.assunto}, protocolo ${relato.protocolo}, ${rotulosStatus[relato.status] ?? rotulosStatus.indisponivel}`}
            key={relato.id}
            style={lista.cartao}
            onPress={() => navigation.push('DetalheRelato', { id: relato.id })}
          >
            <View style={lista.linha}>
              <Text style={[estilos.subtitulo, lista.tituloCartao]}>{relato.assunto}</Text>
              <View style={lista.seta}>
                <IconSeta />
              </View>
            </View>
            <View style={lista.linha}>
              <Text style={estilos.nota}>{relato.protocolo}</Text>
              <MarcadorStatus status={relato.status} />
            </View>
          </Pressable>
        ))}
      </View>
    </TelaSuporte>
  );
}

export function DetalheRelatoScreen({ navigation, route }) {
  const servico = useServicoSuporte();
  const { id } = route.params;
  const consultar = useCallback((signal) => servico.consultar(id, signal), [servico, id]);
  const { dados: relato, carregando, falha, atualizar } = useConsultaSuporte(consultar);
  return (
    <TelaSuporte navigation={navigation} titulo={relato?.assunto ?? 'Detalhes do relato'}>
      {carregando && !relato ? <CarregandoSuporte /> : null}
      {falha ? (
        <>
          <AvisoSuporte>
            {falha.status === 404
              ? 'Esse relato não está disponível.'
              : 'Não foi possível consultar o relato agora.'}
          </AvisoSuporte>
          {falha.status !== 404 ? (
            <SecondaryButton label="Tentar novamente" onPress={atualizar} />
          ) : null}
        </>
      ) : null}
      {relato ? (
        <>
          <View style={lista.linha}>
            <Text style={estilos.texto}>Protocolo {relato.protocolo}</Text>
            <MarcadorStatus status={relato.status} />
          </View>
          <View style={lista.grupo}>
            <Text style={estilos.rotulo}>O que aconteceu</Text>
            <Text style={estilos.texto}>{relato.descricao}</Text>
          </View>
          <View style={lista.historico}>
            <Text accessibilityRole="header" style={estilos.subtitulo}>
              Histórico
            </Text>
            {relato.historico.map((etapa, indice) => (
              <View key={`${etapa.status}-${etapa.em}-${indice}`} style={lista.etapa}>
                <View style={lista.marcador} accessible={false}>
                  {indice < relato.historico.length - 1 ? <View style={lista.trilha} /> : null}
                  <View style={lista.ponto} />
                </View>
                <View style={lista.grupo}>
                  <Text style={estilos.rotulo}>{rotulosStatus[etapa.status]}</Text>
                  <Text style={estilos.nota}>{formatoData.format(new Date(etapa.em))}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </TelaSuporte>
  );
}

const lista = StyleSheet.create({
  espacamento: { gap: 8 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  cartao: {
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 16,
  },
  tituloCartao: { flex: 1 },
  seta: { transform: [{ scaleX: -1 }] },
  grupo: { gap: 4, flexShrink: 1 },
  historico: { borderTopWidth: 1, borderColor: colors.borderDefault, paddingTop: 16, gap: 16 },
  etapa: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  marcador: { width: 12, alignSelf: 'stretch', alignItems: 'center' },
  trilha: {
    position: 'absolute',
    top: 10,
    bottom: -26,
    width: 2,
    backgroundColor: colors.borderDefault,
  },
  ponto: { width: 12, height: 12, marginTop: 4, borderRadius: 6, backgroundColor: colors.brand },
});
