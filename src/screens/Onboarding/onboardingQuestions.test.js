import { getStepQuestion, TOTAL_ONBOARDING_STEPS } from './onboardingQuestions';

describe('onboardingQuestions', () => {
  it('define 13 passos ao total', () => {
    expect(TOTAL_ONBOARDING_STEPS).toBe(13);
  });

  it('cada uma das 12 primeiras perguntas é de resposta única com opções', () => {
    for (let index = 0; index < 12; index += 1) {
      const question = getStepQuestion(index, {});
      expect(question.type).toBe('single');
      expect(question.options.length).toBeGreaterThan(1);
    }
  });

  it.each(['SAUDE', 'CARREIRA_ESTUDOS', 'FINANCAS', 'RELACIONAMENTOS'])(
    'a pergunta 13 é de múltipla escolha e traz 4 opções padronizadas para %s',
    (area) => {
      const question = getStepQuestion(12, { areaPrioritaria: area });
      expect(question.type).toBe('multi');
      expect(question.options).toHaveLength(4);
      expect(question.title).toContain('Qual objetivo você deseja conquistar?');
    },
  );

  it('personaliza o título da pergunta 13 conforme a área escolhida na pergunta 10', () => {
    const saude = getStepQuestion(12, { areaPrioritaria: 'SAUDE' });
    const financas = getStepQuestion(12, { areaPrioritaria: 'FINANCAS' });

    expect(saude.title).toContain('Saúde');
    expect(financas.title).toContain('Finanças');
    expect(saude.options).not.toEqual(financas.options);
  });

  it('não quebra quando a área ainda não foi respondida', () => {
    const question = getStepQuestion(12, {});
    expect(question.options).toEqual([]);
  });
});
