import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export function KeyboardAwareScrollView({
  children,
  contentContainerStyle,
  componenteRolagem: ComponenteRolagem = ScrollView,
  ...props
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
      style={styles.container}
    >
      <ComponenteRolagem
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={contentContainerStyle}
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ComponenteRolagem>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
