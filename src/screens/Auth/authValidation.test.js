import {
  getPasswordChecks,
  isPasswordValid,
  validateLogin,
  validateRegister,
} from './authValidation';

describe('authValidation', () => {
  it('valida os critérios visuais de senha', () => {
    expect(getPasswordChecks('Senha123!')).toEqual({
      minLength: true,
      hasUppercase: true,
      hasNumber: true,
    });
    expect(isPasswordValid('Senha123!')).toBe(true);
    expect(isPasswordValid('senha')).toBe(false);
  });

  it('exige e-mail e senha no login', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Informe seu e-mail.',
      password: 'Informe sua senha.',
    });
  });

  it('exige aceite e senhas coincidentes no cadastro', () => {
    expect(
      validateRegister({
        name: 'Paloma',
        email: 'paloma@email.com',
        password: 'Senha123!',
        confirmPassword: 'Senha123',
        acceptedTerms: false,
      }),
    ).toEqual({
      confirmPassword: 'As senhas precisam coincidir.',
      acceptedTerms: 'Aceite os termos para criar sua conta.',
    });
  });
});
