const LEITURAS = {
  atus_sono_diario: {
    titulo: 'Como o sono ocupa o dia',
    explicacao: 'Conta o sono da noite e os cochilos em um dia inteiro.',
    reflexao: 'O que você poderia encerrar um pouco antes para abrir espaço para descansar?',
  },
  vigitel_duracao_sono_habitual: {
    titulo: 'Quanto tempo as pessoas dizem dormir',
    explicacao: 'É o tempo de sono por noite relatado pelos adultos da pesquisa.',
    reflexao: 'Que pequeno ajuste ajudaria você a encerrar o dia com mais calma?',
  },
  vigitel_atividade_sintomas_sono: {
    titulo: 'Atividade física e sono',
    explicacao: 'Pessoas que relataram sintomas frequentes de insônia em cada grupo.',
    reflexao: 'Como descanso e movimento cabem na sua rotina hoje?',
  },
  vigitel_atividade_deseja_mais_sono: {
    titulo: 'Movimento e vontade de dormir mais',
    explicacao: 'Pessoas que gostariam de dormir mais, em cada grupo.',
    reflexao: 'Que espaço você gostaria de reservar para descansar?',
  },
};

export function conteudoReferencia(dados) {
  return (
    LEITURAS[dados.indicador] ?? {
      titulo: dados.titulo,
      explicacao:
        dados.medida === 'participacao_no_dia'
          ? 'Pessoas que fizeram essa atividade no dia registrado pela pesquisa.'
          : '',
      reflexao:
        dados.areaDaVida === 'ESTUDOS_E_APRENDIZADO'
          ? 'Que horário cabe para o seu próximo passo nos estudos?'
          : 'Qual pequeno ajuste faz sentido para a sua rotina?',
    }
  );
}
