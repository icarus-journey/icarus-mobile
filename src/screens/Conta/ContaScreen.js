import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Avatar } from '../../components/Avatar';
import { BottomNav } from '../../components/BottomNav';
import { SecondaryButton } from '../../components/Button';
import { atualizarFotoPerfil, obterPerfil, urlFotoPerfil } from '../../services/perfil';
import { useSessao } from '../../state/SessaoContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

const OPCOES_IMAGEM = { allowsEditing: true, aspect: [1, 1], quality: 0.7 };

export function ContaScreen({ navigation }) {
  const { sessao, sair, requisitarAutenticado } = useSessao();
  const [perfil, setPerfil] = useState(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let ativo = true;
    obterPerfil({ usuarioId: sessao.usuarioId, requisitarAutenticado })
      .then((resposta) => {
        if (ativo) setPerfil(resposta);
      })
      .catch(() => {
        // Tela segue funcional sem os dados do perfil (ex.: mostra "Sua conta" genérico).
      });
    return () => {
      ativo = false;
    };
  }, [sessao.usuarioId, requisitarAutenticado]);

  async function handleSair() {
    if (saindo) return;
    setSaindo(true);
    try {
      await sair();
    } catch {
      setErro('Não foi possível encerrar sua sessão com segurança. Tente novamente.');
      setSaindo(false);
    }
  }

  async function enviarImagem(resultado) {
    if (resultado.canceled) return;
    const imagem = resultado.assets[0];

    setEnviandoFoto(true);
    setErro('');
    try {
      await atualizarFotoPerfil({
        usuarioId: sessao.usuarioId,
        uri: imagem.uri,
        nomeArquivo: 'foto-perfil.jpg',
        contentType: 'image/jpeg',
        requisitarAutenticado,
      });
      setPerfil((atual) => ({ ...atual, temFoto: true }));
    } catch {
      setErro('Não foi possível atualizar a foto. Tente novamente.');
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      setErro('Permita o acesso à câmera para tirar uma foto.');
      return;
    }
    await enviarImagem(await ImagePicker.launchCameraAsync(OPCOES_IMAGEM));
  }

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      setErro('Permita o acesso à galeria para escolher uma foto.');
      return;
    }
    await enviarImagem(await ImagePicker.launchImageLibraryAsync(OPCOES_IMAGEM));
  }

  function handlePressCamera() {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      { text: 'Tirar foto', onPress: tirarFoto },
      { text: 'Escolher da galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Avatar
          nome={perfil?.nome}
          uriFoto={perfil?.temFoto ? urlFotoPerfil(sessao.usuarioId) : null}
          headersFoto={{ Authorization: `Bearer ${sessao.accessToken}` }}
          enviando={enviandoFoto}
          onPressCamera={handlePressCamera}
        />
        <Text style={styles.title}>{perfil?.nome ?? 'Sua conta'}</Text>
        <Text style={styles.text}>Você está conectado ao Icarus.</Text>
        {erro ? (
          <Text style={styles.error} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
        <SecondaryButton
          label={saindo ? 'Saindo…' : 'Sair da conta'}
          onPress={handleSair}
          disabled={saindo}
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
  content: { flex: 1, paddingHorizontal: 24, gap: 20, alignItems: 'flex-start' },
  title: { fontFamily: fontFamily.bold, fontSize: fontSize.screenTitle, color: colors.textPrimary },
  text: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.textSecondary },
  error: { color: colors.dangerText, fontFamily: fontFamily.regular },
});
