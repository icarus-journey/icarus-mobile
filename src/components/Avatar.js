import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import IconCamera from '../assets/icons/icon-camera.svg';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';

function inicial(nome) {
  return nome?.trim()?.charAt(0)?.toUpperCase() || '?';
}

/**
 * Avatar circular com um pequeno botão de câmera sobreposto (como em outros apps) pra trocar
 * a foto de perfil. Sem foto, mostra a inicial do nome num círculo colorido.
 */
export function Avatar({ nome, uriFoto, headersFoto, enviando, onPressCamera }) {
  return (
    <View style={styles.container}>
      <View style={styles.circulo}>
        {uriFoto ? (
          <Image source={{ uri: uriFoto, headers: headersFoto }} style={styles.imagem} />
        ) : (
          <Text style={styles.inicial}>{inicial(nome)}</Text>
        )}
        {enviando ? (
          <View style={styles.sobreposicaoCarregando}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : null}
      </View>
      <Pressable
        onPress={onPressCamera}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel="Trocar foto de perfil"
        style={styles.botaoCamera}
      >
        <IconCamera width={16} height={16} />
      </Pressable>
    </View>
  );
}

const TAMANHO = 96;

const styles = StyleSheet.create({
  container: {
    width: TAMANHO,
    height: TAMANHO,
  },
  circulo: {
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: TAMANHO / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  inicial: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.white,
  },
  sobreposicaoCarregando: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  botaoCamera: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandStrong,
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
