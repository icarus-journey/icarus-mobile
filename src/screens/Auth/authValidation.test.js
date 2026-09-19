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
      maxLength: true,
    });
    expect(isPasswordValid('Senha123!')).toBe(true);
    expect(isPasswordValid('12345678')).toBe(true);
    expect(isPasswordValid('senha')).toBe(false);
    expect(isPasswordValid('a'.repeat(129))).toBe(false);
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
        birthDate: '01/01/2000',
        password: 'Senha123!',
        confirmPassword: 'Senha123',
        acceptedTerms: false,
      }),
    ).toEqual({
      confirmPassword: 'As senhas precisam coincidir.',
      acceptedTerms: 'Aceite os termos para criar sua conta.',
    });
  });

  it('exige uma data de nascimento válida no cadastro', () => {
    expect(
      validateRegister({
        name: 'Paloma',
        email: 'paloma@email.com',
        birthDate: '31/02/2000',
        password: '12345678',
        confirmPassword: '12345678',
        acceptedTerms: true,
      }),
    ).toEqual({
      birthDate: 'Informe uma data válida no formato dd/mm/aaaa.',
    });
  });
});
