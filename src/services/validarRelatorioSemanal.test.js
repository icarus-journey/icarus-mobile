import { criarServicoAnalise } from './analise';
import { validarRelatorioSemanal } from './validarRelatorioSemanal';

function resposta() {
  return {
    estado: 'disponivel',
    relatorio: {
      comparacaoSemanal: {
        semana: { estado: 'disponivel', previstas: 10, concluidas: 8, taxaConclusao: 80 },
        semanasAnteriores: Array.from({ length: 4 }, () => ({
          estado: 'disponivel',
          previstas: 8,
          concluidas: 4,
          taxaConclusao: 50,
        })),
        mediaQuatroSemanas: { previstas: 8, concluidas: 4, taxaConclusao: 50 },
        podeCompararSemanaAnterior: true,
        podeCompararMediaQuatroSemanas: true,
      },
    },
  };
}

it('preserva dados e valores fornecidos pela API, inclusive legado sem comparação', () => {
  const d = resposta();
  expect(validarRelatorioSemanal(d)).toBe(d);
  const antigo = { estado: 'disponivel', relatorio: { texto: 'Relatório persistido' } };
  expect(validarRelatorioSemanal(antigo)).toBe(antigo);
});

it.each(['semana', 'semanasAnteriores', 'mediaQuatroSemanas', 'podeCompararSemanaAnterior'])(
  'rejeita resposta com %s ausente',
  (campo) => {
    const d = resposta();
    delete d.relatorio.comparacaoSemanal[campo];
    expect(() => validarRelatorioSemanal(d)).toThrow('Comparação da semana indisponível.');
  },
);

it('rejeita valores incompatíveis e aceita ausência explícita', () => {
  const d = resposta();
  d.relatorio.comparacaoSemanal.semana.taxaConclusao = 101;
  expect(() => validarRelatorioSemanal(d)).toThrow();
  d.relatorio.comparacaoSemanal.semana = {
    estado: 'historico_parcial',
    previstas: null,
    concluidas: null,
    taxaConclusao: null,
  };
  d.relatorio.comparacaoSemanal.podeCompararSemanaAnterior = false;
  d.relatorio.comparacaoSemanal.podeCompararMediaQuatroSemanas = false;
  expect(validarRelatorioSemanal(d)).toBe(d);
});

it('propaga resposta inválida como falha recuperável pelo mesmo serviço autenticado', async () => {
  const d = resposta();
  delete d.relatorio.comparacaoSemanal.semana;
  const servico = criarServicoAnalise({
    usuarioId: 'pessoa',
    requisitarAutenticado: async () => d,
  });
  await expect(servico.solicitarRelatorio()).rejects.toThrow('Comparação da semana indisponível.');
});
