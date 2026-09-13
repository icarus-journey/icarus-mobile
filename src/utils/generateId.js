let counter = 0;

// Date.now() sozinho pode colidir quando várias entidades são criadas na
// mesma sequência síncrona (ex.: o onboarding gerando missão a missão); o
// contador garante um id único mesmo dentro do mesmo milissegundo.
export function generateId(prefix) {
  counter += 1;
  return `${prefix}-${Date.now()}-${counter}`;
}
