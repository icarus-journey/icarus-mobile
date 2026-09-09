import { colors } from '../theme';

// "Missões atribuídas" reaproveita o mesmo tratamento do Épico: lista
// somente-leitura de exemplo, igual em qualquer campanha criada ou editada,
// até existir um fluxo real de atribuição entre os formulários.
export const MOCK_MISSOES_ATRIBUIDAS = [
  { id: 'missao-a', titulo: 'Fundamentos da linguagem', pontos: 20 },
  { id: 'missao-b', titulo: 'Exercícios de dados', pontos: 20 },
  { id: 'missao-c', titulo: 'Projeto prático', pontos: 40 },
];

export const MOCK_CAMPAIGNS = [
  {
    id: 'campanha-1',
    titulo: 'Capacitação em Python',
    descricao: 'Conclua as missões para dominar fundamentos de Python.',
    destaque: true,
    dataLimite: '30/09/2026',
    prazoLabel: '30 set.',
    dificuldade: 'MEDIA',
    pontos: 500,
    pontosAtuais: 320,
    recompensaCurta: '300 pontos',
    recompensaLabel: '300 pontos + medalha',
    missoesAtribuidas: MOCK_MISSOES_ATRIBUIDAS,
    progresso: { concluidas: 4, total: 5 },
    epico: { id: 'epico-1', titulo: 'Ser promovida' },
    corDestaque: colors.typeAccentC,
  },
  {
    id: 'campanha-2',
    titulo: 'Leitura de 12 livros',
    descricao: 'Um livro por mês para ampliar repertório.',
    destaque: false,
    dataLimite: '31/12/2026',
    prazoLabel: '31 dez.',
    dificuldade: 'FACIL',
    pontos: 240,
    pontosAtuais: 60,
    recompensaCurta: '150 pontos',
    recompensaLabel: '150 pontos',
    missoesAtribuidas: [],
    progresso: null,
    epico: null,
    corDestaque: colors.typeAccentC,
  },
];
