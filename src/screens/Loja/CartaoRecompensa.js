import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import IconeExcluir from '../../assets/icons/icone-excluir-loja.svg';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';

export function CartaoRecompensa({
  titulo,
  descricao,
  custo,
  onPress,
  onExcluir,
  estado,
  previa = false,
}) {
  const [exclusaoVisivel, setExclusaoVisivel] = useState(false);
  return (
    <View style={styles.linha}>
      <Pressable
        onPress={onPress}
        onLongPress={onExcluir ? () => setExclusaoVisivel((atual) => !atual) : undefined}
        disabled={previa}
        accessibilityRole={previa ? undefined : 'button'}
        accessibilityLabel={`${titulo}, ${custo} pontos${estado ? `, ${estado}` : ''}`}
        accessibilityHint={
          onExcluir ? 'Toque para ver detalhes. Mantenha pressionado para excluir.' : undefined
        }
        style={({ pressed }) => [
          styles.cartao,
          previa && styles.previa,
          pressed && { opacity: 0.8 },
        ]}
      >
        {!previa ? (
          <View style={styles.icone}>
            <Text style={styles.estrela}>✦</Text>
          </View>
        ) : null}
        <View style={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.custo}>{custo} pts</Text>
          </View>
          {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
          {estado ? <Text style={styles.estado}>{estado}</Text> : null}
        </View>
      </Pressable>
      {onExcluir && exclusaoVisivel ? (
        <Pressable
          onPress={onExcluir}
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${titulo}`}
          style={styles.excluir}
        >
          <IconeExcluir />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { gap: 4 },
  previa: { minHeight: 82, borderColor: colors.borderDefault },
  cartao: {
    minHeight: 88,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.loja,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  icone: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.lojaSuave,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estrela: { fontFamily: fontFamily.bold, fontSize: 24, color: colors.loja },
  conteudo: { flex: 1, gap: 4 },
  cabecalho: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  titulo: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimaryStrong,
  },
  custo: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.lojaTexto },
  descricao: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textSecondaryAlt },
  estado: { fontFamily: fontFamily.semiBold, fontSize: 11, color: colors.lojaTexto },
  excluir: {
    minWidth: 44,
    minHeight: 44,
    alignSelf: 'flex-end',
    borderRadius: 12,
    padding: 10,
    backgroundColor: colors.dangerText,
  },
});
