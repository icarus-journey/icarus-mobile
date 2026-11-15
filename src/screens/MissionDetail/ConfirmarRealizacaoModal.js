import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { deDataIso, maskDateInput } from '../../utils/dateInput';
import {
  camposDoMomento,
  mascararHorario,
  paraRealizacaoNaApi,
  validarRealizacao,
} from '../../utils/realizacaoMissao';

export function ConfirmarRealizacaoModal({
  execucao,
  aoConfirmar,
  aoCancelar,
  enviando,
  erro,
  espacoInferior = 0,
}) {
  const [campos, setCampos] = useState(() => camposDoMomento(execucao.fusoHorario));
  const [erros, setErros] = useState({});
  function alterar(campo, valor) {
    setCampos((atuais) => ({ ...atuais, [campo]: valor }));
    setErros((atuais) => ({ ...atuais, [campo]: '' }));
  }
  function confirmar() {
    if (enviando) return;
    const falhas = validarRealizacao(campos);
    setErros(falhas);
    if (Object.keys(falhas).length) return;
    Keyboard.dismiss();
    aoConfirmar(paraRealizacaoNaApi(campos));
  }
  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!enviando) aoCancelar();
      }}
    >
      <View style={styles.fundo}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessible={false}
          importantForAccessibility="no"
          onPress={aoCancelar}
          disabled={enviando}
          accessibilityRole="button"
          accessibilityLabel="Cancelar escolha do momento"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.posicao}
          pointerEvents="box-none"
        >
          <View style={styles.folha} accessibilityViewIsModal>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.conteudo,
                { paddingBottom: Math.max(24, espacoInferior + 16) },
              ]}
            >
              <Text style={styles.titulo} accessibilityRole="header">
                Quando você fez?
              </Text>
              {execucao.dataPrevista ? (
                <Text style={styles.subtitulo}>
                  Prevista para {deDataIso(execucao.dataPrevista)}
                </Text>
              ) : null}
              <View style={styles.campos}>
                <View style={styles.data}>
                  <InputField
                    label="Data"
                    value={campos.data}
                    onChangeText={(valor) => alterar('data', maskDateInput(valor))}
                    placeholder="DD/MM/AAAA"
                    keyboardType="number-pad"
                    maxLength={10}
                    error={erros.data}
                    editable={!enviando}
                  />
                </View>
                <View style={styles.horario}>
                  <InputField
                    label="Horário"
                    value={campos.horario}
                    onChangeText={(valor) => alterar('horario', mascararHorario(valor))}
                    placeholder="HH:MM"
                    keyboardType="number-pad"
                    maxLength={5}
                    error={erros.horario}
                    editable={!enviando}
                  />
                </View>
              </View>
              {erro ? (
                <Text
                  style={styles.erro}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  {erro}
                </Text>
              ) : null}
              <PrimaryButton
                label={enviando ? 'Concluindo...' : 'Confirmar conclusão'}
                onPress={confirmar}
                disabled={enviando}
                showIcon={false}
              />
              <SecondaryButton label="Cancelar" onPress={aoCancelar} disabled={enviando} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(31,20,56,0.4)' },
  posicao: { flex: 1, justifyContent: 'flex-end' },
  folha: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  conteudo: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  titulo: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.questionTitle,
    color: colors.textPrimaryStrong,
  },
  subtitulo: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  campos: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  data: { flexGrow: 2, flexBasis: 150 },
  horario: { flexGrow: 1, flexBasis: 110 },
  erro: { fontFamily: fontFamily.regular, fontSize: fontSize.body, color: colors.dangerText },
});
