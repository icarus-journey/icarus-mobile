import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico as numero } from './formatarReferencia';

export function GraficoSemanas({ comparacao }) {
  if (!comparacao) return null;
  const semanas = [...comparacao.semanasAnteriores.slice(0, 3).reverse(), comparacao.semana];
  const maximo = Math.max(1, ...semanas.map((s) => s.previstas ?? 0));
  const teto = Math.max(5, Math.ceil(maximo / 5) * 5);
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Últimas 4 semanas</Text>
      <View style={estilos.linha}>
        <View style={estilos.linha}>
          <View style={{ width: 10, height: 10, backgroundColor: colors.brand }} />
          <Text style={estilos.pequeno}>Feitas</Text>
        </View>
        <View style={estilos.linha}>
          <View
            style={{
              width: 10,
              height: 10,
              backgroundColor: colors.softPurple,
              borderWidth: 1,
              borderColor: colors.textSecondary,
            }}
          />
          <Text style={estilos.pequeno}>Não feitas</Text>
        </View>
      </View>
      <Text style={estilos.pequeno}>Missões</Text>
      <View style={locais.grafico}>
        <View style={locais.escala}>
          {[teto, teto * 0.75, teto * 0.5, teto * 0.25, 0].map((n) => (
            <Text key={n} style={locais.rotulo}>
              {numero(n)}
            </Text>
          ))}
        </View>
        <View style={locais.colunas}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[locais.grade, { bottom: (150 * i) / 4 }]} />
          ))}
          {semanas.map((s) => {
            const disponivel = s.estado !== 'historico_parcial';
            const feitas = s.concluidas ?? 0;
            const naoFeitas = disponivel ? s.previstas - feitas : 0;
            return (
              <View
                key={s.periodo.inicio}
                style={locais.coluna}
                accessible
                accessibilityLabel={`Semana encerrada em ${s.periodo.fim}: ${disponivel ? `${feitas} feitas de ${s.previstas} planejadas, ${s.taxaConclusao == null ? 'sem taxa' : `${numero(s.taxaConclusao)}%`}` : 'histórico parcial, sem comparação'}`}
              >
                <View style={locais.areaBarra}>
                  <Text style={locais.rotulo}>{disponivel ? s.previstas : '—'}</Text>
                  <View style={locais.barra}>
                    <View style={[locais.naoFeitas, { height: (naoFeitas / teto) * 150 }]}>
                      {naoFeitas > 0 && (naoFeitas / teto) * 150 >= 20 ? (
                        <Text style={locais.rotulo}>{naoFeitas}</Text>
                      ) : null}
                    </View>
                    <View style={[locais.feitas, { height: (feitas / teto) * 150 }]}>
                      {feitas > 0 && (feitas / teto) * 150 >= 20 ? (
                        <Text style={[locais.rotulo, { color: colors.white }]}>{feitas}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <View style={locais.rotulos}>
        {semanas.map((s) => (
          <View key={s.periodo.inicio} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={locais.rotulo}>
              {s.periodo.fim.slice(8, 10)}/{s.periodo.fim.slice(5, 7)}
            </Text>
            <Text style={locais.rotulo}>
              {s.taxaConclusao == null ? '—' : `${numero(s.taxaConclusao)}%`}
            </Text>
          </View>
        ))}
      </View>
      <Text style={[estilos.pequeno, { textAlign: 'center' }]}>Semana · data de encerramento</Text>
      <Text style={estilos.pequeno}>Total da coluna: planejadas. Abaixo: porcentagem feita.</Text>
      {semanas.some((s) => s.estado === 'historico_parcial') ? (
        <Text style={estilos.pequeno}>
          Lacunas indicam histórico parcial; ausência de registro não significa ausência da
          atividade.
        </Text>
      ) : null}
    </View>
  );
}
const locais = StyleSheet.create({
  grafico: { flexDirection: 'row', paddingTop: 22 },
  escala: { width: 32, height: 166, marginTop: -8, justifyContent: 'space-between' },
  colunas: { height: 150, flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  areaBarra: { alignItems: 'center', gap: 4 },
  barra: { width: 32, borderRadius: 6, overflow: 'hidden' },
  feitas: { backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  naoFeitas: { backgroundColor: colors.softPurple, alignItems: 'center', justifyContent: 'center' },
  grade: {
    height: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.borderDefault,
  },
  rotulos: { flexDirection: 'row', marginLeft: 32 },
  rotulo: { ...estilos.pequeno, fontSize: 11, lineHeight: 16 },
});
