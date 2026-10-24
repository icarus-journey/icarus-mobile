import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import IconCamera from '../assets/icons/icon-camera.svg';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';

function iniciais(nome) {
  const partes = nome?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!partes.length) return '?';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return `${partes[0][0]}${ultima}`.toUpperCase();
}

/**
 * Avatar circular com um pequeno botão de câmera sobreposto (como em outros apps) pra trocar
 * a foto de perfil. Sem foto, mostra as iniciais do nome num círculo colorido.
 */
export function Avatar({ nome, uriFoto, headersFoto, enviando, onPressCamera }) {
  return (
    <View style={styles.container}>
      <View style={styles.circulo}>
        {uriFoto ? (
          <Image source={{ uri: uriFoto, headers: headersFoto }} style={styles.imagem} />
        ) : (
          <Text style={styles.inicial}>{iniciais(nome)}</Text>
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

const TAMANHO = 72;

const styles = StyleSheet.create({
  container: {
    width: TAMANHO,
    height: TAMANHO,
  },
  circulo: {
    width: TAMANHO,
    height: TAMANHO,
    borderRadius: TAMANHO / 2,
    backgroundColor: '#ede5fa',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  inicial: {
    fontFamily: fontFamily.semiBold,
    fontSize: 24,
    color: '#47219c',
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
