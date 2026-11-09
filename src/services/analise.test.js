import { criarServicoAnalise } from './analise';

describe('serviço analítico autenticado', () => {
  it('consome somente a API com período pessoal separado das referências públicas', async () => {
    const requisitarAutenticado = jest.fn(async () => ({
      estado: 'disponivel',
      versaoContrato: '1.1.0',
    }));
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
  it('consulta a campanha pelo identificador sem enviar uma área conflitante', async () => {
    const requisitarAutenticado = jest.fn(async () => ({ versaoContrato: '1.2.0', leituras: [] }));
    const servico = criarServicoAnalise({ usuarioId: 'pessoa', requisitarAutenticado });
    const signal = new AbortController().signal;
    await servico.referencias('SONO_E_RECUPERACAO', 'todos', signal, 12);
    expect(requisitarAutenticado).toHaveBeenCalledWith(
      '/api/usuarios/pessoa/referencias-publicas?tipoDia=todos&campanhaId=12',
      { signal },
    );
  });
});
