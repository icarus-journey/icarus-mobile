import { duracaoPublica, numeroPublico } from './formatarReferencia';

it('mostra minutos como horas legíveis sem chamar mediana de média', () => {
  expect(duracaoPublica(420)).toBe('7 h');
  expect(duracaoPublica(465)).toBe('7 h 45 min');
  expect(duracaoPublica(25)).toBe('25 min');
  expect(duracaoPublica(0)).toBe('0 min');
  expect(numeroPublico(64.4)).toBe('64,4');
});

it('não inventa uma duração ausente ou inválida', () => {
  expect(duracaoPublica(null)).toBe('Não disponível');
  expect(duracaoPublica(-3)).toBe('Não disponível');
  expect(duracaoPublica('inválido')).toBe('Não disponível');
});
