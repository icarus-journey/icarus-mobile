import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { CartaoConexaoHabitos } from './CartaoConexaoHabitos';
import { BarraReferencia } from './BarraReferencia';
import { estilosPainel as estilos } from './estilosPainel';
import { duracaoPublica, numeroPublico } from './formatarReferencia';

export function ValoresDaReferencia({ dados, compacto = false }) {
  const valores = dados.valores;
  if (dados.medida === 'associacao')
    return <CartaoConexaoHabitos valores={valores} compacto={compacto} />;
  if (dados.medida === 'distribuicao_periodos')
    return (
      <View style={estilos.secao}>
        <Text style={estilos.pequeno}>Distribuição dos minutos registrados</Text>
        {[
          ['madrugada', 'Madrugada'],
          ['manha', 'Manhã'],
          ['tarde', 'Tarde'],
          ['noite', 'Noite'],
        ].map(([chave, rotulo]) => (
          <BarraReferencia key={chave} rotulo={rotulo} percentual={valores[chave]} />
        ))}
      </View>
    );
  return (
    <View style={estilos.secao}>
      {valores.mediana != null ? (
        <>
          <View
            style={locais.destaque}
            accessible
            accessibilityLabel={`Metade dos registros ficou até ${numeroPublico(valores.mediana)} minutos`}
          >
            <Text style={locais.valor}>{duracaoPublica(valores.mediana)}</Text>
            <Text style={estilos.pequeno}>
              {dados.medida === 'duracao_participantes'
                ? 'Entre quem fez a atividade, metade registrou até esse tempo.'
                : 'Metade dos registros ficou até esse tempo.'}
            </Text>
          </View>
          {!compacto && valores.p25 != null && valores.p75 != null ? (
            <View style={locais.dispersao}>
              <View>
                <Text style={estilos.pequeno}>25% dos registros até</Text>
                <Text style={estilos.marca}>{duracaoPublica(valores.p25)}</Text>
              </View>
              <View style={locais.linha} />
              <View>
                <Text style={estilos.pequeno}>75% dos registros até</Text>
                <Text style={estilos.marca}>{duracaoPublica(valores.p75)}</Text>
              </View>
            </View>
          ) : null}
          {!compacto ? (
            <Text style={estilos.pequeno}>
              As pessoas tiveram tempos diferentes. Esses valores não indicam quanto você deve
              fazer.
            </Text>
          ) : null}
        </>
      ) : valores.percentual != null ? (
        <>
          <Text style={locais.valor}>{numeroPublico(valores.percentual)}%</Text>
          <BarraReferencia percentual={valores.percentual} />
        </>
      ) : (
        <Text style={estilos.texto}>Valor não disponível.</Text>
      )}
    </View>
  );
}

const locais = StyleSheet.create({
  destaque: { gap: 4, paddingVertical: 4 },
  valor: { fontFamily: fontFamily.bold, fontSize: 44, color: colors.brandDark, letterSpacing: -1 },
  dispersao: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  linha: { height: 6, borderRadius: 3, backgroundColor: colors.progressTrack, flex: 1 },
});
