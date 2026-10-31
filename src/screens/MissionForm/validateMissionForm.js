import { isDataLimiteVencida, isValidDateString } from '../../utils/dateInput';

const TITULO_MAX_LENGTH = 120;
const DESCRICAO_MAX_LENGTH = 1000;

export function validateMissionForm(values, { editando = false } = {}) {
  const errors = {};

  const titulo = values.titulo?.trim() ?? '';
  if (!titulo) {
    errors.titulo = 'Informe um título para a missão.';
  } else if (titulo.length > TITULO_MAX_LENGTH) {
    errors.titulo = `O título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres.`;
  }

  if (values.descricao && values.descricao.length > DESCRICAO_MAX_LENGTH) {
    errors.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`;
  }

  if (!values.dataLimite && !(editando && values.recorrente === 'Sim')) {
    errors.dataLimite = 'Informe a data limite.';
  } else if (values.dataLimite && !isValidDateString(values.dataLimite)) {
    errors.dataLimite = 'Informe uma data válida no formato dd/mm/aaaa.';
  }

  if (!values.dificuldade) {
    errors.dificuldade = 'Escolha uma dificuldade.';
  }

  if (values.recorrente === 'Sim' && !values.tipoRecorrencia) {
    errors.tipoRecorrencia = 'Escolha o tipo de recorrência.';
  }

  if (
    values.recorrente === 'Sim' &&
    values.tipoRecorrencia === 'SEMANAL' &&
    !values.diasSemana?.length
  ) {
    errors.diasSemana = 'Escolha ao menos um dia da semana.';
  }

  if (
    editando &&
    values.recorrente === 'Sim' &&
    values.tipoRecorrencia === 'MENSAL' &&
    (!/^\d{1,2}$/.test(values.diaDoMes ?? '') ||
      Number(values.diaDoMes) < 1 ||
      Number(values.diaDoMes) > 31)
  ) {
    errors.diaDoMes = 'Escolha um dia entre 1 e 31.';
  }

  if (values.recorrente === 'Sim' && values.dataFimRecorrencia) {
    if (!isValidDateString(values.dataFimRecorrencia)) {
      errors.dataFimRecorrencia = 'Informe uma data válida no formato dd/mm/aaaa.';
    } else if (isDataLimiteVencida(values.dataFimRecorrencia)) {
      errors.dataFimRecorrencia = 'A data não pode estar no passado.';
    }
  }

  if (values.atribuirCampanha === 'Sim' && !values.campanha) {
    errors.campanha = 'Escolha uma campanha.';
  }

  return errors;
}

export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
