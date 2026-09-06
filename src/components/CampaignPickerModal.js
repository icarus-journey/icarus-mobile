import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function CampaignPickerModal({ visible, campaigns, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar" />
      <View style={styles.sheet}>
        <Text style={styles.title}>Escolher campanha</Text>
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              accessibilityRole="button"
              accessibilityLabel={item.titulo}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <Text style={styles.itemLabel}>{item.titulo}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,20,56,0.4)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '60%',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.detailTitle,
    color: colors.textPrimaryStrong,
    marginBottom: 12,
  },
  item: {
    height: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefaultAlt,
  },
  itemPressed: {
    opacity: 0.6,
  },
  itemLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.label,
    color: colors.textPrimary,
  },
});
