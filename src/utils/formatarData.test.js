import { formatarDataCurta, obterDataLocal } from './formatarData';

describe('formatarDataCurta', () => {
  it('formata uma data ISO para dia e mês', () => {
    expect(formatarDataCurta('2026-09-15')).toBe('15/09');
  });

  it('retorna vazio para uma data inválida', () => {
    expect(formatarDataCurta('15/09/2026')).toBe('');
  });
});

describe('obterDataLocal', () => {
  it('preserva a data do dispositivo sem conversão para UTC', () => {
    expect(obterDataLocal(new Date(2026, 8, 5, 23, 30))).toBe('2026-09-05');
  });
});
