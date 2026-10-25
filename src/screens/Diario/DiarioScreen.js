import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { SeletorTipoDiario } from '../../components/SeletorTipoDiario';
import { DitadoPorVoz } from './DitadoPorVoz';
import { useDiarios } from '../../state/DiariosContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { formatarDataCurta, obterDataLocal } from '../../utils/formatarData';

const CONTEUDO_POR_TIPO = {
  REFLEXAO: {
    subtitle: 'Registre o que funcionou.',
    label: 'Reflexão de hoje',
    placeholder: 'O que funcionou hoje?',
    button: 'Registrar reflexão',
    history: 'Reflexão registrada',
  },
  DESLIZE: {
    subtitle: 'Sem culpa: entender o padrão também é progresso.',
    label: 'Explicação',
    placeholder: 'O que aconteceu?',
    button: 'Registrar e retomar',
    history: 'Deslize registrado',
  },
};

export function DiarioScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const {
    entradas,
    adicionarEntrada,
    atualizarEntrada,
    excluirEntrada,
    carregando,
    enviando,
    erro: erroServico,
    recarregar,
  } = useDiarios();
  const [tipo, setTipo] = useState('REFLEXAO');
  const [texto, setTexto] = useState('');
  const [entradaEmEdicao, setEntradaEmEdicao] = useState(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );
  const conteudo = CONTEUDO_POR_TIPO[tipo];

  function limparFormulario() {
    setTexto('');
    setEntradaEmEdicao(null);
    setErro('');
  }

  function handleTipoChange(novoTipo) {
    if (enviando) return;
    setSucesso('');
    setTipo(novoTipo);
    setErro('');
  }

  async function handleSave() {
    if (enviando) return;
    setSucesso('');
    if (!texto.trim() || texto.length > 10000) {
      setErro(
        texto.trim() ? 'O limite é de 10.000 caracteres.' : 'Escreva uma mensagem para continuar.',
      );
      return;
    }

    const valores = {
      tipo,
      texto,
      dataRegistro: entradaEmEdicao?.dataRegistro ?? obterDataLocal(),
    };

    const salvo = entradaEmEdicao
      ? await atualizarEntrada(entradaEmEdicao.id, valores)
      : await adicionarEntrada(valores);
    if (salvo) {
      limparFormulario();
      setSucesso('Entrada salva no seu diário.');
    }
  }

  function handleEdit(entrada) {
    setTipo(entrada.tipo);
    setTexto(entrada.texto);
    setEntradaEmEdicao(entrada);
    setSucesso('');
    setErro('');
  }

  function handleDelete(entrada) {
    Alert.alert('Excluir entrada?', 'A entrada deixará de aparecer no seu histórico.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSucesso('');
          if (await excluirEntrada(entrada.id)) {
            if (entradaEmEdicao?.id === entrada.id) limparFormulario();
            setSucesso('Entrada excluída.');
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: 28 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Diário de crescimento</Text>
          <Text style={styles.subtitle}>{conteudo.subtitle}</Text>
        </View>

        <SeletorTipoDiario value={tipo} onChange={handleTipoChange} />

        <InputField
          label={conteudo.label}
          value={texto}
          onChangeText={(value) => {
            if (enviando) return;
            setTexto(value);
            setSucesso('');
            setErro('');
          }}
          placeholder={conteudo.placeholder}
          editable={!enviando}
          maxLength={10000}
          multiline
          acaoNoCampo={
            !enviando && (
              <DitadoPorVoz
                textoAtual={texto}
                onTextoChange={(valor) => {
                  setTexto(valor);
                  setErro('');
                }}
              />
            )
          }
          error={erro}
        />

        <View style={styles.actions}>
          <View style={styles.primaryAction}>
            <PrimaryButton
              label={
                enviando ? 'Salvando…' : entradaEmEdicao ? 'Salvar alterações' : conteudo.button
              }
              disabled={enviando || carregando}
              onPress={handleSave}
              showIcon={!entradaEmEdicao}
            />
          </View>
          {entradaEmEdicao ? (
            <View style={styles.secondaryAction}>
              <SecondaryButton
                label="Cancelar edição"
                disabled={enviando}
                onPress={limparFormulario}
              />
            </View>
          ) : null}
        </View>

        {sucesso ? (
          <Text accessibilityLiveRegion="polite" style={styles.successText}>
            {sucesso}
          </Text>
        ) : null}
        <View style={styles.history}>
          <Text style={styles.historyTitle}>Histórico</Text>
          {erroServico ? (
            <View accessibilityLiveRegion="polite">
              <Text style={styles.deleteText}>{erroServico}</Text>
              <SecondaryButton
                label="Tentar novamente"
                disabled={enviando || carregando}
                onPress={recarregar}
              />
            </View>
          ) : null}
          {carregando ? (
            <View accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.brand} />
              <Text style={styles.emptyText}>Carregando histórico…</Text>
            </View>
          ) : null}
          {!erroServico && !carregando ? (
            <Pressable
              onPress={recarregar}
              disabled={enviando}
              accessibilityRole="button"
              accessibilityLabel="Atualizar histórico"
              style={styles.textButton}
            >
              <Text style={styles.editText}>Atualizar histórico</Text>
            </Pressable>
          ) : null}
          {entradas.length === 0 && !carregando && !erroServico ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Seu diário começa aqui</Text>
              <Text style={styles.emptyText}>
                Registre uma reflexão ou um deslize quando quiser encerrar o dia com mais clareza.
              </Text>
            </View>
          ) : (
            entradas.map((entrada) => (
              <View key={entrada.id} style={styles.historyCard}>
                <View style={styles.historyCardHeader}>
                  <View style={styles.historyCardText}>
                    <Text style={styles.historyDate}>
                      {formatarDataCurta(entrada.dataRegistro)}
                    </Text>
                    <Text style={styles.historyType}>
                      {CONTEUDO_POR_TIPO[entrada.tipo].history}
                    </Text>
                  </View>
                  <View style={styles.historyActions}>
                    <Pressable
                      disabled={enviando}
                      onPress={() => handleEdit(entrada)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar entrada de ${formatarDataCurta(entrada.dataRegistro)}`}
                      style={styles.textButton}
                    >
                      <Text style={styles.editText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      disabled={enviando}
                      onPress={() => handleDelete(entrada)}
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir entrada de ${formatarDataCurta(entrada.dataRegistro)}`}
                      style={styles.textButton}
                    >
                      <Text style={styles.deleteText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
                {entrada.texto ? <Text style={styles.historyBody}>{entrada.texto}</Text> : null}
              </View>
            ))
          )}
        </View>
      </KeyboardAwareScrollView>

      <BottomNav
        onPressLoja={() => navigation.navigate('Loja')}
        activeItem="diario"
        onPressMissoes={() => navigation.navigate('MissionList')}
        onPressPerfil={() => navigation.navigate('Conta')}
        onPressDiario={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 24,
  },
  header: {
    gap: 8,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.screenTitle,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryAction: {
    flex: 1,
  },
  successText: { fontFamily: fontFamily.regular, color: colors.success, fontSize: fontSize.body },
  history: {
    gap: 12,
    marginTop: 4,
  },
  historyTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  emptyState: {
    gap: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    borderRadius: 16,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  historyCard: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  historyCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyCardText: {
    flex: 1,
    gap: 4,
  },
  historyDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  historyType: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textPrimary,
  },
  historyActions: {
    flexDirection: 'row',
  },
  textButton: {
    minWidth: 52,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.brand,
  },
  deleteText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
  historyBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.input,
    lineHeight: 20,
    color: colors.textSecondaryAlt,
  },
});
