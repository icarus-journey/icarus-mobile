import { Text, View } from 'react-native';
import { EvolucaoDaMeta } from '../EvolucaoDaMeta';
import { CenarioDaMeta } from '../CenarioDaMeta';
import { estilosPainel as estilos } from '../estilosPainel';
import { numeroPublico } from '../formatarReferencia';

export function DadosResultadoObjetivo({ campanha, periodo, compacto = false }) {
  const r = campanha.resultado;
  if (!compacto)
    return (
      <EvolucaoDaMeta
        dados={{
          unidade: r.unidade,
          valorMensurado: r.valorMensurado,
          estado: campanha.estado,
          evolucao: r.evolucaoNoPeriodo,
          cenario: r.cenarioAtual,
        }}
        periodoSelecionado={periodo}
        baseDoAvanco={r.baseDoAvanco}
      />
    );
  const avanco = r.evolucaoNoPeriodo?.avancoRegistrado;
  return (
    <View style={{ gap: 8 }}>
      {avanco != null ? (
        <Text style={estilos.marca}>
          {avanco > 0 ? '+' : ''}
          {numeroPublico(avanco)} {r.unidade}{' '}
          {r.baseDoAvanco === 'primeiro_registro_do_periodo'
            ? 'entre registros do período'
            : 'no período'}
        </Text>
      ) : null}
      <CenarioDaMeta cenario={r.cenarioAtual} unidade={r.unidade} compacto />
    </View>
  );
}
