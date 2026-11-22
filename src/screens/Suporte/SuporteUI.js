import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconVoltar from '../../assets/icons/icon-chevron-left.svg';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { criarServicoSuporte } from '../../services/suporte';
import { useSessao } from '../../state/SessaoContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';

export const rotulosStatus = {
  recebido: 'Recebido',
  emAnalise: 'Em análise',
  resolvido: 'Resolvido',
  indisponivel: 'Status indisponível',
};

export function useServicoSuporte() {
  const { requisitarAutenticado } = useSessao();
  return useMemo(() => criarServicoSuporte(requisitarAutenticado), [requisitarAutenticado]);
}

export function useConsultaSuporte(consultar) {
  const atual = useRef(null);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(null);

  const atualizar = useCallback(async () => {
    atual.current?.abort();
    const controle = new AbortController();
    atual.current = controle;
    setCarregando(true);
    setFalha(null);
    try {
      const resposta = await consultar(controle.signal);
      if (!controle.signal.aborted) setDados(resposta);
    } catch (erro) {
      if (!controle.signal.aborted) setFalha(erro);
    } finally {
      if (!controle.signal.aborted) setCarregando(false);
    }
  }, [consultar]);

  useFocusEffect(
    useCallback(() => {
      atualizar();
      return () => atual.current?.abort();
    }, [atualizar]),
  );

  return { dados, carregando, falha, atualizar };
}

export function TelaSuporte({
  children,
  navigation,
  titulo,
  centralizarTitulo = false,
  atualizar,
  carregando,
  rodape,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={estilos.tela}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          estilos.conteudo,
          { paddingTop: insets.top + 16, paddingBottom: rodape ? 16 : insets.bottom + 24 },
        ]}
      >
        <View style={estilos.cabecalho}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={estilos.voltar}
            onPress={navigation.goBack}
          >
            <IconVoltar />
          </Pressable>
          {centralizarTitulo ? (
            <Text accessibilityRole="header" style={estilos.tituloCentral}>
              {titulo}
            </Text>
          ) : null}
          {atualizar ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: carregando }}
              disabled={carregando}
              onPress={atualizar}
              style={estilos.atualizar}
            >
              <Text style={estilos.acao}>{carregando ? 'Atualizando…' : 'Atualizar'}</Text>
            </Pressable>
          ) : null}
        </View>
        {titulo && !centralizarTitulo ? (
          <Text accessibilityRole="header" style={estilos.titulo}>
            {titulo}
          </Text>
        ) : null}
        {children}
      </KeyboardAwareScrollView>
      {rodape ? (
        <View style={[estilos.rodape, { paddingBottom: insets.bottom + 16 }]}>{rodape}</View>
      ) : null}
    </View>
  );
}

export function MarcadorStatus({ status }) {
  return <Text style={estilos.status}>{rotulosStatus[status] ?? rotulosStatus.indisponivel}</Text>;
}

export function AvisoSuporte({ children, titulo }) {
  return (
    <View accessibilityRole="alert" style={estilos.aviso}>
      {titulo ? <Text style={estilos.rotulo}>{titulo}</Text> : null}
      <Text style={estilos.texto}>{children}</Text>
    </View>
  );
}

export function CarregandoSuporte() {
  return <ActivityIndicator accessibilityLabel="Carregando relatos" color={colors.brand} />;
}

export const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.surface },
  conteudo: { flexGrow: 1, paddingHorizontal: 24, gap: 16 },
  cabecalho: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voltar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rodape: { paddingHorizontal: 24, paddingTop: 8, gap: 8, backgroundColor: colors.surface },
  titulo: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  tituloCentral: {
    flex: 1,
    marginRight: 44,
    textAlign: 'center',
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  subtitulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.title,
    color: colors.textPrimary,
  },
  rotulo: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.textPrimary },
  texto: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  nota: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  atualizar: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  acao: { fontFamily: fontFamily.semiBold, fontSize: fontSize.body, color: colors.brandLink },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.softPurple,
    color: colors.brandLink,
    fontSize: fontSize.base,
    fontFamily: fontFamily.medium,
  },
  aviso: { padding: 12, gap: 4, backgroundColor: colors.dangerSoft, borderRadius: 12 },
});
