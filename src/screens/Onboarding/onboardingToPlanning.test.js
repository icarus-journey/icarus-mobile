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

  it('gera épico e campanha coerentes com a área escolhida', () => {
    const seed = buildPlanningSeedFromAnswers(BASE_ANSWERS);

    expect(seed.epic.titulo).toBe('Cuidar da minha saúde');
    expect(seed.campaign.titulo).toContain('vida mais saudável');
  });

  it('gera uma missão para cada objetivo escolhido na pergunta 13', () => {
    const seed = buildPlanningSeedFromAnswers(BASE_ANSWERS);

    expect(seed.missions).toHaveLength(2);
    expect(seed.missions[0].titulo).toBe('Registrar as refeições do dia');
    expect(seed.missions[1].titulo).toBe('Desligar as telas 30 minutos antes de dormir');
  });

  it('gera conteúdo diferente para cada área', () => {
    const saude = buildPlanningSeedFromAnswers({ ...BASE_ANSWERS, areaPrioritaria: 'SAUDE' });
    const financas = buildPlanningSeedFromAnswers({
      ...BASE_ANSWERS,
      areaPrioritaria: 'FINANCAS',
      objetivosPorArea: ['INVESTIR'],
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

  it('não quebra quando nenhum objetivo foi marcado na pergunta 13', () => {
    const seed = buildPlanningSeedFromAnswers({ ...BASE_ANSWERS, objetivosPorArea: [] });

    expect(seed.missions).toEqual([]);
  });
});
