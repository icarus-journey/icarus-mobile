import { isValidDateString } from '../../utils/dateInput';

const TITULO_MAX_LENGTH = 120;
const DESCRICAO_MAX_LENGTH = 1000;

export function validateCampaignForm(values) {
  const errors = {};

  const titulo = values.titulo?.trim() ?? '';
  if (!titulo) {
    errors.titulo = 'Informe um título para a campanha.';
  } else if (titulo.length > TITULO_MAX_LENGTH) {
    errors.titulo = `O título deve ter no máximo ${TITULO_MAX_LENGTH} caracteres.`;
  }

  if (values.descricao && values.descricao.length > DESCRICAO_MAX_LENGTH) {
    errors.descricao = `A descrição deve ter no máximo ${DESCRICAO_MAX_LENGTH} caracteres.`;
  }

  if (!values.dataLimite) {
    errors.dataLimite = 'Informe a data limite.';
  } else if (!isValidDateString(values.dataLimite)) {
    errors.dataLimite = 'Informe uma data válida no formato dd/mm/aaaa.';
  }

  if (!values.dificuldade) {
    errors.dificuldade = 'Escolha uma dificuldade.';
  }

  if (values.atribuirEpico === 'Sim' && !values.epico) {
    errors.epico = 'Escolha um épico.';
  }

  return errors;
}

export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}
