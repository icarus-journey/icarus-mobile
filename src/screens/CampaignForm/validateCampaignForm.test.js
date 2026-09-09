import { isFormValid, validateCampaignForm } from './validateCampaignForm';

const VALID_VALUES = {
  titulo: 'Capacitação em Python',
  descricao: '',
  dataLimite: '30/09/2026',
  dificuldade: 'MEDIA',
  atribuirEpico: 'Não',
};

describe('validateCampaignForm', () => {
  it('não gera erros para dados válidos', () => {
    const errors = validateCampaignForm(VALID_VALUES);
    expect(isFormValid(errors)).toBe(true);
  });

  it('exige título', () => {
    const errors = validateCampaignForm({ ...VALID_VALUES, titulo: '  ' });
    expect(errors.titulo).toBeDefined();
  });

  it('rejeita data limite em formato inválido', () => {
    const errors = validateCampaignForm({ ...VALID_VALUES, dataLimite: '31/02/2026' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige data limite preenchida', () => {
    const errors = validateCampaignForm({ ...VALID_VALUES, dataLimite: '' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige dificuldade selecionada', () => {
    const errors = validateCampaignForm({ ...VALID_VALUES, dificuldade: null });
    expect(errors.dificuldade).toBeDefined();
  });

  it('exige épico quando atribuir a um épico é Sim', () => {
    const errors = validateCampaignForm({
      ...VALID_VALUES,
      atribuirEpico: 'Sim',
      epico: null,
    });
    expect(errors.epico).toBeDefined();
  });
});
