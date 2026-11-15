// Exemplos exclusivos dos testes; o aplicativo recebe estes campos da API.
export function objetivosDeTeste() {
  const atividade = (periodo, recente) => ({
    concluidasNoPeriodo: periodo,
    registrosConfirmadosNoPeriodo: periodo,
    diasComRegistrosNoPeriodo: Math.min(periodo, 2),
    concluidasNosUltimosSeteDias: recente,
    ultimaRealizacao: '2026-10-30T15:00:00.1234567+00:00',
  });
  const resultado = {
    estado: 'disponivel',
    valorAtual: 8,
    valorMensurado: 16,
    unidade: 'módulos',
    registrosNoPeriodo: 2,
    diasComRegistrosNoPeriodo: 2,
    baseDoAvanco: 'registro_anterior',
    evolucaoNoPeriodo: {
      estado: 'disponivel',
      avancoRegistrado: 2,
      faltante: 8,
      fusoHorario: 'America/Sao_Paulo',
      pontos: [
        { data: '2026-10-13', valor: 4, revisado: false },
        { data: '2026-10-17', valor: 6, revisado: false },
      ],
    },
    cenarioAtual: {
      disponivel: true,
      motivo: 'cenario_condicional_se_mantiver_o_ritmo',
      ritmoSemanal: 2,
      semanasAproximadas: 4,
      faltante: 8,
    },
  };
  return {
    consultadoEm: '2026-10-31T15:00:00.1234567+00:00',
    janelaRecente: { inicio: '2026-10-25', fim: '2026-10-31', fusoHorario: 'America/Sao_Paulo' },
    campanhasEmAndamento: 2,
    epicosEmAndamento: 1,
    campanhasSemRegistroRecente: 1,
    estadoDestaque: 'disponivel',
    campanhaEmDestaqueId: 12,
    campanhas: [
      {
        id: 12,
        epicoId: 1,
        titulo: 'Aprender mensageria',
        areaDaVida: 'estudosEAprendizado',
        estado: 'emAndamento',
        prazoFim: '2027-01-01',
        atividade: atividade(2, 3),
        resultado,
      },
      {
        id: 13,
        epicoId: 1,
        titulo: 'Caminhar no parque',
        areaDaVida: 'saudeECondicionamentoFisico',
        estado: 'emAndamento',
        prazoFim: '2027-01-01',
        atividade: atividade(0, 0),
        resultado: {
          estado: 'unidade_sem_resultado_mensurado',
          valorAtual: null,
          valorMensurado: null,
          unidade: null,
          registrosNoPeriodo: 0,
          diasComRegistrosNoPeriodo: 0,
          baseDoAvanco: null,
          evolucaoNoPeriodo: {
            estado: 'unidade_sem_resultado_mensurado',
            avancoRegistrado: null,
            faltante: null,
            pontos: [],
            fusoHorario: 'America/Sao_Paulo',
          },
          cenarioAtual: { disponivel: false, motivo: 'unidade_sem_resultado_mensurado' },
        },
      },
    ],
    epicos: [
      {
        id: 1,
        titulo: 'Minha jornada',
        estado: 'emAndamento',
        campanhas: { planejadas: 0, emAndamento: 2, concluidas: 0 },
        atividade: atividade(2, 3),
      },
    ],
  };
}
