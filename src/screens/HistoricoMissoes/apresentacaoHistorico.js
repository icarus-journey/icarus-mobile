import { mesesDeConsulta } from '../../utils/mesesDeConsulta';
import { periodoCurto } from '../../utils/formatarProgresso';
export const FILTROS_INICIAIS = {
  periodo: 'ultimos30',
  estado: 'todos',
  campanhaId: null,
  avulsas: false,
};
export const ESTADOS = [
  { id: 'todos', titulo: 'Todos' },
  { id: 'feita', titulo: 'Feitas' },
  { id: 'atrasada', titulo: 'Atrasadas' },
  { id: 'pendente', titulo: 'Pendentes' },
  { id: 'feitaComAtraso', titulo: 'Feitas com atraso' },
  { id: 'cancelada', titulo: 'Canceladas' },
];
export const ROTULOS_ESTADO = {
  pendente: 'Pendente',
  atrasada: 'Atrasada',
  feita: 'Feita',
  feitaComAtraso: 'Feita com atraso',
  cancelada: 'Cancelada',
};
export const ICONES_ESTADO = {
  pendente: '○',
  atrasada: '!',
  feita: '✓',
  feitaComAtraso: '✓',
  cancelada: '−',
};
export function dataDoRegistro(data) {
  return periodoCurto({ inicio: data, fim: data });
}
export function opcoesDePeriodo(referencia = new Date(), fuso) {
  return [
    { id: 'ultimos30', titulo: 'Últimos 30 dias' },
    { id: 'personalizado', titulo: 'Outro período' },
    ...mesesDeConsulta(referencia, fuso),
  ];
}
export function filtroDoPeriodo(filtros, opcao) {
  const proximo = { ...filtros, periodo: opcao.id };
  delete proximo.inicio;
  delete proximo.fim;
  if (opcao.inicio) {
    proximo.inicio = opcao.inicio;
    proximo.fim = opcao.fim;
  }
  return proximo;
}
export function momentoDoRegistro(instante, fuso) {
  if (!instante) return 'Não informado';
  try {
    const horario = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: fuso ?? 'UTC',
    }).format(new Date(instante.replace(/(\.\d{3})\d+/, '$1')));
    return fuso ? horario : `${horario} (UTC)`;
  } catch {
    return 'Horário não informado';
  }
}
