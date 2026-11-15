import { validarProgresso } from './progresso';
import { validarRelatorioSemanal } from './validarRelatorioSemanal';
import { validarPesquisas } from './validarPesquisas';

export function criarServicoAnalise({ usuarioId, requisitarAutenticado }) {
  const base = `/api/usuarios/${usuarioId}`;
  return {
    progresso: async (periodo = 'semanaAnterior', signal) =>
      validarProgresso(
        await requisitarAutenticado(
          `${base}/progresso?periodo=${encodeURIComponent(periodo)}`,
          ...(signal ? [{ signal }] : []),
        ),
      ),
    consultarRelatorio: async (signal) =>
      validarRelatorioSemanal(
        await requisitarAutenticado(
          `${base}/relatorios/semanais/atual`,
          ...(signal ? [{ signal }] : []),
        ),
      ),
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
    referencias: async (areaDaVida, tipoDia = 'todos', signal, campanhaId = null) => {
      const parametros = [`tipoDia=${encodeURIComponent(tipoDia)}`];
      if (campanhaId != null) parametros.push(`campanhaId=${encodeURIComponent(campanhaId)}`);
      else if (areaDaVida) parametros.push(`areaDaVida=${encodeURIComponent(areaDaVida)}`);
      return validarPesquisas(
        await requisitarAutenticado(
          `${base}/referencias-publicas?${parametros.join('&')}`,
          ...(signal ? [{ signal }] : []),
        ),
      );
    },
  };
}
