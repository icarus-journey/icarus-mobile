import { generateId } from './generateId';

describe('generateId', () => {
  it('gera ids únicos mesmo quando chamado em sequência síncrona', () => {
    const ids = Array.from({ length: 20 }, () => generateId('missao'));
    const unicos = new Set(ids);

    expect(unicos.size).toBe(ids.length);
  });

  it('inclui o prefixo informado', () => {
    expect(generateId('epico')).toMatch(/^epico-/);
  });
});
