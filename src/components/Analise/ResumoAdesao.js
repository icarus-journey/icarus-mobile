import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { estilosPainel as painel } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

export function ResumoAdesao({ adesao }) {
  if (!adesao || adesao.estado === 'sem_planejamento') return null;
  if (adesao.estado === 'historico_parcial') {
    if (!adesao.previstasRegistradas) return null;
    return (
      <View style={[painel.cartao, estilos.cartao]}>
        <Text style={painel.rotulo}>Seu planejamento</Text>
        <Text style={painel.texto}>
          <Text style={estilos.destaque}>{numeroPublico(adesao.previstasRegistradas)}</Text>{' '}
          {adesao.previstasRegistradas === 1
            ? 'missão planejada registrada'
            : 'missões planejadas registradas'}
        </Text>
      </View>
    );
  }
  const abertas =
    adesao.pendentes != null && adesao.atrasadas != null
      ? adesao.pendentes + adesao.atrasadas
      : null;
  return (
    <View style={[painel.cartao, estilos.cartao]}>
      <Text style={painel.rotulo}>Do que você planejou</Text>
      <View style={estilos.linha}>
        <Text style={estilos.porcentagem}>{numeroPublico(adesao.taxaConclusao)}%</Text>
        <View style={estilos.numeros}>
          <Text style={estilos.destaque}>
            {numeroPublico(adesao.concluidasDoPlanejamento)} de{' '}
            {numeroPublico(adesao.previstasRegistradas)} feitas
          </Text>
          {abertas != null ? (
            <Text style={painel.pequeno}>
              {abertas
                ? `${numeroPublico(abertas)} em aberto ao fechar o período`
                : 'Tudo feito até fechar o período'}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        style={estilos.trilha}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Missões planejadas feitas até fechar o período"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: adesao.taxaConclusao,
          text: `${numeroPublico(adesao.concluidasDoPlanejamento)} de ${numeroPublico(adesao.previstasRegistradas)}. ${numeroPublico(adesao.taxaConclusao)}%.`,
        }}
      >
        <View style={[estilos.preenchimento, { width: `${adesao.taxaConclusao}%` }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { gap: 12, padding: 18, borderRadius: 20 },
  linha: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14 },
  numeros: { flexGrow: 1, flexShrink: 1, gap: 4 },
  destaque: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textPrimary },
  porcentagem: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.brand,
    fontVariant: ['tabular-nums'],
  },
  trilha: { height: 8, backgroundColor: colors.softPurple, borderRadius: 8, overflow: 'hidden' },
  preenchimento: { height: '100%', backgroundColor: colors.brand, borderRadius: 8 },
});
