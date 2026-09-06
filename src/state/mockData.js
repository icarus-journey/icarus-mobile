import { colors } from '../theme';

export const MOCK_CAMPANHAS = [
  { id: 'camp-1', titulo: 'Capacitação em Python' },
  { id: 'camp-2', titulo: 'Leitura de 12 livros' },
  { id: 'camp-3', titulo: 'Economizar para viagem' },
];

export const MOCK_MISSIONS = [
  {
    id: 'missao-1',
    titulo: 'Fazer exercício de dados',
    descricao: 'Pratique análise de dados e avance na campanha.',
    status: 'ATRASADA',
    prazoLabel: 'Atrasada',
    prazoCompleto: 'Ontem, 18:00',
    dificuldade: 'MEDIA',
    pontos: 20,
    recorrencia: 'DIARIA',
    campanha: MOCK_CAMPANHAS[0],
    corDestaque: colors.typeAccentA,
    progresso: { concluidos: 3, total: 5 },
    recompensaLabel: '20 XP + 10 pontos',
  },
  {
    id: 'missao-2',
    titulo: 'Fazer exercício de dados',
    descricao: 'Pratique análise de dados e avance na campanha.',
    status: 'PENDENTE',
    prazoLabel: 'Hoje',
    prazoCompleto: 'Hoje, 18:00',
    dificuldade: 'MEDIA',
    pontos: 20,
    recorrencia: 'DIARIA',
    campanha: MOCK_CAMPANHAS[0],
    corDestaque: colors.typeAccentB,
    progresso: { concluidos: 3, total: 5 },
    recompensaLabel: '20 XP + 10 pontos',
  },
];

// Valores locais apenas para o card/detalhe de uma missão criada nesta sessão;
// não é um cálculo do domínio (RF-12 proíbe sugestão geral de pontuação) —
// o formulário desta sprint não coleta pontos, então usamos um valor fixo por
// dificuldade só para a interface não ficar sem o dado ao exibir o card novo.
const PONTOS_LOCAIS_POR_DIFICULDADE = {
  TRIVIAL: 10,
  FACIL: 15,
  MEDIA: 20,
  DIFICIL: 30,
};

export function pontosLocaisParaDificuldade(dificuldade) {
  return PONTOS_LOCAIS_POR_DIFICULDADE[dificuldade] ?? 10;
}
