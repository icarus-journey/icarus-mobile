import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconDiario from '../assets/icons/icon-diario.svg';
import IconLoja from '../assets/icons/icon-loja.svg';
import IconMissoes from '../assets/icons/icon-missoes.svg';
import IconPerfil from '../assets/icons/icon-perfil.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const INERT_ITEMS = [
  { key: 'diario', label: 'Diário', Icon: IconDiario },
  { key: 'loja', label: 'Loja', Icon: IconLoja },
  { key: 'perfil', label: 'Perfil', Icon: IconPerfil },
];

export function BottomNav({ onPressMissoes }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { height: 76 + insets.bottom, paddingBottom: 6 + insets.bottom },
      ]}
    >
      <Pressable
        onPress={onPressMissoes}
        accessibilityRole="button"
        accessibilityLabel="Missões"
        style={styles.item}
      >
        <View style={styles.activeCircle}>
          <IconMissoes width={24} height={24} />
        </View>
        <Text style={styles.activeLabel}>Missões</Text>
      </Pressable>

      {INERT_ITEMS.map(({ key, label, Icon }) => (
        <View
          key={key}
          style={styles.item}
          accessible
          accessibilityLabel={`${label}, ainda não disponível nesta versão`}
        >
          <Icon width={22} height={22} />
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 76,
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e0ed',
    backgroundColor: colors.surface,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 86,
  },
  activeCircle: {
    width: 48,
    height: 46,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  activeLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.brand,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
