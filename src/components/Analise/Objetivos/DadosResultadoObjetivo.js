import { EvolucaoDaMeta } from '../EvolucaoDaMeta';

export function DadosResultadoObjetivo({ campanha, periodo }) {
  const r = campanha.resultado;
  if (r.valorAtual == null || !r.unidade) return null;
  return (
    <EvolucaoDaMeta
      dados={{
        estado: campanha.estado,
        unidade: r.unidade,
        evolucao: r.evolucaoNoPeriodo,
        cenario: r.cenarioAtual,
      }}
      periodoSelecionado={periodo}
      baseDoAvanco={r.baseDoAvanco}
    />
  );
}
