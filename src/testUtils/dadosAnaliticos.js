// Dados exclusivos dos testes de contrato e navegação.
export const PERIODO_ANALITICO = {
  inicio: '2026-10-12',
  fim: '2026-10-18',
  fusoHorario: 'America/Sao_Paulo',
};
export function indicadoresDeTeste() {
  return {
    concluidas: 2,
    previstas: null,
    taxaConclusao: null,
    pontosGanhos: 60,
    pontosUtilizados: null,
    diasComConclusao: 2,
    quantidadeRegistros: 4,
  };
}
export function progressoDeTeste() {
  return {
    estado: 'disponivel',
    periodo: PERIODO_ANALITICO,
    indicadores: indicadoresDeTeste(),
    situacaoCenarios: 'historico_mensurado_indisponivel',
    mensagem: 'Seus registros deste período.',
  };
}
export function referenciasDeTeste() {
  return {
    estado: 'disponivel',
    areaDaVida: 'SONO_E_RECUPERACAO',
    versaoContrato: '1.0.0',
    mensagem: 'Contexto público de 2024; não é uma avaliação da sua rotina.',
    referencias: ['Vigitel', 'ATUS'].map((fonte) => ({
      pais: fonte === 'ATUS' ? 'Estados Unidos' : 'Brasil',
      dados: {
        id: `referencia-${fonte}`,
        fonte,
        edicao: 2024,
        titulo: `Sono ${fonte}`,
        medida: fonte === 'ATUS' ? 'duracao_participantes' : 'duracao_habitual',
        valores: { mediana: 420, p25: 360, p75: 480, unidade: 'minutos' },
        populacao:
          fonte === 'ATUS'
            ? 'População civil dos EUA a partir de 15 anos'
            : 'Adultos das capitais e DF',
        faixaEtaria: '18–28',
        tipoDia: 'todos',
        denominador: 'Respostas válidas; não representa sua duração pessoal.',
        pergunta: 'Como reservar espaço para a recuperação?',
        reflexao: 'Uma reflexão opcional.',
        limitacoes: ['Estimativa descritiva; não define duração ideal.'],
      },
      recorte: {
        faixaSolicitada: '25–28',
        faixaEfetiva: '18–28',
        tipoDiaEfetivo: 'todos',
        ampliado: true,
        filtrosEfetivos: { estuda: null, trabalha: null },
        avisos: ['Faixa etária ampliada para preservar a referência compatível.'],
      },
      origens: [
        {
          fonte: fonte === 'ATUS' ? 'atus_activity' : 'vigitel_harmonizado',
          edicao: '2024',
          urlFonte: 'https://www.bls.gov/tus/',
          sha256: 'a'.repeat(64),
        },
      ],
    })),
  };
}
export function relatorioDeTeste(
  resumo = 'Duas conclusões registradas, sem comparação de desempenho.',
) {
  return {
    estado: 'disponivel',
    periodo: PERIODO_ANALITICO,
    mensagem: 'Sua síntese está disponível.',
    podeTentarNovamente: false,
    relatorio: {
      id: 1,
      texto: {
        titulo: 'Sua semana de registros',
        resumo,
        proximoAjuste: 'Reveja um próximo passo possível.',
        reflexao: 'Qual ajuste faz sentido agora?',
      },
      indicadores: indicadoresDeTeste(),
      geracao: { provedor: 'ollama', modelo: 'modelo-de-teste' },
    },
  };
}
