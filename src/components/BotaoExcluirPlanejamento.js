import { Alert, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, fontSize } from '../theme';
import { SecondaryButton } from './Button';

export function BotaoExcluirPlanejamento({
  nome,
  hierarquia = false,
  aoExcluir,
  excluindo,
  erro,
  disabled,
}) {
  function perguntar() {
    Alert.alert(
      `Excluir ${nome}?`,
      !hierarquia
        ? 'Ela sai da rotina. Conclusões e pontos ficam salvos.'
        : 'O planejamento vinculado também sai da rotina. Conclusões, histórico e pontos ficam salvos.',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: aoExcluir },
      ],
    );
  }

  return (
    <View style={styles.container}>
      {erro ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
      <SecondaryButton
        label={excluindo ? 'Excluindo...' : `Excluir ${nome}`}
        onPress={perguntar}
        disabled={disabled || excluindo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  erro: { color: colors.dangerText, fontFamily: fontFamily.regular, fontSize: fontSize.base },
});
