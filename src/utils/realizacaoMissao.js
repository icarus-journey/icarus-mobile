import { isValidDateString, paraDataIso } from './dateInput';

export function camposDoMomento(fusoHorario, instante = new Date()) {
  const partes = new Intl.DateTimeFormat('pt-BR', {
    timeZone: fusoHorario || 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instante));
  const valor = (tipo) => partes.find((parte) => parte.type === tipo).value;
  return {
    data: `${valor('day')}/${valor('month')}/${valor('year')}`,
    horario: `${valor('hour')}:${valor('minute')}`,
  };
}

export function formatarRealizacao(instante, fusoHorario) {
  if (!instante) return null;
  const { data, horario } = camposDoMomento(fusoHorario, instante);
  return `${data} às ${horario}`;
}

export function mascararHorario(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 4);
  return digitos.length <= 2 ? digitos : `${digitos.slice(0, 2)}:${digitos.slice(2)}`;
}

export function validarRealizacao({ data, horario }) {
  const erros = {};
  if (!isValidDateString(data) || Number(data.slice(-4)) < 1)
    erros.data = 'Informe uma data válida.';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horario))
    erros.horario = 'Informe um horário entre 00:00 e 23:59.';
  return erros;
}

export function paraRealizacaoNaApi({ data, horario }) {
  return { dataRealizacao: paraDataIso(data), horarioRealizacao: `${horario}:00` };
}

export function mensagemErroRealizacao(erro) {
  const mensagens = {
    fuso_alterado: 'O horário da conta mudou. Feche esta janela e tente novamente.',
    realizacao_futura: 'Escolha um momento que já passou.',
    realizacao_incompleta: 'Informe a data e o horário.',
    horario_inexistente: 'Esse horário não existe nessa data. Escolha outro.',
    horario_ambiguo: 'Esse horário se repete nessa data. Escolha outro.',
  };
  return (
    mensagens[erro.codigo] ??
    (erro.status === 409
      ? 'A execução mudou. Feche esta janela e tente novamente.'
      : erro.status === 404
        ? 'Esta missão não está mais disponível.'
        : erro.status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : erro.status === 400
            ? 'Revise a data e o horário informados.'
            : 'Não foi possível concluir. Tente novamente.')
  );
}

export function aceitaRealizacaoInformada(versao) {
  const partes = /^1\.(\d+)\.\d+$/.exec(versao ?? '');
  return Boolean(partes && Number(partes[1]) >= 3);
}
