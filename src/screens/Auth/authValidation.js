import { isValidDateString } from '../../utils/dateInput';

const SENHA_MINIMA = 8;
const SENHA_MAXIMA = 128;

export function getPasswordChecks(password) {
  return {
    minLength: password.length >= SENHA_MINIMA,
    maxLength: password.length <= SENHA_MAXIMA,
  };
}

export function isPasswordValid(password) {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.maxLength;
}

export function validateLogin(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  }

  if (!values.password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}

export function validateRegister(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Informe seu nome.';
  }

  if (!values.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  }

  if (!values.birthDate) {
    errors.birthDate = 'Informe sua data de nascimento.';
  } else if (!isValidDateString(values.birthDate)) {
    errors.birthDate = 'Informe uma data válida no formato dd/mm/aaaa.';
  }

  if (!isPasswordValid(values.password)) {
    errors.password = 'A senha deve ter de 8 a 128 caracteres.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas precisam coincidir.';
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms = 'Aceite os termos para criar sua conta.';
  }

  return errors;
}

export function isAuthFormValid(errors) {
  return Object.keys(errors).length === 0;
}
