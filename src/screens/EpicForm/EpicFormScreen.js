import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/Button';
import { DifficultySelector } from '../../components/DifficultySelector';
import { InputField } from '../../components/InputField';
import { ReadonlyField } from '../../components/ReadonlyField';
import { ScreenHeader } from '../../components/ScreenHeader';
import IconEdit from '../../assets/icons/icon-edit.svg';
import { useEpics } from '../../state/EpicsContext';
import { MOCK_CAMPANHAS_ATRIBUIDAS } from '../../state/epicMockData';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { maskDateInput } from '../../utils/dateInput';
import { isFormValid, validateEpicForm } from './validateEpicForm';

const INITIAL_VALUES = {
  titulo: '',
  descricao: '',
  dataLimite: '',
  dificuldade: null,
};

function valuesFromEpic(epic) {
  return {
    titulo: epic.titulo,
    descricao: epic.descricao ?? '',
    dataLimite: epic.dataLimite ?? '',
    dificuldade: epic.dificuldade,
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

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const validationErrors = validateEpicForm(values);
    setErrors(validationErrors);

    if (isFormValid(validationErrors)) {
      if (editingEpic) {
        updateEpic(editingEpic.id, values);
      } else {
        addEpic(values);
      }
      navigation.goBack();
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

        <View
          style={styles.inertButton}
          accessible
          accessibilityLabel="Adicionar campanha, ainda não disponível nesta versão"
        >
          <Text style={styles.inertButtonLabel}>Adicionar campanha</Text>
          <IconEdit width={24} height={24} />
        </View>

        <Text style={styles.groupLabel}>Campanhas atribuídas</Text>
        {/* Lista somente-leitura de exemplo — telas de Campanha (lista,
            criação, detalhe) ainda não existem nesta sprint. */}
        {MOCK_CAMPANHAS_ATRIBUIDAS.map((campanha) => (
          <View key={campanha.id} style={styles.assignedItem}>
            <Text style={styles.assignedItemLabel} numberOfLines={1}>
              {campanha.titulo}
            </Text>
            <Text style={styles.assignedItemFraction}>
              {campanha.progresso.concluidas}/{campanha.progresso.total}
            </Text>
          </View>
        ))}

        <View
          style={styles.seeAllLink}
          accessible
          accessibilityLabel="Ver todas, ainda não disponível nesta versão"
        >
          <Text style={styles.seeAllLinkLabel}>Ver todas ↓</Text>
        </View>

        <PrimaryButton
          label={editingEpic ? 'Salvar alterações' : 'Salvar épico'}
          onPress={handleSave}
        />
      </ScrollView>
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
  inertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  inertButtonLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.brandLink,
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
  seeAllLink: {
    height: 44,
    justifyContent: 'center',
  },
  seeAllLinkLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandDark,
  },
});
