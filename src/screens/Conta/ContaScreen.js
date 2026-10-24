import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Avatar } from '../../components/Avatar';
import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PickerModal } from '../../components/PickerModal';
import { ReadonlyField } from '../../components/ReadonlyField';
import { SelectField } from '../../components/SelectField';
import { atualizarFotoPerfil, criarServicoPerfil, urlFotoPerfil } from '../../services/perfil';
import { useSessao } from '../../state/SessaoContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { formularioDoPerfil, validarPerfil } from './validarPerfil';

const SITUACOES = [
  { id: 'nao-informado', titulo: 'Não informado', valor: null },
  { id: 'sim', titulo: 'Sim', valor: true },
  { id: 'nao', titulo: 'Não', valor: false },
];

const OPCOES_IMAGEM = { allowsEditing: true, aspect: [1, 1], quality: 0.7 };

export function ContaScreen({ navigation }) {
  const { sessao, sair, requisitarAutenticado } = useSessao();
  const usuarioId = sessao?.usuarioId;
  const servico = useMemo(
    () => criarServicoPerfil({ usuarioId, requisitarAutenticado }),
    [usuarioId, requisitarAutenticado],
  );
  const [perfil, setPerfil] = useState(null);
  const [formulario, setFormulario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [confirmarSaida, setConfirmarSaida] = useState(false);
  const [seletor, setSeletor] = useState(null);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const operacao = useRef(0);
  const ocupado = useRef(false);
  const insets = useSafeAreaInsets();

  const carregar = useCallback(async () => {
    const atual = ++operacao.current;
    ocupado.current = false;
    setCarregando(true);
    setSalvando(false);
    setPerfil(null);
    setFormulario(null);
    setErro('');
    setSucesso('');
    setErros({});
    try {
      const resposta = await servico.consultar();
      if (atual !== operacao.current) return;
      setPerfil(resposta);
      setFormulario(formularioDoPerfil(resposta));
    } catch {
      if (atual === operacao.current)
        setErro('Não foi possível carregar seu perfil. Confira a conexão e tente novamente.');
    } finally {
      if (atual === operacao.current) setCarregando(false);
    }
  }, [servico]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      return () => {
        operacao.current += 1;
      };
    }, [carregar]),
  );

  function alterar(campo, valor) {
    if (ocupado.current) return;
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setErros({});
    setSucesso('');
    setErro('');
  }

  async function salvar() {
    if (ocupado.current || !formulario) return;
    const validacao = validarPerfil(formulario);
    setErros(validacao.erros);
    setSucesso('');
    setErro('');
    if (Object.keys(validacao.erros).length) return;
    ocupado.current = true;
    setSalvando(true);
    const atual = operacao.current;
    try {
      const resposta = await servico.salvar(validacao.dados);
      if (atual !== operacao.current) return;
      setPerfil(resposta);
      setFormulario(formularioDoPerfil(resposta));
      setSucesso('Alterações salvas.');
    } catch (falha) {
      if (atual !== operacao.current) return;
      setErro(
        falha.status === 400
          ? 'Revise os dados de estudo e trabalho e tente novamente.'
          : 'Não foi possível salvar seu perfil. Suas alterações foram mantidas para tentar novamente.',
      );
    } finally {
      if (atual === operacao.current) {
        ocupado.current = false;
        setSalvando(false);
      }
    }
  }

  async function enviarImagem(resultado) {
    if (resultado.canceled) return;
    const imagem = resultado.assets[0];

    setEnviandoFoto(true);
    setErro('');
    setSucesso('');
    try {
      await atualizarFotoPerfil({
        usuarioId,
        uri: imagem.uri,
        nomeArquivo: 'foto-perfil.jpg',
        contentType: 'image/jpeg',
        requisitarAutenticado,
      });
      setPerfil((atual) => (atual ? { ...atual, temFoto: true } : atual));
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

  function trocarFoto() {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      { text: 'Tirar foto', onPress: tirarFoto },
      { text: 'Escolher da galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  async function encerrarSessao() {
    if (ocupado.current) return;
    ocupado.current = true;
    setSaindo(true);
    try {
      await sair();
    } catch {
      setErro('Não foi possível encerrar sua sessão com segurança. Tente novamente.');
      setConfirmarSaida(false);
      setSaindo(false);
      ocupado.current = false;
    }
  }

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
      >
        <Text style={styles.title} accessibilityRole="header">
          Perfil e configurações
        </Text>
        {carregando ? (
          <ActivityIndicator color={colors.brand} accessibilityLabel="Carregando perfil" />
        ) : null}
        {perfil && formulario ? (
          <>
            <View style={styles.identity}>
              <Avatar
                nome={perfil.nome}
                uriFoto={perfil.temFoto ? urlFotoPerfil(usuarioId) : null}
                headersFoto={{ Authorization: `Bearer ${sessao?.accessToken}` }}
                enviando={enviandoFoto}
                onPressCamera={trocarFoto}
              />
              <Text style={styles.name}>{perfil.nome}</Text>
            </View>
            <ReadonlyField label="Nome" value={perfil.nome} />
            <ReadonlyField label="E-mail" value={perfil.email} />
            <ReadonlyField
              label="Data de nascimento"
              value={perfil.dataNascimento?.split('-').reverse().join('/') ?? 'Não informada'}
            />
            <Text style={styles.section} accessibilityRole="header">
              Estudo e trabalho
            </Text>
            <Text style={styles.text}>
              Esses dados são opcionais. Você pode alterá-los ou deixá-los sem informar.
            </Text>
            {[
              ['estuda', 'Você estuda?', 'cargaHorariaEstudoSemanal', 'Horas de estudo por semana'],
              [
                'trabalha',
                'Você trabalha?',
                'cargaHorariaTrabalhoSemanal',
                'Horas de trabalho por semana',
              ],
            ].map(([campo, label, carga, labelCarga]) => (
              <View key={campo} style={styles.group}>
                <SelectField
                  label={label}
                  value={SITUACOES.find((item) => item.valor === formulario[campo])?.titulo}
                  onPress={() => {
                    if (!ocupado.current) setSeletor({ campo, carga, label });
                  }}
                />
                {formulario[campo] === true ? (
                  <InputField
                    label={labelCarga}
                    value={formulario[carga]}
                    onChangeText={(valor) => alterar(carga, valor)}
                    keyboardType="decimal-pad"
                    maxLength={6}
                    placeholder="Não informada"
                    helper="Opcional · de 0 a 168 horas"
                    error={erros[carga]}
                  />
                ) : null}
              </View>
            ))}
          </>
        ) : null}
        {erro ? (
          <Text style={styles.error} accessibilityRole="alert">
            {erro}
          </Text>
        ) : null}
        {sucesso ? (
          <Text style={styles.text} accessibilityLiveRegion="polite">
            {sucesso}
          </Text>
        ) : null}
        {!carregando && !perfil ? (
          <SecondaryButton label="Tentar novamente" onPress={carregar} />
        ) : null}
        {perfil ? (
          <PrimaryButton
            label={salvando ? 'Salvando…' : 'Salvar alterações'}
            onPress={salvar}
            disabled={salvando || saindo}
          />
        ) : null}
        <SecondaryButton
          label="Sair da conta"
          onPress={() => {
            if (!ocupado.current) setConfirmarSaida(true);
          }}
          disabled={salvando || saindo}
        />
      </KeyboardAwareScrollView>
      <BottomNav
        onPressLoja={() => navigation.navigate('Loja')}
        activeItem="perfil"
        onPressMissoes={() => navigation.navigate('MissionList')}
        onPressDiario={() => navigation.navigate('Diario')}
        onPressPerfil={() => {}}
      />
      <PickerModal
        visible={Boolean(seletor)}
        title={seletor?.label}
        items={SITUACOES}
        onClose={() => setSeletor(null)}
        onSelect={(item) => {
          if (!ocupado.current && seletor) {
            setFormulario((anterior) => ({
              ...anterior,
              [seletor.campo]: item.valor,
              [seletor.carga]: item.valor === true ? anterior[seletor.carga] : '',
            }));
            setErros({});
            setSucesso('');
            setErro('');
          }
          setSeletor(null);
        }}
      />
      <Modal
        visible={confirmarSaida}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!saindo) setConfirmarSaida(false);
        }}
      >
        <View style={styles.scrim}>
          <View style={styles.dialog} accessibilityViewIsModal>
            <Text style={styles.dialogTitle} accessibilityRole="header">
              Sair da conta?
            </Text>
            <Text style={styles.text}>
              Você precisará entrar novamente para continuar sua jornada.
            </Text>
            <SecondaryButton
              label="Cancelar"
              onPress={() => setConfirmarSaida(false)}
              disabled={saindo}
            />
            <PrimaryButton
              label={saindo ? 'Saindo…' : 'Sim, sair da conta'}
              onPress={encerrarSessao}
              disabled={saindo}
              showIcon={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  identity: { alignItems: 'center', gap: 8 },
  name: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  section: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
    marginTop: 8,
  },
  group: { gap: 16 },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  error: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.dangerText },
  scrim: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(29,21,48,0.52)' },
  dialog: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, gap: 16 },
  dialogTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.questionTitle,
    lineHeight: 28,
    color: colors.textPrimary,
  },
});
