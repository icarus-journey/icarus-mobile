import { Pressable, StyleSheet, Text, View } from 'react-native';

import IconChevronLeft from '../assets/icons/icon-chevron-left.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function ScreenHeader({ title, onBack }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        style={styles.backButton}
        hitSlop={8}
      >
        <IconChevronLeft width={20} height={20} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginRight: 44,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimaryStrong,
  },
  spacer: {
    width: 0,
  },
});
