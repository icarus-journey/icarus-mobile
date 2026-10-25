import { isDataLimiteVencida, isValidDateString, maskDateInput } from './dateInput';

describe('maskDateInput', () => {
  it('formata dígitos como dd/mm/aaaa', () => {
    expect(maskDateInput('25122026')).toBe('25/12/2026');
  });

  it('ignora caracteres não numéricos', () => {
    expect(maskDateInput('25/12/2026')).toBe('25/12/2026');
  });
});

describe('isValidDateString', () => {
  it('aceita uma data válida', () => {
    expect(isValidDateString('29/02/2028')).toBe(true);
  });

  it('rejeita 29 de fevereiro em ano não bissexto', () => {
    expect(isValidDateString('29/02/2026')).toBe(false);
  });

  it('rejeita datas incompletas', () => {
    expect(isValidDateString('25/12')).toBe(false);
  });
});

describe('isDataLimiteVencida', () => {
  const referencia = new Date(2026, 9, 19); // 19/10/2026

  it('considera vencida uma data anterior à referência', () => {
    expect(isDataLimiteVencida('01/01/2020', referencia)).toBe(true);
  });

  it('não considera vencida uma data futura', () => {
    expect(isDataLimiteVencida('31/12/2027', referencia)).toBe(false);
  });

  it('não considera vencida a própria data de referência (ainda dá tempo até o fim do dia)', () => {
    expect(isDataLimiteVencida('19/10/2026', referencia)).toBe(false);
  });

  it('não é vencida quando não há data limite', () => {
    expect(isDataLimiteVencida(null, referencia)).toBe(false);
  });
});
