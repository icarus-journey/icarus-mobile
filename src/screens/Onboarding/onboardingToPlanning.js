import { formatDateDaysFromNow } from '../../utils/dateInput';

// Conteúdo de épico, campanhas e missões por área (pergunta 10). Não é uma
// regra de domínio nem um contrato de API — é só o texto usado para
// transformar a resposta do onboarding num primeiro épico (1), duas
// campanhas (2) e cinco missões (5) de exemplo no aplicativo, para o
// usuário já encontrar o app preenchido ao terminar o onboarding.
const AREA_CONTENT = {
  SAUDE: {
    epico: {
      titulo: 'Cuidar da minha saúde',
      descricao: 'Pequenos passos diários para uma vida mais saudável.',
    },
    campanhas: [
      {
        titulo: 'Primeiros passos para uma vida mais saudável',
        descricao: 'Construir consistência antes de buscar grandes resultados.',
      },
      {
        titulo: 'Cuidar do sono e da energia',
        descricao: 'Uma rotina de descanso sustenta todo o resto.',
      },
    ],
    missoes: [
      {
        campanhaIndex: 0,
        titulo: 'Fazer uma refeição reforçada pós-treino',
        descricao: 'Priorize proteína e carboidrato logo após se exercitar.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Registrar as refeições do dia',
        descricao: 'Anote o que comeu para enxergar padrões com clareza.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Incluir uma porção de vegetais no almoço',
        descricao: 'Um passo simples e sustentável por dia.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Desligar as telas 30 minutos antes de dormir',
        descricao: 'Prepare o corpo para um sono mais tranquilo.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Fazer uma caminhada de 15 minutos',
        descricao: 'Movimento leve para recuperar energia ao longo do dia.',
      },
    ],
  },
  CARREIRA_ESTUDOS: {
    epico: {
      titulo: 'Avançar na carreira e nos estudos',
      descricao: 'Construir a base para o próximo passo profissional.',
    },
    campanhas: [
      {
        titulo: 'Primeiros passos na carreira e nos estudos',
        descricao: 'Consistência antes de resultado.',
      },
      {
        titulo: 'Desenvolvimento contínuo',
        descricao: 'Aprender um pouco todos os dias soma no longo prazo.',
      },
    ],
    missoes: [
      {
        campanhaIndex: 0,
        titulo: 'Atualizar o portfólio de conquistas do mês',
        descricao: 'Registre o que já entregou — isso sustenta a promoção.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Resolver 10 questões da matéria mais difícil',
        descricao: 'Prática deliberada no ponto mais fraco primeiro.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Praticar uma apresentação de 2 minutos em voz alta',
        descricao: 'Comunicação melhora com repetição, não com teoria.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Estudar 20 minutos de um curso novo',
        descricao: 'Um pouco todo dia soma mais do que muito de vez em quando.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Ler 10 páginas de um livro da área',
        descricao: 'Leitura curta e frequente constrói repertório.',
      },
    ],
  },
  FINANCAS: {
    epico: {
      titulo: 'Organizar minha vida financeira',
      descricao: 'Construir hábitos financeiros mais saudáveis.',
    },
    campanhas: [
      {
        titulo: 'Primeiros passos na organização financeira',
        descricao: 'Clareza sobre o presente antes de planejar o futuro.',
      },
      {
        titulo: 'Construir patrimônio',
        descricao: 'De pequenas reservas a novas fontes de renda.',
      },
    ],
    missoes: [
      {
        campanhaIndex: 0,
        titulo: 'Revisar os gastos da semana',
        descricao: 'Saber para onde o dinheiro vai é o primeiro passo.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Guardar um valor fixo do dia',
        descricao: 'Reserva se constrói aos poucos, não de uma vez.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Definir uma meta financeira do mês',
        descricao: 'Um objetivo claro orienta as próximas decisões.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Estudar 15 minutos sobre investimentos',
        descricao: 'Entenda antes de arriscar.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Dedicar 30 minutos a um projeto extra',
        descricao: 'Toda nova renda começa com um primeiro passo pequeno.',
      },
    ],
  },
  RELACIONAMENTOS: {
    epico: {
      titulo: 'Fortalecer meus relacionamentos',
      descricao: 'Investir tempo de qualidade em quem importa.',
    },
    campanhas: [
      {
        titulo: 'Primeiros passos para relacionamentos mais fortes',
        descricao: 'Presença consistente conta mais do que grandes gestos raros.',
      },
      {
        titulo: 'Novas experiências',
        descricao: 'Ampliar o círculo e viver momentos novos.',
      },
    ],
    missoes: [
      {
        campanhaIndex: 0,
        titulo: 'Ligar ou visitar um familiar',
        descricao: 'Presença regular fortalece o vínculo.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Chamar um amigo para conversar',
        descricao: 'Amizades precisam de manutenção, como qualquer outra coisa.',
      },
      {
        campanhaIndex: 0,
        titulo: 'Puxar assunto com alguém novo',
        descricao: 'Uma conversa por vez amplia seu círculo.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Pesquisar um destino e um orçamento',
        descricao: 'Toda viagem começa com uma pesquisa de 20 minutos.',
      },
      {
        campanhaIndex: 1,
        titulo: 'Organizar um encontro com amigos',
        descricao: 'Coloque uma data no calendário — isso faz acontecer.',
      },
    ],
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

  const dificuldade = DIFICULDADE_POR_TEMPO_LIVRE[answers.tempoLivreDiasUteis] ?? 'MEDIA';
  const tipoRecorrencia = answers.tempoLivreDiasUteis === 'QUASE_NENHUM' ? 'SEMANAL' : 'DIARIA';

  return {
    epic: {
      titulo: content.epico.titulo,
      descricao: content.epico.descricao,
      dataLimite: formatDateDaysFromNow(180),
      dificuldade,
    },
    campaigns: content.campanhas.map((campanha) => ({
      titulo: campanha.titulo,
      descricao: campanha.descricao,
      dataLimite: formatDateDaysFromNow(60),
      dificuldade,
    })),
    missions: content.missoes.map((missao) => ({
      titulo: missao.titulo,
      descricao: missao.descricao,
      dataLimite: formatDateDaysFromNow(3),
      dificuldade,
      recorrente: 'Sim',
      tipoRecorrencia,
      campanhaIndex: missao.campanhaIndex,
    })),
  };
}
