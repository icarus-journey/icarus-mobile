import { useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { SecondaryButton } from '../Button';
import { IlustracaoRecompensa } from '../IlustracaoRecompensa';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { nomeDoFuso, periodoCurto } from '../../utils/formatarProgresso';
import { focarElemento } from '../../utils/focarElemento';

const chamaAtiva = require('../../assets/jornada/chama-ativa.png');
const chamaPendente = require('../../assets/jornada/chama-pendente.png');

export function DetalhesSequenciaModal({ jornada, aoFechar, espacoInferior = 0 }) {
  const { dados, carregando, erro, atualizar } = jornada;
  const referenciaTitulo = useRef(null);
  const sequencia = dados?.sequencia;
  const { fontScale } = useWindowDimensions();
  const quantidade = sequencia?.diasAtuais;
  const conhecida = Number.isSafeInteger(quantidade);
  const periodo = sequencia?.dias?.length
    ? periodoCurto({ inicio: sequencia.dias[0].data, fim: sequencia.dias.at(-1).data })
    : '';
  const explicacao =
    sequencia?.estado === 'fuso_nao_informado'
      ? 'Abra novamente o aplicativo para atualizar seu horário.'
      : sequencia?.estado === 'historico_incompleto'
        ? 'Alguns registros antigos não permitem confirmar em que dia a missão foi feita.'
        : sequencia?.estado === 'sem_registros'
          ? 'Sua primeira missão feita inicia a sequência.'
          : quantidade === 0
            ? 'Faça uma missão hoje para começar de novo.'
            : sequencia?.realizouHoje
              ? 'Hoje já contou. Um passo de cada vez.'
              : 'Hoje ainda está em aberto. Uma missão feita dá continuidade.';

  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
      onShow={() => focarElemento(referenciaTitulo)}
    >
      <View style={styles.fundo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={aoFechar}
          accessible={false}
          importantForAccessibility="no"
        />
        <View style={styles.folha} accessibilityViewIsModal>
          <ScrollView
            contentContainerStyle={[
              styles.conteudo,
              { paddingBottom: Math.max(24, espacoInferior + 16) },
            ]}
          >
            <Text ref={referenciaTitulo} style={styles.titulo} accessibilityRole="header">
              Sua sequência
            </Text>
            {carregando ? (
              <ActivityIndicator color={colors.brand} accessibilityLabel="Atualizando sequência" />
            ) : erro ? (
              <>
                <Text style={styles.texto} accessibilityRole="alert">
                  {erro}
                </Text>
                <SecondaryButton label="Tentar novamente" onPress={atualizar} />
              </>
            ) : sequencia ? (
              <>
                <View style={styles.resumo}>
                  <Image
                    source={sequencia.realizouHoje ? chamaAtiva : chamaPendente}
                    style={styles.chama}
                    accessible={false}
                  />
                  <Text style={styles.contagem} accessibilityLiveRegion="polite">
                    {conhecida
                      ? quantidade === 1
                        ? '1 dia de sequência'
                        : `${quantidade.toLocaleString('pt-BR')} dias seguidos`
                      : 'Sequência em aberto'}
                  </Text>
                </View>
                <Text style={styles.texto}>{explicacao}</Text>
                {sequencia.dias.length > 0 ? (
                  <View style={styles.semana}>
                    {sequencia.dias.map((dia) => {
                      const data = new Date(`${dia.data}T12:00:00Z`);
                      const descricao =
                        dia.realizada === true
                          ? 'Missão realizada'
                          : dia.protegida
                            ? 'Dia protegido. Sua sequência foi mantida'
                            : dia.realizada === null
                              ? 'Registro sem data confirmada'
                              : dia.data === sequencia.hoje
                                ? 'Hoje em aberto'
                                : 'Sem realização registrada';
                      return (
                        <View
                          key={dia.data}
                          style={[
                            styles.dia,
                            { minWidth: Math.max(36, Math.ceil(fontScale * 24)) },
                          ]}
                          accessible
                          accessibilityLabel={`${data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}. ${descricao}.`}
                        >
                          <Text style={styles.legenda}>
                            {data.toLocaleDateString('pt-BR', {
                              weekday: 'narrow',
                              timeZone: 'UTC',
                            })}
                          </Text>
                          <View style={[styles.circulo, dia.realizada && styles.realizado]}>
                            <Text style={[styles.data, dia.realizada && styles.dataRealizada]}>
                              {data.getUTCDate()}
                            </Text>
                          </View>
                          {dia.protegida && !dia.realizada ? (
                            <View style={styles.marcaProtecao} accessible={false}>
                              <IlustracaoRecompensa deveMostrarProtecao tamanho={20} />
                            </View>
                          ) : (
                            <Text style={[styles.legenda, dia.realizada && styles.marcador]}>
                              {dia.realizada
                                ? '✓'
                                : dia.realizada === null
                                  ? '?'
                                  : dia.data === sequencia.hoje
                                    ? 'Hoje'
                                    : '–'}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : null}
                <Text style={styles.regra}>Cada dia conta uma vez.</Text>
                {sequencia.dias.some((dia) => dia.protegida) ? (
                  <Text style={styles.texto}>O escudo mantém sua sequência sem somar um dia.</Text>
                ) : null}
                {dados.protecoesPendentes > 0 ? (
                  <Text style={styles.texto}>
                    {dados.protecoesPendentes === 1
                      ? 'Uma proteção será reposta quando houver espaço na loja.'
                      : `${dados.protecoesPendentes} proteções serão repostas quando houver espaço na loja.`}
                  </Text>
                ) : null}
                <Text style={styles.texto}>
                  Vale o dia em que você fez a missão, no seu horário local.
                </Text>
                {periodo ? (
                  <Text style={styles.legenda}>
                    {nomeDoFuso(sequencia.fusoHorario)} · {periodo}
                  </Text>
                ) : null}
                {sequencia.estado === 'fuso_nao_informado' ? (
                  <SecondaryButton label="Atualizar sequência" onPress={atualizar} />
                ) : null}
              </>
            ) : null}
            <SecondaryButton label="Voltar às missões" onPress={aoFechar} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31,20,56,0.4)' },
  folha: {
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  conteudo: { padding: 24, gap: 16 },
  titulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  resumo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  chama: { width: 56, height: 56, resizeMode: 'contain' },
  contagem: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.textPrimary,
  },
  texto: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  regra: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  semana: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' },
  dia: { alignItems: 'center', gap: 6, flexGrow: 1 },
  circulo: {
    minWidth: 36,
    minHeight: 36,
    padding: 4,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPurple,
  },
  realizado: { backgroundColor: colors.brand },
  data: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  dataRealizada: { color: colors.white },
  legenda: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  marcador: { color: colors.brand },
  marcaProtecao: { minHeight: 20, justifyContent: 'center', alignItems: 'center' },
});
