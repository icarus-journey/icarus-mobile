import { validarProgresso } from './progresso';
import { criarServicoAnalise } from './analise';

const dados = (alteracoes = {}) => ({
  versaoContrato: '1.2.0',
  estado: 'disponivel',
  adesao: {
    estado: 'disponivel',
    previstasRegistradas: 10,
    concluidasDoPlanejamento: 8,
    pendentes: 0,
    atrasadas: 2,
    taxaConclusao: 80,
    motivo: null,
    ...alteracoes,
  },
});

it('consome HTTP autenticado e preserva os valores calculados pela API', async () => {
  const resposta = dados();
  const requisitarAutenticado = jest.fn(async () => resposta);
  const servico = criarServicoAnalise({ usuarioId: 'titular', requisitarAutenticado });
  expect(await servico.progresso('seisMeses')).toBe(resposta);
  expect(requisitarAutenticado).toHaveBeenCalledWith(
    '/api/usuarios/titular/progresso?periodo=seisMeses',
  );
});

it.each([
  { taxaConclusao: 101 },
  { taxaConclusao: -1 },
  { taxaConclusao: NaN },
  { previstasRegistradas: -1 },
  { concluidasDoPlanejamento: 12 },
  { pendentes: null },
  { estado: 'desconhecido' },
  { estado: 'historico_parcial', taxaConclusao: 80 },
  { estado: 'sem_planejamento', previstasRegistradas: 0, taxaConclusao: 0 },
])('recusa números ou estados inconsistentes sem fabricar correção: %j', (alteracao) => {
  expect(() => validarProgresso(dados(alteracao))).toThrow('indisponível');
});

it('aceita histórico parcial e API anterior sem converter ausência em zero', () => {
  const parcial = dados({
    estado: 'historico_parcial',
    concluidasDoPlanejamento: null,
    pendentes: null,
    atrasadas: null,
    taxaConclusao: null,
  });
  expect(validarProgresso(parcial)).toBe(parcial);
  const antiga = { versaoContrato: '1.1.0', estado: 'disponivel' };
  expect(validarProgresso(antiga)).toBe(antiga);
  expect(() => validarProgresso({ versaoContrato: '2.0.0' })).toThrow('indisponível');
});
