import { validarProgresso } from './progresso';
import { objetivosDeTeste } from '../testUtils/objetivosAnaliticos';
import { progressoDeTeste } from '../testUtils/dadosAnaliticos';
const resposta = () => ({
  ...progressoDeTeste(),
  versaoContrato: '1.3.0',
  objetivos: objetivosDeTeste(),
});
it('aceita o contrato aditivo, instantes .NET e API anterior', () => {
  const dados = resposta();
  expect(validarProgresso(dados)).toBe(dados);
  expect(validarProgresso(progressoDeTeste()).objetivos).toBeUndefined();
});
it.each([
  [
    'pontos usados como resultado',
    (o) => {
      o.campanhas[0].resultado.unidade = 'PONTOS';
    },
  ],
  [
    'destaque inexistente',
    (o) => {
      o.campanhaEmDestaqueId = 99;
    },
  ],
  [
    'destaque sem atividade',
    (o) => {
      o.campanhaEmDestaqueId = 13;
    },
  ],
  [
    'campanha de épico ausente',
    (o) => {
      o.campanhas[0].epicoId = 99;
    },
  ],
  [
    'previsão sem ritmo',
    (o) => {
      o.campanhas[0].resultado.cenarioAtual.ritmoSemanal = 0;
    },
  ],
  [
    'contagem divergente',
    (o) => {
      o.campanhasEmAndamento = 10;
    },
  ],
])('recusa %s sem produzir um painel enganoso', (_, alterar) => {
  const dados = resposta();
  alterar(dados.objetivos);
  expect(() => validarProgresso(dados)).toThrow('Resposta dos objetivos indisponível.');
});
it('preserva incerteza, revisões negativas e total acima da meta', () => {
  const dados = resposta(),
    o = dados.objetivos;
  o.campanhaEmDestaqueId = null;
  o.estadoDestaque = 'historico_incompleto';
  o.campanhasSemRegistroRecente = null;
  o.campanhas[0].atividade.concluidasNosUltimosSeteDias = null;
  o.campanhas[0].resultado.valorAtual = 20;
  o.campanhas[0].resultado.evolucaoNoPeriodo.avancoRegistrado = -2;
  expect(validarProgresso(dados)).toBe(dados);
});
