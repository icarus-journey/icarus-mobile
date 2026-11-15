import { mesesDeConsulta } from '../../utils/mesesDeConsulta';
import { periodoCurto } from '../../utils/formatarProgresso';
export const FILTROS_EXTRATO = { periodo: 'ultimos30', natureza: 'todos' };
export const NATUREZAS = [
  { id: 'todos', titulo: 'Todos' },
  { id: 'recebidos', titulo: 'Recebidos' },
  { id: 'usados', titulo: 'Usados' },
];
export const TIPOS_MOVIMENTO = {
  ganhoMissao: 'Missão feita',
  compraItem: 'Recompensa resgatada',
  estornoResgate: 'Resgate desfeito',
  bonus: 'Bônus recebido',
  ajuste: 'Ajuste',
};
export function opcoesPeriodoExtrato(referencia = new Date(), fuso) {
  return [
    { id: 'ultimos30', titulo: 'Últimos 30 dias' },
    { id: 'todoHistorico', titulo: 'Todo o histórico' },
    ...mesesDeConsulta(referencia, fuso),
  ];
}
export function selecionarPeriodoExtrato(filtro, p) {
  const proximo = { ...filtro, periodo: p.id };
  delete proximo.inicio;
  delete proximo.fim;
  delete proximo.todoHistorico;
  if (p.id === 'todoHistorico') proximo.todoHistorico = true;
  if (p.inicio) {
    proximo.inicio = p.inicio;
    proximo.fim = p.fim;
  }
  return proximo;
}
export function tituloMovimento(m) {
  return m.tituloOrigem ?? TIPOS_MOVIMENTO[m.tipo];
}
export function horarioMovimento(instante, fuso) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: fuso,
  }).format(new Date(instante));
}
function diaLocal(referencia, fuso) {
  const p = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: fuso,
  }).formatToParts(new Date(referencia));
  return ['year', 'month', 'day'].map((t) => p.find((v) => v.type === t).value).join('-');
}
export function diaMovimento(data, referencia, fuso) {
  const hoje = diaLocal(referencia, fuso),
    d = new Date(`${hoje}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  const rotulo =
    data === hoje ? 'Hoje · ' : data === d.toISOString().slice(0, 10) ? 'Ontem · ' : '';
  return rotulo + periodoCurto({ inicio: data, fim: data });
}
