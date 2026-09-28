import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { SeletorTipoDiario } from '../../components/SeletorTipoDiario';
import { useDiarios } from '../../state/DiariosContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { formatarDataCurta, obterDataLocal } from '../../utils/formatarData';
import { DitadoPorVoz } from './DitadoPorVoz';

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
  const { entradas, adicionarEntrada, atualizarEntrada, excluirEntrada } = useDiarios();
  const [tipo, setTipo] = useState('REFLEXAO');
  const [texto, setTexto] = useState('');
  const [entradaEmEdicao, setEntradaEmEdicao] = useState(null);
  const [erro, setErro] = useState('');
  const conteudo = CONTEUDO_POR_TIPO[tipo];

  function limparFormulario() {
    setTexto('');
    setEntradaEmEdicao(null);
    setErro('');
  }

  function handleTipoChange(novoTipo) {
    setTipo(novoTipo);
    setErro('');
  }

  function handleSave() {
    if (!texto.trim()) {
      setErro('Escreva ou dite uma mensagem para continuar.');
      return;
    }

    const valores = {
      tipo,
      texto,
      dataRegistro: obterDataLocal(),
    };

    if (entradaEmEdicao) {
      atualizarEntrada(entradaEmEdicao, valores);
    } else {
      adicionarEntrada(valores);
    }

    limparFormulario();
  }

  function handleEdit(entrada) {
    setTipo(entrada.tipo);
    setTexto(entrada.texto);
    setEntradaEmEdicao(entrada.id);
    setErro('');
  }

  function handleDelete(entrada) {
    Alert.alert('Excluir entrada?', 'A entrada deixará de aparecer no seu histórico.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          excluirEntrada(entrada.id);
          if (entradaEmEdicao === entrada.id) {
            limparFormulario();
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
            setTexto(value);
            setErro('');
          }}
          placeholder={conteudo.placeholder}
          maxLength={10000}
          multiline
          error={erro}
          acaoNoCampo={
            <DitadoPorVoz
              textoAtual={texto}
              onTextoChange={(value) => {
                setTexto(value.slice(0, 10000));
                setErro('');
              }}
            />
          }
        />

        <View style={styles.actions}>
          <View style={styles.primaryAction}>
            <PrimaryButton
              label={entradaEmEdicao ? 'Salvar alterações' : conteudo.button}
              onPress={handleSave}
              showIcon={!entradaEmEdicao}
            />
          </View>
          {entradaEmEdicao ? (
            <View style={styles.secondaryAction}>
              <SecondaryButton label="Cancelar edição" onPress={limparFormulario} />
            </View>
          ) : null}
        </View>

        <View style={styles.history}>
          <Text style={styles.historyTitle}>Histórico</Text>
          {entradas.length === 0 ? (
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
                      onPress={() => handleEdit(entrada)}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar entrada de ${formatarDataCurta(entrada.dataRegistro)}`}
                      style={styles.textButton}
                    >
                      <Text style={styles.editText}>Editar</Text>
                    </Pressable>
                    <Pressable
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
        activeItem="diario"
        onPressMissoes={() => navigation.navigate('MissionList')}
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
