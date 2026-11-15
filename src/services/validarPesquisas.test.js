import { pesquisasQuantitativasDeTeste } from '../testUtils/dadosAnaliticos';
import { validarPesquisas } from './validarPesquisas';

it('aceita as duas relações publicadas, zero conhecido e ausência explícita de referência', () => {
  const dados = pesquisasQuantitativasDeTeste();
  expect(validarPesquisas(dados)).toBe(dados);
  dados.leituras[0].grupos[0].percentual = 0;
  expect(validarPesquisas(dados)).toBe(dados);
  expect(validarPesquisas({ versaoContrato: '1.2.0', leituras: [] }).leituras).toEqual([]);
});
it.each([null, -1, 101, NaN, '29.1'])(
  'recusa percentual inválido %s sem substituí-lo por zero',
  (valor) => {
    const dados = pesquisasQuantitativasDeTeste();
    dados.leituras[0].grupos[0].percentual = valor;
    expect(() => validarPesquisas(dados)).toThrow('Resposta das pesquisas indisponível.');
  },
);
it('recusa par incompleto, ausência de redação ou origem de cálculo e ids duplicados', () => {
  for (const alterar of [
    (d) => d.leituras[0].grupos.pop(),
    (d) => {
      d.leituras[0].leitura = '';
    },
    (d) => {
      d.leituras[0].referenciasIds = [];
    },
    (d) => {
      d.leituras[0].urlFonte = 'file:///fonte';
    },
    (d) => {
      d.leituras[1].id = d.leituras[0].id;
    },
  ]) {
    const dados = pesquisasQuantitativasDeTeste();
    alterar(dados);
    expect(() => validarPesquisas(dados)).toThrow();
  }
});
