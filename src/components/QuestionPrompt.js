import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

export function QuestionPrompt({ text }) {
  return (
    <View style={styles.bubble} accessibilityRole="header">
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: '100%',
    paddingVertical: 14,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.questionTitle,
    color: colors.textPrimary,
  },
});
