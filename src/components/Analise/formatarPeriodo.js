export function formatarPeriodo(periodo) {
  if (!periodo) return '';
  const data = (valor) => valor.split('-').reverse().join('/');
  return `${data(periodo.inicio)} a ${data(periodo.fim)} · Fuso: ${periodo.fusoHorario}`;
}
