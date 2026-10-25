import { lerValorProgresso, formatarValorProgresso } from './valorProgresso';
import { criarOperacaoId } from './criarOperacaoId';

it.each([
  ['0', 0],
  ['5,5', 5.5],
  ['5.50', 5.5],
  ['9999999999,99', 9999999999.99],
])('aceita o total %s sem interpretar como incremento', (texto, esperado) => {
  expect(lerValorProgresso(texto)).toBe(esperado);
});
it.each(['', '-1', '1.000,00', '2,333', '10000000000', 'NaN', '1e3'])(
  'rejeita total inválido %s',
  (texto) => {
    expect(lerValorProgresso(texto)).toBeNull();
  },
);
it('formata ausência e casas decimais sem transformar ausência em zero', () => {
  expect(formatarValorProgresso(null)).toBe('Não informado');
  expect(formatarValorProgresso(3.5)).toBe('3,5');
});
it('gera identificadores de tentativa distintos no formato UUID', () => {
  expect(criarOperacaoId()).toMatch(
    /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
  );
  expect(criarOperacaoId()).not.toBe(criarOperacaoId());
});
