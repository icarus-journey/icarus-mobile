import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { estilosPainel as estilos } from './estilosPainel';

const PERIODOS = [
  ['semanaAnterior', 'Semana', 'Semana anterior completa'],
  ['mesAnterior', 'Mês', 'Mês anterior completo'],
  ['seisMeses', '6 meses', 'Últimos seis meses completos'],
];

export function SeletorPeriodoProgresso({ periodo, onChange }) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Período dos seus registros"
      style={locais.controle}
    >
      {PERIODOS.map(([id, titulo, descricao]) => (
        <Pressable
          key={id}
          accessibilityRole="tab"
          accessibilityLabel={descricao}
          accessibilityState={{ selected: periodo === id }}
          onPress={() => onChange(id)}
          style={[locais.opcao, periodo === id && locais.opcaoAtiva]}
        >
          <Text style={[estilos.opcaoTexto, periodo === id && locais.textoAtivo]}>{titulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const locais = StyleSheet.create({
  controle: { flexDirection: 'row', gap: 8 },
  opcao: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    backgroundColor: colors.surface,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoAtiva: { backgroundColor: colors.softPurple, borderColor: colors.brand },
  textoAtivo: { color: colors.brandDark },
});
