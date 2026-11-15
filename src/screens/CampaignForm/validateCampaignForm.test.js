import { isFormValid, validateCampaignForm } from './validateCampaignForm';

const VALID_VALUES = {
  titulo: 'Capacitação em Python',
  valorMensurado: '12',
  unidade: 'módulos',
  descricao: '',
  dataInicio: '01/09/2026',
  dataLimite: '30/09/2026',
  dificuldade: 'MEDIA',
  epico: { id: 1, titulo: 'Ser promovido' },
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

  it('exige um épico (campanha precisa estar atrelada a um épico)', () => {
    const errors = validateCampaignForm({ ...VALID_VALUES, epico: null });
    expect(errors.epico).toBeDefined();
  });
});

it('exige início válido e fim igual ou posterior ao início', () => {
  expect(
    validateCampaignForm({ ...VALID_VALUES, dataInicio: '31/02/2026' }).dataInicio,
  ).toBeTruthy();
  expect(validateCampaignForm({ ...VALID_VALUES, dataInicio: '' }).dataInicio).toBeTruthy();
  expect(
    validateCampaignForm({ ...VALID_VALUES, dataInicio: '01/10/2026' }).dataLimite,
  ).toBeTruthy();
  expect(
    isFormValid(validateCampaignForm({ ...VALID_VALUES, dataInicio: VALID_VALUES.dataLimite })),
  ).toBe(true);
});
