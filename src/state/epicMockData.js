import { colors } from '../theme';

// "Campanhas atribuídas" ainda não tem tela própria (lista, criação ou
// detalhe) nesta sprint — fica como exemplo somente-leitura dentro do
// formulário de épico, igual em qualquer épico criado ou editado.
export const MOCK_CAMPANHAS_ATRIBUIDAS = [
  { id: 'camp-1', titulo: 'Capacitação em Python', progresso: { concluidas: 2, total: 5 } },
  { id: 'camp-2', titulo: 'Comunicação estratégica', progresso: { concluidas: 1, total: 4 } },
  { id: 'camp-3', titulo: 'Liderança na prática', progresso: { concluidas: 0, total: 6 } },
];

export const MOCK_EPICS = [
  {
    id: 'epico-1',
    titulo: 'Ser promovido',
    descricao: 'Avance nas campanhas que sustentam seu grande objetivo.',
    dataLimite: '31/12/2027',
    prazoLabel: '31 dez.',
    dificuldade: 'DIFICIL',
    pontos: 1000,
    recompensaLabel: '1.000 pts + evolução',
    campanhasAtribuidas: MOCK_CAMPANHAS_ATRIBUIDAS,
    progresso: { concluidas: 2, total: 3 },
    corDestaque: colors.typeAccentB,
  },
  {
    id: 'epico-2',
    titulo: 'Melhorar comunicação',
    descricao: 'Ganhar clareza e confiança para falar em público.',
    dataLimite: '30/06/2027',
    prazoLabel: '30 jun.',
    dificuldade: 'MEDIA',
    pontos: 400,
    recompensaLabel: '400 pts',
    campanhasAtribuidas: [],
    progresso: null,
    corDestaque: colors.typeAccentB,
  },
  {
    id: 'epico-3',
    titulo: 'Fortalecer presença profissional',
    descricao: 'Construir uma rede de contatos mais ativa.',
    dataLimite: '31/03/2027',
    prazoLabel: '31 mar.',
    dificuldade: 'FACIL',
    pontos: 250,
    recompensaLabel: '250 pts',
    campanhasAtribuidas: [],
    progresso: null,
    corDestaque: colors.typeAccentB,
  },
];
