import { conteudoReferencia } from './conteudoReferencia';

it('traduz instruções editoriais em explicação simples sem alterar o dado', () => {
  const dados = { indicador: 'atus_sono_diario', titulo: 'Sono diário', valores: { mediana: 540 } };
  const conteudo = conteudoReferencia(dados);
  expect(conteudo.explicacao).toContain('cochilos');
  expect(conteudo.reflexao).not.toMatch(/prescrev|P25|mediana|causal|percentil/i);
  expect(dados.valores.mediana).toBe(540);
});

it('preserva o título de uma pesquisa desconhecida e oferece uma reflexão sem promessa', () => {
  const conteudo = conteudoReferencia({
    titulo: 'Tempo dedicado a aprender',
    areaDaVida: 'ESTUDOS_E_APRENDIZADO',
  });
  expect(conteudo.titulo).toBe('Tempo dedicado a aprender');
  expect(conteudo.reflexao).toContain('próximo passo');
  expect(conteudoReferencia({ titulo: 'Outro tema' }).explicacao).toBe('');
});
