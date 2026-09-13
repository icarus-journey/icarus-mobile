import { buildPlanningSeedFromAnswers } from './onboardingToPlanning';

const BASE_ANSWERS = {
  areaPrioritaria: 'SAUDE',
  objetivosPorArea: ['PERDA_PESO', 'DORMIR_MELHOR'],
  tempoLivreDiasUteis: '2_3H',
};

describe('buildPlanningSeedFromAnswers', () => {
  it('retorna null quando a área prioritária não foi respondida', () => {
    expect(buildPlanningSeedFromAnswers({})).toBeNull();
  });

  it('gera 1 épico, 2 campanhas e 5 missões', () => {
    const seed = buildPlanningSeedFromAnswers(BASE_ANSWERS);

    expect(seed.epic).toBeDefined();
    expect(seed.campaigns).toHaveLength(2);
    expect(seed.missions).toHaveLength(5);
  });

  it('gera o mesmo total independente de quantos objetivos foram marcados na pergunta 13', () => {
    const umObjetivo = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      objetivosPorArea: ['PERDA_PESO'],
    });
    const semObjetivo = buildPlanningSeedFromAnswers({ ...BASE_ANSWERS, objetivosPorArea: [] });

    expect(umObjetivo.missions).toHaveLength(5);
    expect(semObjetivo.missions).toHaveLength(5);
  });

  it('gera conteúdo coerente com a área escolhida', () => {
    const seed = buildPlanningSeedFromAnswers(BASE_ANSWERS);

    expect(seed.epic.titulo).toBe('Cuidar da minha saúde');
    expect(seed.campaigns[0].titulo).toContain('vida mais saudável');
    expect(seed.campaigns[1].titulo).toBe('Cuidar do sono e da energia');
  });

  it('distribui as missões entre as duas campanhas geradas', () => {
    const seed = buildPlanningSeedFromAnswers(BASE_ANSWERS);
    const naPrimeira = seed.missions.filter((m) => m.campanhaIndex === 0);
    const naSegunda = seed.missions.filter((m) => m.campanhaIndex === 1);

    expect(naPrimeira.length + naSegunda.length).toBe(5);
    expect(naPrimeira.length).toBeGreaterThan(0);
    expect(naSegunda.length).toBeGreaterThan(0);
  });

  it('gera conteúdo diferente para cada área', () => {
    const saude = buildPlanningSeedFromAnswers({ ...BASE_ANSWERS, areaPrioritaria: 'SAUDE' });
    const financas = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      areaPrioritaria: 'FINANCAS',
    });

    expect(saude.epic.titulo).not.toBe(financas.epic.titulo);
  });

  it('ajusta a dificuldade conforme o tempo livre nos dias úteis', () => {
    const semTempo = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      tempoLivreDiasUteis: 'QUASE_NENHUM',
    });
    const comTempo = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      tempoLivreDiasUteis: 'MAIS_3H',
    });

    expect(semTempo.epic.dificuldade).toBe('TRIVIAL');
    expect(comTempo.epic.dificuldade).toBe('DIFICIL');
  });

  it('usa recorrência semanal quando o tempo livre é quase nenhum', () => {
    const seed = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      tempoLivreDiasUteis: 'QUASE_NENHUM',
    });

    expect(seed.missions[0].tipoRecorrencia).toBe('SEMANAL');
  });
});
