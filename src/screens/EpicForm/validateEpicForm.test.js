import { isFormValid, validateEpicForm } from './validateEpicForm';

const VALID_VALUES = {
  titulo: 'Ser promovida',
  descricao: '',
  dataLimite: '31/12/2027',
  dificuldade: 'DIFICIL',
};

describe('validateEpicForm', () => {
  it('não gera erros para dados válidos', () => {
    const errors = validateEpicForm(VALID_VALUES);
    expect(isFormValid(errors)).toBe(true);
  });

  it('exige título', () => {
    const errors = validateEpicForm({ ...VALID_VALUES, titulo: '  ' });
    expect(errors.titulo).toBeDefined();
  });

  it('rejeita data limite em formato inválido', () => {
    const errors = validateEpicForm({ ...VALID_VALUES, dataLimite: '31/02/2027' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige data limite preenchida', () => {
    const errors = validateEpicForm({ ...VALID_VALUES, dataLimite: '' });
    expect(errors.dataLimite).toBeDefined();
  });

  it('exige dificuldade selecionada', () => {
    const errors = validateEpicForm({ ...VALID_VALUES, dificuldade: null });
    expect(errors.dificuldade).toBeDefined();
  });
});
