import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { isDataLimiteVencida } from '../../utils/dateInput';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { IconeAnalise } from './IconeAnalise';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

export function MetaEmFoco({ campanhas, onAbrir, onVerPesquisas, renderEvolucao }) {
  const { width, fontScale } = useWindowDimensions();
  const acoesEmpilhadas = width < 380 || fontScale > 1.3;
  const [indice, setIndice] = useState(0);
  const metas = campanhas
    .filter(
      (campanha) =>
        campanha.estado === 'emAndamento' &&
        campanha.valorMensurado > 0 &&
        campanha.valorAtual != null &&
        campanha.unidade &&
        !['ponto', 'pontos', 'xp'].includes(campanha.unidade.trim().toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.areaDaVida === 'estudosEAprendizado') -
        Number(a.areaDaVida === 'estudosEAprendizado'),
    );
  const meta = metas[indice % (metas.length || 1)];
  if (!meta) return null;
  return (
    <View style={estilos.cartao}>
      <View style={estilos.entre}>
        <Text style={[estilos.titulo, estilos.textoFlexivel]} accessibilityRole="header">
          Sua meta em foco
        </Text>
        {metas.length > 1 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver outra meta"
            onPress={() => setIndice(indice + 1)}
            style={estilos.botaoTexto}
          >
            <Text style={estilos.marca}>
              {(indice % metas.length) + 1}/{metas.length}
            </Text>
            <IconeAnalise nome="proximo" tamanho={16} />
          </Pressable>
        ) : (
          <IconeAnalise nome="brilho" />
        )}
      </View>
      <Text style={estilos.texto}>{meta.titulo}</Text>
      <View
        accessible
        accessibilityLabel={`${meta.titulo}: ${numeroPublico(meta.valorAtual)} de ${numeroPublico(meta.valorMensurado)} ${meta.unidade}`}
      >
        <Text style={locais.valor}>
          {numeroPublico(meta.valorAtual)}
          <Text style={locais.alvo}>
            {' '}
            / {numeroPublico(meta.valorMensurado)} {meta.unidade}
          </Text>
        </Text>
      </View>
      <View style={locais.trilho}>
        <View
          style={[
            locais.barra,
            {
              width: `${Math.max(0, Math.min(100, (meta.valorAtual / meta.valorMensurado) * 100))}%`,
            },
          ]}
        />
      </View>
      {renderEvolucao?.(meta.id)}
      {isDataLimiteVencida(meta.dataLimite) ? (
        <Text style={locais.prazo}>O prazo passou. Que tal rever o planejamento?</Text>
      ) : null}
      <View style={estilos.divisor} />
      <View style={locais.acoes}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver minha meta"
          onPress={() => onAbrir(meta.id)}
          style={[estilos.botaoTexto, locais.acao, acoesEmpilhadas && locais.acaoInteira]}
        >
          <Text style={[estilos.marca, estilos.textoFlexivel]}>Ver minha meta</Text>
          <IconeAnalise nome="seta" tamanho={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver pesquisas desta área"
          onPress={() => onVerPesquisas(meta.areaDaVida)}
          style={[estilos.botaoTexto, locais.acao, acoesEmpilhadas && locais.acaoInteira]}
        >
          <IconeAnalise nome="globo" tamanho={18} />
          <Text style={[estilos.marca, estilos.textoFlexivel]}>Ver pesquisas</Text>
        </Pressable>
      </View>
    </View>
  );
}

const locais = StyleSheet.create({
  prazo: { color: colors.dangerText, fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 18 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  acao: { flex: 1, flexBasis: '45%', minWidth: 110 },
  acaoInteira: { flexBasis: '100%' },
  valor: { fontFamily: fontFamily.bold, fontSize: 36, color: colors.brandDark },
  alvo: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.textSecondary },
  trilho: {
    height: 10,
    backgroundColor: colors.progressTrack,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barra: { height: '100%', borderRadius: 5, backgroundColor: colors.brand },
});
