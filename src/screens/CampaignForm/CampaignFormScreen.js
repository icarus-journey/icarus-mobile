import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/Button';
import { DifficultySelector } from '../../components/DifficultySelector';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { PickerModal } from '../../components/PickerModal';
import { ReadonlyField } from '../../components/ReadonlyField';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectField } from '../../components/SelectField';
import IconEdit from '../../assets/icons/icon-edit.svg';
import { useCampaigns } from '../../state/CampaignsContext';
import { useEpics } from '../../state/EpicsContext';
import { useMissions } from '../../state/MissionsContext';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { maskDateInput } from '../../utils/dateInput';
import { isFormValid, validateCampaignForm } from './validateCampaignForm';

const INITIAL_VALUES = {
  titulo: '',
  descricao: '',
  dataLimite: '',
  dificuldade: null,
  epico: null,
};

function valuesFromCampaign(campaign) {
  return {
    titulo: campaign.titulo,
    descricao: campaign.descricao ?? '',
    dataLimite: campaign.dataLimite ?? '',
    dificuldade: campaign.dificuldade,
    epico: campaign.epico ?? null,
  };
}

export function CampaignFormScreen({ navigation, route }) {
  const { addCampaign, updateCampaign, getCampaignById } = useCampaigns();
  const { epics } = useEpics();
  const { missions } = useMissions();
  const insets = useSafeAreaInsets();
  const editingCampaignId = route.params?.campaignId ?? null;
  const editingCampaign = editingCampaignId ? getCampaignById(editingCampaignId) : null;

  const missoesAtribuidas = useMemo(
    () => missions.filter((mission) => mission.campanha?.id === editingCampaign?.id),
    [missions, editingCampaign?.id],
  );

  const [values, setValues] = useState(() =>
    editingCampaign ? valuesFromCampaign(editingCampaign) : INITIAL_VALUES,
  );
  const [errors, setErrors] = useState({});
  const [epicModalVisible, setEpicModalVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    const validationErrors = validateCampaignForm(values);
    setErrors(validationErrors);

    if (!isFormValid(validationErrors)) return;

    setEnviando(true);
    setErroEnvio('');
    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, values);
      } else {
        await addCampaign(values);
      }
      navigation.goBack();
    } catch {
      setErroEnvio('Não foi possível salvar a campanha. Tente novamente.');
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
          title={editingCampaign ? 'Editar campanha' : 'Nova campanha'}
          onBack={() => navigation.goBack()}
        />

        <InputField
          label="Título"
          required
          value={values.titulo}
          onChangeText={(text) => setField('titulo', text)}
          placeholder="Ex.: Capacitação em Python"
          maxLength={120}
          error={errors.titulo}
        />

        <InputField
          label="Descrição"
          value={values.descricao}
          onChangeText={(text) => setField('descricao', text)}
          placeholder="Descreva o resultado esperado"
          maxLength={1000}
          multiline
          error={errors.descricao}
        />

        <ReadonlyField label="Tipo" value="Campanha" />

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

        {editingCampaign ? (
          <Pressable
            onPress={() =>
              navigation.navigate('MissionForm', {
                campanha: { id: editingCampaign.id, titulo: editingCampaign.titulo },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Adicionar missão"
            style={({ pressed }) => [styles.addMissionButton, pressed && styles.addMissionButtonPressed]}
          >
            <Text style={styles.addMissionButtonLabel}>Adicionar missão</Text>
            <IconEdit width={24} height={24} />
          </Pressable>
        ) : null}

        {missoesAtribuidas.length > 0 ? (
          <>
            <Text style={styles.groupLabel}>Missões atribuídas</Text>
            {missoesAtribuidas.map((missao) => (
              <View key={missao.id} style={styles.assignedItem}>
                <Text style={styles.assignedItemLabel} numberOfLines={1}>
                  {missao.titulo}
                </Text>
                <Text style={styles.assignedItemFraction}>+{missao.pontos} XP</Text>
              </View>
            ))}
          </>
        ) : null}

        <SelectField
          label="Épico"
          required
          value={values.epico?.titulo}
          placeholder="Selecionar épico"
          onPress={() => setEpicModalVisible(true)}
          error={errors.epico}
        />

        {erroEnvio ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {erroEnvio}
          </Text>
        ) : null}

        <PrimaryButton
          label={editingCampaign ? 'Salvar alterações' : 'Salvar campanha'}
          onPress={handleSave}
          disabled={enviando}
        />
      </KeyboardAwareScrollView>

      <PickerModal
        visible={epicModalVisible}
        title="Escolher épico"
        items={epics}
        onSelect={(epic) => {
          setField('epico', epic);
          setEpicModalVisible(false);
        }}
        onClose={() => setEpicModalVisible(false)}
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
  addMissionButton: {
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
  addMissionButtonPressed: {
    opacity: 0.85,
  },
  addMissionButtonLabel: {
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
});
