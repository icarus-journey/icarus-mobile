import { intervaloDoPonto, nomeDoFuso, periodoCurto, rotuloDoPonto } from './formatarProgresso';

it('mostra datas curtas sem trocar dia por causa do fuso do dispositivo', () => {
  const ponto = { inicio: '2026-10-12', fim: '2026-10-18' };
  expect(periodoCurto(ponto)).toBe('12–18 out 2026');
  expect(rotuloDoPonto(ponto, 'dia')).toBe('seg');
  expect(rotuloDoPonto(ponto, 'semana')).toBe('12–18');
  expect(rotuloDoPonto(ponto, 'mes')).toBe('out');
  expect(intervaloDoPonto(ponto)).toBe('12–18 out 2026');
});

it('identifica mudança de ano e tolera período ausente', () => {
  expect(periodoCurto({ inicio: '2025-10-01', fim: '2026-03-31' })).toBe(
    '1 out 2025 – 31 mar 2026',
  );
  expect(periodoCurto(null)).toBe('');
  expect(rotuloDoPonto({}, 'dia')).toBe('');
  expect(nomeDoFuso('America/Sao_Paulo')).toBe('Horário de São Paulo');
  expect(nomeDoFuso(null)).toBe('');
});
