import { validarProgresso } from './progresso';
import { validarRelatorioSemanal } from './validarRelatorioSemanal';

export function criarServicoAnalise({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}`;
  return {
    progresso: async (periodo = 'semanaAnterior') =>
      validarProgresso(
        await requisitarAutenticado(`${base}/progresso?periodo=${encodeURIComponent(periodo)}`),
      ),
    consultarRelatorio: async () =>
      validarRelatorioSemanal(await requisitarAutenticado(`${base}/relatorios/semanais/atual`)),
    solicitarRelatorio: async () =>
      validarRelatorioSemanal(
        await requisitarAutenticado(`${base}/relatorios/semanais`, { metodo: 'POST' }),
      ),
    tentarRelatorioNovamente: async () =>
      validarRelatorioSemanal(
        await requisitarAutenticado(`${base}/relatorios/semanais/tentar-novamente`, {
          metodo: 'POST',
        }),
      ),
    referencias: (areaDaVida, tipoDia = 'todos') => {
      const parametros = [`tipoDia=${encodeURIComponent(tipoDia)}`];
      if (areaDaVida) parametros.push(`areaDaVida=${encodeURIComponent(areaDaVida)}`);
      return requisitarAutenticado(`${base}/referencias-publicas?${parametros.join('&')}`);
    },
  };
}
