import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconDiario from '../assets/icons/icon-diario.svg';
import IconLoja from '../assets/icons/icon-loja.svg';
import IconMissoes from '../assets/icons/icon-missoes.svg';
import IconPerfil from '../assets/icons/icon-perfil.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

const ITENS = [
  { key: 'missoes', label: 'Missões', Icon: IconMissoes },
  { key: 'diario', label: 'Diário', Icon: IconDiario },
  { key: 'loja', label: 'Loja', Icon: IconLoja },
  { key: 'perfil', label: 'Perfil', Icon: IconPerfil },
];

export function BottomNav({ activeItem = 'missoes', onPressMissoes, onPressDiario }) {
  const insets = useSafeAreaInsets();
  const acoes = { missoes: onPressMissoes, diario: onPressDiario };

  return (
    <View
      style={[styles.container, { height: 76 + insets.bottom, paddingBottom: 6 + insets.bottom }]}
    >
      {ITENS.map(({ key, label, Icon }) => {
        const isActive = key === activeItem;
        const onPress = acoes[key];
        const content = (
          <>
            <View style={isActive ? styles.activeCircle : styles.iconContainer}>
              <Icon
                width={isActive ? 24 : 22}
                height={isActive ? 24 : 22}
                color={isActive ? colors.white : colors.textMuted}
              />
            </View>
            <Text style={isActive ? styles.activeLabel : styles.label}>{label}</Text>
          </>
        );

        return onPress ? (
          <Pressable
            key={key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            style={styles.item}
          >
            {content}
          </Pressable>
        ) : (
          <View
            key={key}
            style={styles.item}
            accessible
            accessibilityLabel={`${label}, ainda não disponível nesta versão`}
          >
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 76,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#e5e0ed',
    backgroundColor: colors.surface,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 72,
  },
  activeCircle: {
    width: 48,
    height: 46,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
  iconContainer: {
    width: 48,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
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
