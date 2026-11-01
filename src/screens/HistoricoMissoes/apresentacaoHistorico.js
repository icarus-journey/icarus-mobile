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
  const data = new Date(referencia),
    opcoes = [{ id: 'ultimos30', titulo: 'Últimos 30 dias' }];
  const partes = new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'numeric',
    timeZone: fuso,
  }).formatToParts(data);
  const ano = Number(partes.find((p) => p.type === 'year').value);
  const mes = Number(partes.find((p) => p.type === 'month').value) - 1;
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(ano, mes - i, 1));
    const inicio = d.toISOString().slice(0, 10),
      fim = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
        .toISOString()
        .slice(0, 10);
    const nome = new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
      .format(d)
      .replace(' de ', ' ');
    opcoes.push({
      id: inicio.slice(0, 7),
      titulo: nome.charAt(0).toUpperCase() + nome.slice(1),
      inicio,
      fim,
    });
  }
  return [opcoes[0], { id: 'personalizado', titulo: 'Outro período' }, ...opcoes.slice(1)];
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
  if (!fuso) return 'Data registrada; horário local não informado';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: fuso,
    }).format(new Date(instante.replace(/(\.\d{3})\d+/, '$1')));
  } catch {
    return 'Horário não informado';
  }
}
