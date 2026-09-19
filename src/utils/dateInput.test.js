import { isValidDateString, maskDateInput } from './dateInput';

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
