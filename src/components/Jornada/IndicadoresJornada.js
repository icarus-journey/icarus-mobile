import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

const chamaAtiva = require('../../assets/jornada/chama-ativa.png');
const chamaPendente = require('../../assets/jornada/chama-pendente.png');
const moeda = require('../../assets/jornada/moeda-com-asa.png');

export function IndicadoresJornada({
  dados,
  carregando,
  aoVerSequencia,
  aoVerLoja,
  referenciaSequencia,
}) {
  const sequencia = dados?.sequencia;
  const quantidade = sequencia?.diasAtuais;
  const realizada = sequencia?.realizouHoje === true;
  const saldo = dados?.saldoPontos;
  const quantidadeConhecida = Number.isSafeInteger(quantidade);
  const rotulo = carregando
    ? 'Carregando sequência'
    : quantidadeConhecida
      ? `Sequência de ${quantidade} ${quantidade === 1 ? 'dia' : 'dias'}. ${realizada ? 'Hoje já contou.' : 'Hoje ainda está em aberto.'}`
      : 'Sequência indisponível. Ver detalhes.';
  return (
    <View style={styles.indicadores}>
      <Pressable
        ref={referenciaSequencia}
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        accessibilityHint="Abre o calendário da sua sequência"
        accessibilityState={{ busy: carregando }}
        onPress={aoVerSequencia}
        style={styles.sequencia}
      >
        <Image
          source={realizada ? chamaAtiva : chamaPendente}
          style={styles.chama}
          accessible={false}
        />
        <Text style={[styles.numero, !realizada && styles.pendente]}>
          {quantidadeConhecida ? quantidade.toLocaleString('pt-BR') : '–'}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          saldo == null
            ? 'Saldo de pontos indisponível. Abrir loja.'
            : `Saldo de pontos: ${saldo.toLocaleString('pt-BR')}. Abrir loja.`
        }
        onPress={aoVerLoja}
        style={styles.saldo}
      >
        <Image source={moeda} style={styles.moeda} accessible={false} />
        <Text style={styles.pontos}>{saldo == null ? '–' : saldo.toLocaleString('pt-BR')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  indicadores: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  sequencia: { flexDirection: 'row', alignItems: 'center', minWidth: 44, minHeight: 44, gap: 4 },
  saldo: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    gap: 6,
    maxWidth: '100%',
  },
  chama: { width: 30, height: 30, resizeMode: 'contain' },
  moeda: { width: 28, height: 28, resizeMode: 'contain' },
  numero: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 28, color: colors.textPrimary },
  pendente: { color: colors.textSecondary },
  pontos: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    flexShrink: 1,
  },
});
