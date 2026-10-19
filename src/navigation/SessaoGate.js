import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '../components/Button';
import { useSessao } from '../state/SessaoContext';
import { colors } from '../theme/colors';

export function SessaoGate({ children }) {
  const { carregando, erroRestauracao, restaurar, sair } = useSessao();
  const [erroSaida, setErroSaida] = useState('');
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    try {
      await sair();
    } catch {
      setErroSaida('Não foi possível remover a sessão. Tente novamente.');
    } finally {
      setSaindo(false);
    }
  }

  const bloqueado = carregando || Boolean(erroRestauracao);
  return (
    <View style={styles.raiz}>
      <View style={[styles.raiz, bloqueado && styles.oculto]}>{children}</View>
      {bloqueado ? (
        <View style={styles.container}>
          {carregando ? (
            <ActivityIndicator color={colors.brand} accessibilityLabel="Verificando sessão" />
          ) : (
            <>
              <Text accessibilityRole="alert">{erroSaida || erroRestauracao}</Text>
              <PrimaryButton label="Tentar novamente" onPress={restaurar} disabled={saindo} />
              <SecondaryButton label="Voltar para o login" onPress={handleSair} disabled={saindo} />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
  oculto: { display: 'none' },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    gap: 20,
    backgroundColor: colors.surface,
  },
});
