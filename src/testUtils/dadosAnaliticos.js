// Dados exclusivos dos testes de contrato e navegação.
export function evolucaoDaMetaDeTeste(alteracoes = {}) {
  return {
    versaoContrato: '1.1.0',
    campanhaId: 12,
    valorAtual: 8,
    valorMensurado: 16,
    unidade: 'módulos',
    estado: 'emAndamento',
    podeRegistrar: true,
    metaAlcancada: false,
    versao: 'v1',
    medicoes: [],
    evolucao: {
      estado: 'disponivel',
      avancoRegistrado: 8,
      faltante: 8,
      fusoHorario: 'America/Sao_Paulo',
      pontos: ['2026-09-26', '2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24'].map(
        (data, i) => ({ data, valor: 2 * i, revisado: false }),
      ),
    },
    cenario: {
      disponivel: true,
      motivo: 'cenario_condicional_se_mantiver_o_ritmo',
      ritmoSemanal: 2,
      faltante: 8,
      semanasAproximadas: 4,
    },
    ...alteracoes,
  };
}
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
    recompensasResgatadas: 1,
    distribuicaoPorArea: [{ areaDaVida: 'ESTUDOS_E_APRENDIZADO', concluidas: 1 }],
    conclusoesSemArea: 1,
  };
}
export function progressoDeTeste() {
  return {
    estado: 'disponivel',
    periodo: PERIODO_ANALITICO,
    evolucao: {
      granularidade: 'dia',
      pontos: [
        { inicio: '2026-10-12', fim: '2026-10-12', concluidas: 1 },
        { inicio: '2026-10-13', fim: '2026-10-13', concluidas: 1 },
      ],
    },
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
