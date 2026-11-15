import { Text, View } from 'react-native';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico as numero } from './formatarReferencia';

export const dataDoCenario = (data) =>
  data
    ? new Date(`${data}T12:00:00Z`)
        .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
        .replace('.', '')
    : '';

export function CenarioDaMeta({ cenario, unidade, compacto = false }) {
  if (!cenario?.disponivel) return null;
  const prazo = cenario.prazo;
  if (!prazo)
    return (
      <Text style={estilos.pequeno}>
        Cerca de {cenario.semanasAproximadas} semanas para chegar lá, se mantiver esse ritmo.
      </Text>
    );
  const antes = prazo.situacao === 'antes_do_prazo';
  const noPrazo = prazo.situacao === 'no_prazo';
  return (
    <View style={{ gap: 8 }}>
      <Text style={estilos.marca}>
        {antes ? 'Antes do prazo' : noPrazo ? 'No prazo' : 'Depois do prazo'}, se mantiver o ritmo.
      </Text>
      <Text style={estilos.pequeno}>
        Conclusão: cerca de {dataDoCenario(prazo.conclusaoEstimada)} · prazo:{' '}
        {dataDoCenario(prazo.prazoFim)}
      </Text>
      {!compacto ? (
        <Text style={estilos.texto}>
          Faltam {numero(cenario.faltante)} {unidade}. Seu ritmo é de {numero(cenario.ritmoSemanal)}{' '}
          {unidade} por semana
          {prazo.ritmoSemanalNecessario != null
            ? `; para o prazo, seriam cerca de ${numero(prazo.ritmoSemanalNecessario)} ${unidade} por semana.`
            : '.'}
        </Text>
      ) : null}
    </View>
  );
}
