import { agruparMissoesPorDia } from './agruparMissoesPorDia';

it('reúne missões do mesmo prazo e ordena os dias sem inventar dias vazios', () => {
  const missoes = Object.freeze([
    { id: 'depois', dataLimite: '11/11/2026' },
    { id: 'hoje-1', dataLimite: '08/11/2026' },
    { id: 'amanha', dataLimite: '09/11/2026' },
    { id: 'hoje-2', dataLimite: '08/11/2026' },
  ]);

  const grupos = agruparMissoesPorDia(missoes, '08/11/2026');

  expect(grupos.map((grupo) => grupo.titulo)).toEqual(['Hoje · 08/11', 'Amanhã · 09/11', '11/11']);
  expect(grupos[0].data.map((missao) => missao.id)).toEqual(['hoje-1', 'hoje-2']);
  expect(missoes[0].id).toBe('depois');
});

it.each([
  ['31/12/2026', '01/01/2027'],
  ['28/02/2028', '29/02/2028'],
  ['28/02/2027', '01/03/2027'],
])('reconhece amanhã após %s como %s', (hoje, amanha) => {
  const [grupo] = agruparMissoesPorDia([{ id: 'seguinte', dataLimite: amanha }], hoje);

  expect(grupo.titulo).toBe(`Amanhã · ${amanha.slice(0, 5)}`);
});

it('mantém chaves por data quando Hoje e Amanhã mudam na virada do dia', () => {
  const missoes = [{ id: 'missao', dataLimite: '09/11/2026' }];
  const [antes] = agruparMissoesPorDia(missoes, '08/11/2026');
  const [depois] = agruparMissoesPorDia(missoes, '09/11/2026');

  expect(antes.titulo).toBe('Amanhã · 09/11');
  expect(depois.titulo).toBe('Hoje · 09/11');
  expect(antes.key).toBe(depois.key);
});

it('agrupa prazos ausentes ou inválidos no fim sem atribuir uma data', () => {
  const grupos = agruparMissoesPorDia(
    [
      { id: 'ausente', dataLimite: null },
      { id: 'invalida', dataLimite: '31/02/2026' },
      { id: 'datada', dataLimite: '08/11/2026' },
    ],
    '08/11/2026',
  );

  expect(grupos.map((grupo) => grupo.titulo)).toEqual(['Hoje · 08/11', 'Sem data']);
  expect(grupos[1].data.map((missao) => missao.id)).toEqual(['ausente', 'invalida']);
  expect(agruparMissoesPorDia([], '08/11/2026')).toEqual([]);
});
