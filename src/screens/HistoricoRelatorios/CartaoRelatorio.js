import { Pressable, Text, View } from 'react-native';
import { periodoCurto } from '../../utils/formatarProgresso';
import { resumoDoRelatorio } from './apresentacaoRelatorios';
import { estilos as e } from './styles';
export function CartaoRelatorio({ relatorio, aoAbrir }) {
  const periodo = periodoCurto(relatorio.periodo),
    resumo = resumoDoRelatorio(relatorio);
  return (
    <Pressable
      onPress={aoAbrir}
      accessibilityRole="button"
      accessibilityLabel={`Abrir relatório de ${periodo}. ${relatorio.titulo ?? 'Relatório semanal'}. ${resumo}`}
      style={({ pressed }) => [e.cartao, pressed && { opacity: 0.8 }]}
    >
      <View style={e.linha}>
        <Text style={[e.rotulo, e.roxo]}>{periodo}</Text>
        <Text style={e.legenda}>
          {relatorio.estado === 'disponivel' ? 'Com IA' : 'Indisponível'}
        </Text>
      </View>
      <Text style={e.rotulo}>{relatorio.titulo ?? 'Relatório semanal'}</Text>
      <Text style={e.legenda}>{resumo}</Text>
    </Pressable>
  );
}
