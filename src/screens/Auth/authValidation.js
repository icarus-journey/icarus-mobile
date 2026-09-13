export function getPasswordChecks(password) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

export function isPasswordValid(password) {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.hasUppercase && checks.hasNumber;
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
    errors.name = 'Informe como quer ser chamada.';
  }

  if (!values.email.trim()) {
    errors.email = 'Informe seu e-mail.';
  }

  if (!isPasswordValid(values.password)) {
    errors.password = 'A senha precisa cumprir os critérios.';
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
