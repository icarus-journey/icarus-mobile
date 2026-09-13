import { formatDateDaysFromNow } from '../../utils/dateInput';

// Conteúdo de épico e campanha por área (pergunta 10) e de missão por
// objetivo escolhido (pergunta 13). Não é uma regra de domínio nem um
// contrato de API — é só o texto usado para transformar as respostas do
// onboarding num primeiro épico/campanha/missão de exemplo no aplicativo.
const AREA_CONTENT = {
  SAUDE: {
    epico: {
      titulo: 'Cuidar da minha saúde',
      descricao: 'Pequenos passos diários para uma vida mais saudável.',
    },
    campanha: {
      titulo: 'Primeiros passos para uma vida mais saudável',
      descricao: 'Construir consistência antes de buscar grandes resultados.',
    },
    missoes: {
      GANHO_PESO: {
        titulo: 'Fazer uma refeição reforçada pós-treino',
        descricao: 'Priorize proteína e carboidrato logo após se exercitar.',
      },
      PERDA_PESO: {
        titulo: 'Registrar as refeições do dia',
        descricao: 'Anote o que comeu para enxergar padrões com clareza.',
      },
      MELHORAR_ALIMENTACAO: {
        titulo: 'Incluir uma porção de vegetais no almoço',
        descricao: 'Um passo simples e sustentável por dia.',
      },
      DORMIR_MELHOR: {
        titulo: 'Desligar as telas 30 minutos antes de dormir',
        descricao: 'Prepare o corpo para um sono mais tranquilo.',
      },
    },
  },
  CARREIRA_ESTUDOS: {
    epico: {
      titulo: 'Avançar na carreira e nos estudos',
      descricao: 'Construir a base para o próximo passo profissional.',
    },
    campanha: {
      titulo: 'Primeiros passos na carreira e nos estudos',
      descricao: 'Consistência antes de resultado.',
    },
    missoes: {
      SER_PROMOVIDO: {
        titulo: 'Atualizar o portfólio de conquistas do mês',
        descricao: 'Registre o que já entregou — isso sustenta a promoção.',
      },
      PASSAR_VESTIBULAR: {
        titulo: 'Resolver 10 questões da matéria mais difícil',
        descricao: 'Prática deliberada no ponto mais fraco primeiro.',
      },
      COMUNICACAO: {
        titulo: 'Praticar uma apresentação de 2 minutos em voz alta',
        descricao: 'Comunicação melhora com repetição, não com teoria.',
      },
      NOVA_HABILIDADE: {
        titulo: 'Estudar 20 minutos de um curso novo',
        descricao: 'Um pouco todo dia soma mais do que muito de vez em quando.',
      },
    },
  },
  FINANCAS: {
    epico: {
      titulo: 'Organizar minha vida financeira',
      descricao: 'Construir hábitos financeiros mais saudáveis.',
    },
    campanha: {
      titulo: 'Primeiros passos na organização financeira',
      descricao: 'Clareza sobre o presente antes de planejar o futuro.',
    },
    missoes: {
      INVESTIR: {
        titulo: 'Estudar 15 minutos sobre investimentos',
        descricao: 'Entenda antes de arriscar.',
      },
      QUITAR_DIVIDAS: {
        titulo: 'Revisar os gastos da semana',
        descricao: 'Saber para onde o dinheiro vai é o primeiro passo.',
      },
      NOVA_RENDA: {
        titulo: 'Dedicar 30 minutos a um projeto extra',
        descricao: 'Toda nova renda começa com um primeiro passo pequeno.',
      },
      RESERVA_EMERGENCIA: {
        titulo: 'Guardar um valor fixo do dia',
        descricao: 'Reserva se constrói aos poucos, não de uma vez.',
      },
    },
  },
  RELACIONAMENTOS: {
    epico: {
      titulo: 'Fortalecer meus relacionamentos',
      descricao: 'Investir tempo de qualidade em quem importa.',
    },
    campanha: {
      titulo: 'Primeiros passos para relacionamentos mais fortes',
      descricao: 'Presença consistente conta mais do que grandes gestos raros.',
    },
    missoes: {
      VIAJAR: {
        titulo: 'Pesquisar um destino e um orçamento',
        descricao: 'Toda viagem começa com uma pesquisa de 20 minutos.',
      },
      CONHECER_PESSOAS: {
        titulo: 'Puxar assunto com alguém novo',
        descricao: 'Uma conversa por vez amplia seu círculo.',
      },
      LACOS_FAMILIARES: {
        titulo: 'Ligar ou visitar um familiar',
        descricao: 'Presença regular fortalece o vínculo.',
      },
      CULTIVAR_AMIZADES: {
        titulo: 'Chamar um amigo para conversar',
        descricao: 'Amizades precisam de manutenção, como qualquer outra coisa.',
      },
    },
  },
};

// Quanto menos tempo livre nos dias úteis, mais leve deve ser o primeiro
// passo sugerido — evita propor algo inviável para a rotina informada.
const DIFICULDADE_POR_TEMPO_LIVRE = {
  QUASE_NENHUM: 'TRIVIAL',
  '1H': 'FACIL',
  '2_3H': 'MEDIA',
  MAIS_3H: 'DIFICIL',
};

export function buildPlanningSeedFromAnswers(answers) {
  const area = answers.areaPrioritaria;
  const content = AREA_CONTENT[area];
  if (!content) {
    return null;
  }

  const objetivosEscolhidos = answers.objetivosPorArea ?? [];
  const dificuldade = DIFICULDADE_POR_TEMPO_LIVRE[answers.tempoLivreDiasUteis] ?? 'MEDIA';
  const tipoRecorrencia = answers.tempoLivreDiasUteis === 'QUASE_NENHUM' ? 'SEMANAL' : 'DIARIA';

  const missoes = objetivosEscolhidos
    .map((objetivo) => content.missoes[objetivo])
    .filter(Boolean)
    .map((missaoContent) => ({
      titulo: missaoContent.titulo,
      descricao: missaoContent.descricao,
      dataLimite: formatDateDaysFromNow(3),
      dificuldade,
      recorrente: 'Sim',
      tipoRecorrencia,
    }));

  return {
    epic: {
      titulo: content.epico.titulo,
      descricao: content.epico.descricao,
      dataLimite: formatDateDaysFromNow(180),
      dificuldade,
    },
    campaign: {
      titulo: content.campanha.titulo,
      descricao: content.campanha.descricao,
      dataLimite: formatDateDaysFromNow(60),
      dificuldade,
    },
    missions: missoes,
  };
}
