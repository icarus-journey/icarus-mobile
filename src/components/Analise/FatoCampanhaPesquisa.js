import { Text } from 'react-native';

import { periodoCurto } from '../../utils/formatarProgresso';
import { numeroPublico } from './formatarReferencia';
import { estilosPainel as estilos } from './estilosPainel';

export function FatoCampanhaPesquisa({ campanha, periodo }) {
  const resultado = campanha.resultado;
  const avanco = resultado?.evolucaoNoPeriodo?.avancoRegistrado;
  const feitas = campanha.atividade?.concluidasNoPeriodo;
  const fato =
    avanco != null && resultado.unidade
      ? `${avanco > 0 ? '+' : ''}${numeroPublico(avanco)} ${resultado.unidade} registrados`
      : feitas != null
        ? `${feitas} ${feitas === 1 ? 'missão feita' : 'missões feitas'}`
        : null;
  if (!fato || !periodo) return null;
  return (
    <Text style={estilos.texto}>
      Na sua campanha: {fato} · {periodoCurto(periodo)}.
    </Text>
  );
}
