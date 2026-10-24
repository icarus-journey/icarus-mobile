import { criarServicoAnalise } from './analise';

describe('serviço analítico autenticado', () => {
  it('consome somente a API com período pessoal separado das referências públicas', async () => {
    const requisitarAutenticado = jest.fn(async () => ({ estado: 'disponivel' }));
    const servico = criarServicoAnalise({ usuarioId: 'pessoa', requisitarAutenticado });
    await servico.referencias('SONO_E_RECUPERACAO', 'todos');
    expect(requisitarAutenticado).toHaveBeenLastCalledWith(
      '/api/usuarios/pessoa/referencias-publicas?tipoDia=todos&areaDaVida=SONO_E_RECUPERACAO',
    );
    await servico.progresso('mesAnterior');
    expect(requisitarAutenticado).toHaveBeenLastCalledWith(
      '/api/usuarios/pessoa/progresso?periodo=mesAnterior',
    );
    await servico.solicitarRelatorio();
    expect(requisitarAutenticado).toHaveBeenLastCalledWith(
      '/api/usuarios/pessoa/relatorios/semanais',
      { metodo: 'POST' },
    );
    await servico.consultarRelatorio();
    expect(requisitarAutenticado).toHaveBeenLastCalledWith(
      '/api/usuarios/pessoa/relatorios/semanais/atual',
    );
    await servico.tentarRelatorioNovamente();
    expect(requisitarAutenticado).toHaveBeenLastCalledWith(
      '/api/usuarios/pessoa/relatorios/semanais/tentar-novamente',
      { metodo: 'POST' },
    );
  });
  it('propaga indisponibilidade e sessão expirada para o fluxo de recuperação', async () => {
    const requisitarAutenticado = jest
      .fn()
      .mockRejectedValue(Object.assign(new Error('Sessão expirada'), { status: 401 }));
    const servico = criarServicoAnalise({ usuarioId: 'pessoa', requisitarAutenticado });
    await expect(servico.referencias()).rejects.toMatchObject({ status: 401 });
    await expect(servico.consultarRelatorio()).rejects.toMatchObject({ status: 401 });
  });
});
