import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { SecondaryButton } from '../Button';
import { estilosPainel as estilos } from './estilosPainel';
import { formatarPeriodo } from './formatarPeriodo';

export function DetalhesDosIndicadores({ visivel, onFechar, dados }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={onFechar}>
      <View style={locais.fundo}>
        <Pressable
          style={locais.fecharFundo}
          onPress={onFechar}
          accessibilityLabel="Fechar explicação"
        />
        <View
          accessibilityViewIsModal
          style={[locais.folha, { paddingBottom: insets.bottom + 20 }]}
        >
          <ScrollView contentContainerStyle={estilos.secao}>
            <Text style={estilos.titulo} accessibilityRole="header">
              Sobre estes números
            </Text>
            <Text style={estilos.texto}>{formatarPeriodo(dados?.periodo)}</Text>
            <Text style={estilos.texto}>
              As conclusões usam a data de realização registrada. Um dia sem conclusão no gráfico
              significa apenas que não há conclusão registrada naquele dia.
            </Text>
            <Text style={estilos.titulo}>Seus registros, sem cobranças</Text>
            <Text style={estilos.texto}>
              Esses números não medem sua rotina inteira. Mais pontos ou mais missões não significam
              mais equilíbrio ou uma meta alcançada.
            </Text>
            <Text style={estilos.titulo}>O que você planejou</Text>
            <Text style={estilos.texto}>
              A porcentagem considera as missões planejadas para esse período e feitas até ele
              terminar. Uma missão feita depois aparece na atividade do período seguinte. Reagendar
              ou cancelar depois do fechamento preserva o planejamento anterior.
            </Text>
            {dados?.adesao?.estado === 'historico_parcial' ? (
              <Text style={estilos.texto}>
                Parte do planejamento antigo não guardava as mudanças de datas e cancelamentos, ou
                há dias sem planejamento preservado. Mostramos os registros disponíveis e deixamos a
                porcentagem em aberto.
              </Text>
            ) : dados?.adesao?.estado === 'sem_planejamento' ? (
              <Text style={estilos.texto}>
                Não há missões planejadas registradas para esse período. A porcentagem fica em
                aberto.
              </Text>
            ) : !dados?.adesao ? (
              <Text style={estilos.texto}>
                A porcentagem do planejamento ainda não está disponível nesta versão da API.
              </Text>
            ) : null}
            <Text style={estilos.titulo}>Comparação entre períodos</Text>
            <Text style={estilos.texto}>
              A comparação entre semanas ainda não está disponível. Os números deste período
              continuam aparecendo normalmente.
            </Text>
            <Text style={estilos.titulo}>O ritmo da sua meta</Text>
            <Text style={estilos.texto}>
              A evolução da meta usa seus registros de progresso e aparece em Sua meta em foco.
              Havendo cinco registros semanais comparáveis, mostramos quanto tempo faltaria se o
              ritmo continuar. Pontos e missões feitas não substituem o resultado da meta.
            </Text>
            <SecondaryButton label="Entendi" onPress={onFechar} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const locais = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(29,21,48,0.4)' },
  fecharFundo: { flex: 1 },
  folha: {
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
  },
});
