import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/Button';
import { DifficultySelector } from '../../components/DifficultySelector';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PickerModal } from '../../components/PickerModal';
import { ReadonlyField } from '../../components/ReadonlyField';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectField } from '../../components/SelectField';
import { useEpics } from '../../state/EpicsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { maskDateInput } from '../../utils/dateInput';
import { AREA_DA_VIDA_OPTIONS, labelDaAreaDaVida } from './areaDaVidaOptions';
import { isFormValid, validateEpicForm } from './validateEpicForm';

const INITIAL_VALUES = {
  titulo: '',
  descricao: '',
  dataLimite: '',
  dificuldade: null,
  areaDaVida: null,
};

function valuesFromEpic(epic) {
  return {
    titulo: epic.titulo,
    descricao: epic.descricao ?? '',
    dataLimite: epic.dataLimite ?? '',
    dificuldade: epic.dificuldade,
    areaDaVida: epic.areaDaVida,
  };
}

export function EpicFormScreen({ navigation, route }) {
  const { addEpic, updateEpic, getEpicById } = useEpics();
  const insets = useSafeAreaInsets();
  const editingEpicId = route.params?.epicId ?? null;
  const editingEpic = editingEpicId ? getEpicById(editingEpicId) : null;

  const [values, setValues] = useState(() =>
    editingEpic ? valuesFromEpic(editingEpic) : INITIAL_VALUES,
  );
  const [errors, setErrors] = useState({});
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const campanhasAtribuidas = editingEpic?.campanhasAtribuidas ?? [];

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    const validationErrors = validateEpicForm(values);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) return;

    setEnviando(true);
    setErroEnvio('');
    try {
      if (editingEpic) {
        await updateEpic(editingEpic.id, values);
      } else {
        await addEpic(values);
      }
      navigation.goBack();
    } catch {
      setErroEnvio('Não foi possível salvar o épico. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <ScreenHeader
          title={editingEpic ? 'Editar épico' : 'Novo épico'}
          onBack={() => navigation.goBack()}
        />

        <InputField
          label="Título"
          required
          value={values.titulo}
          onChangeText={(text) => setField('titulo', text)}
          placeholder="Ex.: Ser promovida"
          maxLength={120}
          error={errors.titulo}
        />

        <InputField
          label="Descrição"
          value={values.descricao}
          onChangeText={(text) => setField('descricao', text)}
          placeholder="Qual transformação este épico representa?"
          maxLength={1000}
          multiline
          error={errors.descricao}
        />

        <ReadonlyField label="Tipo" value="Épico" />

        {editingEpic ? (
          <ReadonlyField label="Área da vida" value={labelDaAreaDaVida(values.areaDaVida)} />
        ) : (
          <SelectField
            label="Área da vida"
            required
            value={labelDaAreaDaVida(values.areaDaVida)}
            placeholder="Selecionar área da vida"
            onPress={() => setAreaModalVisible(true)}
            error={errors.areaDaVida}
          />
        )}

        <InputField
          label="Data limite"
          required
          value={values.dataLimite}
          onChangeText={(text) => setField('dataLimite', maskDateInput(text))}
          placeholder="dd/mm/aaaa"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.dataLimite}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.groupLabel}>Dificuldade*</Text>
          <DifficultySelector
            value={values.dificuldade}
            onSelect={(value) => setField('dificuldade', value)}
          />
          {errors.dificuldade ? <Text style={styles.errorText}>{errors.dificuldade}</Text> : null}
        </View>

        {campanhasAtribuidas.length > 0 ? (
          <>
            <Text style={styles.groupLabel}>Campanhas atribuídas</Text>
            {campanhasAtribuidas.map((campanha) => (
              <View key={campanha.id} style={styles.assignedItem}>
                <Text style={styles.assignedItemLabel} numberOfLines={1}>
                  {campanha.titulo}
                </Text>
                {campanha.progresso ? (
                  <Text style={styles.assignedItemFraction}>
                    {campanha.progresso.concluidas}/{campanha.progresso.total}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {erroEnvio ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erroEnvio}
          </Text>
        ) : null}

        <PrimaryButton
          label={editingEpic ? 'Salvar alterações' : 'Salvar épico'}
          onPress={handleSave}
          disabled={enviando}
        />
      </KeyboardAwareScrollView>

      <PickerModal
        visible={areaModalVisible}
        title="Escolher área da vida"
        items={AREA_DA_VIDA_OPTIONS}
        onSelect={(area) => {
          setField('areaDaVida', area.id);
          setAreaModalVisible(false);
        }}
        onClose={() => setAreaModalVisible(false)}
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
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  fieldGroup: {
    gap: 8,
    width: '100%',
  },
  groupLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.input,
    color: colors.textPrimaryStrong,
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.dangerText,
  },
  assignedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.softPurpleLight,
  },
  assignedItemLabel: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.textPrimaryStrong,
  },
  assignedItemFraction: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandDark,
  },
});
