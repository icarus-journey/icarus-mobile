import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipSelect } from '../../components/ChipSelect';
import { DifficultySelector } from '../../components/DifficultySelector';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PickerModal } from '../../components/PickerModal';
import { PrimaryButton } from '../../components/Button';
import { RadioBinary } from '../../components/RadioBinary';
import { ReadonlyField } from '../../components/ReadonlyField';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectField } from '../../components/SelectField';
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { maskDateInput } from '../../utils/dateInput';
import { validateMissionForm, isFormValid } from './validateMissionForm';

const RECORRENCIA_OPTIONS = [
  { value: 'DIARIA', label: 'Diária' },
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'MENSAL', label: 'Mensal' },
];

const INITIAL_VALUES = {
  titulo: '',
  descricao: '',
  dataLimite: '',
  dificuldade: null,
  recorrente: 'Não',
  tipoRecorrencia: 'DIARIA',
  atribuirCampanha: 'Não',
  campanha: null,
};

function valuesFromMission(mission) {
  return {
    titulo: mission.titulo,
    descricao: mission.descricao ?? '',
    dataLimite: mission.dataLimite ?? '',
    dificuldade: mission.dificuldade,
    recorrente: mission.recorrencia ? 'Sim' : 'Não',
    tipoRecorrencia: mission.recorrencia ?? 'DIARIA',
    atribuirCampanha: mission.campanha ? 'Sim' : 'Não',
    campanha: mission.campanha ?? null,
  };
}

export function MissionFormScreen({ navigation, route }) {
  const { addMission, updateMission, getMissionById, campaigns } = useMissions();
  const insets = useSafeAreaInsets();
  const editingMissionId = route.params?.missionId ?? null;
  const editingMission = editingMissionId ? getMissionById(editingMissionId) : null;

  const [values, setValues] = useState(() =>
    editingMission ? valuesFromMission(editingMission) : INITIAL_VALUES,
  );
  const [errors, setErrors] = useState({});
  const [campaignModalVisible, setCampaignModalVisible] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const validationErrors = validateMissionForm(values);
    setErrors(validationErrors);

    if (isFormValid(validationErrors)) {
      if (editingMission) {
        updateMission(editingMission.id, values);
      } else {
        addMission(values);
      }
      navigation.goBack();
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <ScreenHeader
          title={editingMission ? 'Editar missão' : 'Nova missão'}
          onBack={() => navigation.goBack()}
        />

        <InputField
          label="Título"
          required
          value={values.titulo}
          onChangeText={(text) => setField('titulo', text)}
          placeholder="Ex.: Fazer exercício de dados"
          maxLength={120}
          error={errors.titulo}
        />

        <InputField
          label="Descrição"
          value={values.descricao}
          onChangeText={(text) => setField('descricao', text)}
          placeholder="O que define a conclusão?"
          maxLength={1000}
          multiline
          error={errors.descricao}
        />

        <ReadonlyField label="Tipo" value="Missão" />

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

        <View style={styles.fieldGroup}>
          <Text style={styles.groupLabel}>Recorrente</Text>
          <RadioBinary
            value={values.recorrente}
            onChange={(value) => setField('recorrente', value)}
          />
        </View>

        {values.recorrente === 'Sim' ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.groupLabel}>Tipo de recorrência*</Text>
            <ChipSelect
              options={RECORRENCIA_OPTIONS}
              value={values.tipoRecorrencia}
              onSelect={(value) => setField('tipoRecorrencia', value)}
              accessibilityLabel="Tipo de recorrência"
            />
            {errors.tipoRecorrencia ? (
              <Text style={styles.errorText}>{errors.tipoRecorrencia}</Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.groupLabel}>Atribuir a uma campanha</Text>
          <RadioBinary
            value={values.atribuirCampanha}
            onChange={(value) => setField('atribuirCampanha', value)}
          />
        </View>

        {values.atribuirCampanha === 'Sim' ? (
          <>
            <SelectField
              label="Campanha"
              required
              value={values.campanha?.titulo}
              placeholder="Selecionar campanha"
              onPress={() => setCampaignModalVisible(true)}
              error={errors.campanha}
            />
            <Pressable
              onPress={() => setCampaignModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Ver todas as campanhas"
              style={styles.link}
            >
              <Text style={styles.linkLabel}>Ver todas as campanhas →</Text>
            </Pressable>
          </>
        ) : null}

        <PrimaryButton
          label={editingMission ? 'Salvar alterações' : 'Salvar missão'}
          onPress={handleSave}
        />
      </KeyboardAwareScrollView>

      <PickerModal
        visible={campaignModalVisible}
        title="Escolher campanha"
        items={campaigns}
        onSelect={(campaign) => {
          setField('campanha', campaign);
          setCampaignModalVisible(false);
        }}
        onClose={() => setCampaignModalVisible(false)}
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
  link: {
    height: 44,
    justifyContent: 'center',
  },
  linkLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.base,
    color: colors.brandLink,
  },
});
