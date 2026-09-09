const QUESTIONS = [
  {
    id: 'faixaEtaria',
    type: 'single',
    title: 'Qual a sua faixa etária?',
    options: [
      { value: 'MENOS_18', label: 'Menos de 18' },
      { value: '18_24', label: '18 a 24' },
      { value: '25_34', label: '25 a 34' },
      { value: '35_44', label: '35 a 44' },
      { value: '45_MAIS', label: '45+' },
    ],
  },
  {
    id: 'rotinaTrabalho',
    type: 'single',
    title: 'Como é sua rotina de trabalho?',
    options: [
      { value: 'NAO_TRABALHO', label: 'Não trabalho' },
      { value: 'MEIO_PERIODO', label: 'Meio período (até 6h)' },
      { value: 'INTEGRAL', label: 'Integral (8h)' },
      { value: 'INTENSA', label: 'Intensa (mais de 8h)' },
    ],
  },
  {
    id: 'horasSono',
    type: 'single',
    title: 'Quantas horas por noite você costuma dormir?',
    options: [
      { value: 'MENOS_5H', label: 'Menos de 5h' },
      { value: '5_7H', label: '5 a 7h' },
      { value: '7_9H', label: '7 a 9h' },
      { value: 'MAIS_9H', label: 'Mais de 9h' },
    ],
  },
  {
    id: 'periodoEnergia',
    type: 'single',
    title: 'Em qual período do dia você se sente com mais energia?',
    options: [
      { value: 'MANHA', label: 'Manhã' },
      { value: 'TARDE', label: 'Tarde' },
      { value: 'NOITE', label: 'Noite' },
      { value: 'OSCILA', label: 'Minha energia oscila muito' },
    ],
  },
  {
    id: 'tempoLivreDiasUteis',
    type: 'single',
    title: 'Quanto tempo livre você tem nos dias úteis?',
    options: [
      { value: 'QUASE_NENHUM', label: 'Quase nenhum' },
      { value: '1H', label: 'Cerca de 1 hora' },
      { value: '2_3H', label: '2 a 3 horas' },
      { value: 'MAIS_3H', label: 'Mais de 3 horas' },
    ],
  },
  {
    id: 'tempoDeslocamento',
    type: 'single',
    title: 'Quanto tempo você gasta em deslocamento/transporte?',
    options: [
      { value: 'HOME_OFFICE', label: 'Não me desloco (home office)' },
      { value: 'MENOS_1H', label: 'Menos de 1h' },
      { value: '1_2H', label: '1 a 2 horas' },
      { value: 'MAIS_2H', label: 'Mais de 2 horas' },
    ],
  },
  {
    id: 'tempoEstudoDiario',
    type: 'single',
    title: 'Quanto tempo diário você dedica aos estudos?',
    options: [
      { value: 'NAO_ESTUDO', label: 'Não estudo no momento' },
      { value: 'ATE_2H', label: 'Até 2 horas' },
      { value: '3_4H', label: '3 a 4 horas' },
      { value: 'MAIS_4H', label: 'Mais de 4 horas' },
    ],
  },
  {
    id: 'experienciaAppsHabito',
    type: 'single',
    title: 'Você já tentou criar hábitos com outros aplicativos antes?',
    options: [
      { value: 'NUNCA_USEI', label: 'Nunca usei' },
      { value: 'TENTEI_DESISTI', label: 'Tentei e desisti logo' },
      { value: 'USO_SEM_CONSTANCIA', label: 'Uso alguns, mas sem constância' },
    ],
  },
  {
    id: 'objetivoUmAno',
    type: 'single',
    title: 'O que você mais almeja alcançar daqui a 1 ano?',
    options: [
      { value: 'PRODUTIVIDADE', label: 'Ser mais produtivo e focado' },
      { value: 'VIDA_SAUDAVEL', label: 'Ter uma vida saudável e ativa' },
      { value: 'CRESCIMENTO', label: 'Crescer profissionalmente/nos estudos' },
      { value: 'EQUILIBRIO', label: 'Reduzir o estresse e ter equilíbrio' },
    ],
  },
  {
    id: 'areaPrioritaria',
    type: 'single',
    title: 'Quais áreas você quer priorizar hoje?',
    options: [
      { value: 'SAUDE', label: 'Saúde física e mental' },
      { value: 'CARREIRA_ESTUDOS', label: 'Carreira e estudos' },
      { value: 'FINANCAS', label: 'Finanças' },
      { value: 'RELACIONAMENTOS', label: 'Relacionamentos' },
    ],
  },
  {
    id: 'obstaculoDiario',
    type: 'single',
    title: 'Qual é o seu maior obstáculo diário?',
    options: [
      { value: 'PROCRASTINACAO', label: 'Procrastinação' },
      { value: 'FALTA_TEMPO', label: 'Falta de tempo' },
      { value: 'CANSACO', label: 'Cansaço constante' },
      { value: 'DESORGANIZACAO', label: 'Desorganização' },
      { value: 'DISTRACOES', label: 'Distrações (celular/redes sociais)' },
    ],
  },
  {
    id: 'tempoFimDeSemana',
    type: 'single',
    title: 'Quanto tempo do final de semana você pode dedicar a novos hábitos?',
    options: [
      { value: '15_30MIN', label: 'Apenas 15–30 min' },
      { value: '1_2H', label: '1 a 2 horas' },
      { value: 'PERIODO_INTEIRO', label: 'Um período inteiro' },
      { value: 'O_QUANTO_FOR_PRECISO', label: 'O quanto for preciso' },
    ],
  },
];

