import { isFormValid, validateMissionForm } from './validateMissionForm';

const VALID_VALUES = {
  titulo: 'Fazer exercício de dados',
  descricao: '',
  dataLimite: '25/12/2026',
  dificuldade: 'MEDIA',
  recorrente: 'Não',
  atribuirCampanha: 'Não',
};

describe('validateMissionForm', () => {
  it('não gera erros para dados válidos', () => {
    const errors = validateMissionForm(VALID_VALUES);
    expect(isFormValid(errors)).toBe(true);
  });

  it('exige título', () => {
    const errors = validateMissionForm({ ...VALID_VALUES, titulo: '  ' });
    expect(errors.titulo).toBeDefined();
  });

  it('rejeita data limite em formato inválido', () => {
    const errors = validateMissionForm({ ...VALID_VALUES, dataLimite: '31/02/2026' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige data limite preenchida', () => {
    const errors = validateMissionForm({ ...VALID_VALUES, dataLimite: '' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige dificuldade selecionada', () => {
    const errors = validateMissionForm({ ...VALID_VALUES, dificuldade: null });
    expect(errors.dificuldade).toBeDefined();
  });

  it('exige tipo de recorrência quando recorrente é Sim', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      recorrente: 'Sim',
      tipoRecorrencia: null,
    });
    expect(errors.tipoRecorrencia).toBeDefined();
  });

  it('exige campanha quando atribuir campanha é Sim', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      atribuirCampanha: 'Sim',
      campanha: null,
    });
    expect(errors.campanha).toBeDefined();
  });

  it('aceita "repetir até" em branco (repete indefinidamente)', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      recorrente: 'Sim',
      tipoRecorrencia: 'DIARIA',
      dataFimRecorrencia: '',
    });
    expect(errors.dataFimRecorrencia).toBeUndefined();
  });

  it('rejeita "repetir até" em formato inválido', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      recorrente: 'Sim',
      tipoRecorrencia: 'DIARIA',
      dataFimRecorrencia: '31/02/2026',
    });
    expect(errors.dataFimRecorrencia).toBeDefined();
  });

  it('rejeita "repetir até" no passado', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      recorrente: 'Sim',
      tipoRecorrencia: 'DIARIA',
      dataFimRecorrencia: '01/01/2020',
    });
    expect(errors.dataFimRecorrencia).toBeDefined();
  });

  it('aceita "repetir até" futura', () => {
    const errors = validateMissionForm({
      ...VALID_VALUES,
      recorrente: 'Sim',
      tipoRecorrencia: 'DIARIA',
      dataFimRecorrencia: '25/12/2030',
    });
    expect(errors.dataFimRecorrencia).toBeUndefined();
  });
});
