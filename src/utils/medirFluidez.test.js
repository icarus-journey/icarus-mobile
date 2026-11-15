it('a medição opcional remove identidade e parâmetros sem registrar conteúdo ou credenciais', () => {
  const anterior = process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ;
  process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ = '1';
  const informar = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    jest.isolateModules(() => {
      const { iniciarMedicaoHttp } = require('./medirFluidez');
      iniciarMedicaoHttp(
        '/api/usuarios/identidade-privada/missoes/42?texto=conteudo-privado',
        'GET',
      )(200, false);
    });
    const registro = JSON.parse(informar.mock.calls[0][1]);
    expect(registro.rota).toBe('/api/usuarios/:usuario/missoes/:id');
    expect(JSON.stringify(registro)).not.toMatch(/identidade-privada|conteudo-privado/);
  } finally {
    if (anterior === undefined) delete process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ;
    else process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ = anterior;
    informar.mockRestore();
  }
});

it('não registra medições quando a opção de desenvolvimento está desativada', () => {
  const anterior = process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ;
  delete process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ;
  const informar = jest.spyOn(console, 'info').mockImplementation(() => {});
  try {
    jest.isolateModules(() => {
      const { iniciarMedicaoHttp, medirRenderizacao } = require('./medirFluidez');
      iniciarMedicaoHttp('/api/auth/me', 'GET')(200, false);
      medirRenderizacao('navegacao', 'mount', 10);
    });
    expect(informar).not.toHaveBeenCalled();
  } finally {
    if (anterior !== undefined) process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ = anterior;
    informar.mockRestore();
  }
});