// Padronizadas em 4 opções por área para manter a mesma experiência de
// escolha em qualquer ramo do questionário (RELACIONAMENTOS tinha só 2
// sugeridas pelo usuário; completamos com objetivos coerentes com a área).
const OBJETIVOS_POR_AREA = {
  SAUDE: [
    { value: 'GANHO_PESO', label: 'Ganho de peso' },
    { value: 'PERDA_PESO', label: 'Perda de peso' },
    { value: 'MELHORAR_ALIMENTACAO', label: 'Melhorar a alimentação' },
    { value: 'DORMIR_MELHOR', label: 'Dormir melhor' },
  ],
  CARREIRA_ESTUDOS: [
    { value: 'SER_PROMOVIDO', label: 'Ser promovido' },
    { value: 'PASSAR_VESTIBULAR', label: 'Passar no vestibular' },
    { value: 'COMUNICACAO', label: 'Me comunicar melhor' },
    { value: 'NOVA_HABILIDADE', label: 'Aprender uma nova habilidade' },
  ],
  FINANCAS: [
    { value: 'INVESTIR', label: 'Começar a investir' },
    { value: 'QUITAR_DIVIDAS', label: 'Quitar minhas dívidas' },
    { value: 'NOVA_RENDA', label: 'Ter uma nova renda' },
    { value: 'RESERVA_EMERGENCIA', label: 'Criar uma reserva de emergência' },
  ],
  RELACIONAMENTOS: [
    { value: 'VIAJAR', label: 'Viajar' },
    { value: 'CONHECER_PESSOAS', label: 'Conhecer novas pessoas' },
    { value: 'LACOS_FAMILIARES', label: 'Fortalecer laços familiares' },
    { value: 'CULTIVAR_AMIZADES', label: 'Cultivar amizades' },
  ],
};

const AREA_TITLES = {
  SAUDE: 'Saúde',
  CARREIRA_ESTUDOS: 'Carreira e Estudos',
  FINANCAS: 'Finanças',
  RELACIONAMENTOS: 'Relacionamentos',
};

export const TOTAL_ONBOARDING_STEPS = QUESTIONS.length + 1;

export function getStepQuestion(stepIndex, answers) {
  if (stepIndex < QUESTIONS.length) {
    return QUESTIONS[stepIndex];
  }

  const area = answers.areaPrioritaria;
  const areaTitle = AREA_TITLES[area] ?? 'sua área';

  return {
    id: 'objetivosPorArea',
    type: 'multi',
    title: `Falando mais sobre ${areaTitle}. Qual objetivo você deseja conquistar?`,
    options: OBJETIVOS_POR_AREA[area] ?? [],
  };
}
