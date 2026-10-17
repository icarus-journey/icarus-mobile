import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { SecondaryButton } from '../../components/Button';
import { useSessao } from '../../state/SessaoContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

export function ContaScreen({ navigation }) {
  const { sair } = useSessao();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const insets = useSafeAreaInsets();

  async function handleSair() {
    if (enviando) return;
    setEnviando(true);
    try {
      await sair();
    } catch {
      setErro('Não foi possível encerrar sua sessão com segurança. Tente novamente.');
      setEnviando(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Sua conta</Text>
        <Text style={styles.text}>Você está conectado ao Icarus.</Text>
        {erro ? (
          <Text style={styles.error} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
        <SecondaryButton
          label={enviando ? 'Saindo…' : 'Sair da conta'}
          onPress={handleSair}
          disabled={enviando}
        />
      </View>
      <BottomNav
        activeItem="perfil"
        onPressMissoes={() => navigation.navigate('MissionList')}
        onPressDiario={() => navigation.navigate('Diario')}
        onPressPerfil={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, paddingHorizontal: 24, gap: 20 },
  title: { fontFamily: fontFamily.bold, fontSize: fontSize.screenTitle, color: colors.textPrimary },
  text: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.textSecondary },
  error: { color: colors.dangerText, fontFamily: fontFamily.regular },
});
