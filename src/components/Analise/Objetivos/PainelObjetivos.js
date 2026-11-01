import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecondaryButton } from '../../Button';
import { DadosResultadoObjetivo } from './DadosResultadoObjetivo';
import { estilosPainel as estilos } from '../estilosPainel';
import { IconeAnalise } from '../IconeAnalise';
import { colors } from '../../../theme/colors';
import { periodoCurto } from '../../../utils/formatarProgresso';
import { numeroPublico } from '../formatarReferencia';

const estados = {
  emAndamento: 'Em andamento',
  planejada: 'Planejada',
  concluida: 'Concluída',
  concluido: 'Concluído',
};
function atividade(a) {
  return a.concluidasNoPeriodo == null
    ? 'Há registros sem data confirmada'
    : `${a.concluidasNoPeriodo} ${a.concluidasNoPeriodo === 1 ? 'missão feita' : 'missões feitas'} no período`;
}
function MedidaAtual({ resultado }) {
  if (resultado.valorAtual == null || !resultado.unidade || !resultado.valorMensurado) return null;
  return (
    <View style={estilos.secao}>
      <Text style={estilos.rotulo}>Meta agora</Text>
      <Text style={estilos.texto}>
        {numeroPublico(resultado.valorAtual)} de {numeroPublico(resultado.valorMensurado)}{' '}
        {resultado.unidade}
      </Text>
      <View
        style={locais.trilho}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Valor atual da meta"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.min(100, (resultado.valorAtual / resultado.valorMensurado) * 100),
          text: `${numeroPublico(resultado.valorAtual)} de ${numeroPublico(resultado.valorMensurado)} ${resultado.unidade}`,
        }}
      >
        <View
          style={[
            locais.barra,
            {
              width: `${Math.max(0, Math.min(100, (resultado.valorAtual / resultado.valorMensurado) * 100))}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

export function PainelObjetivos({
  visivel,
  dados,
  periodo,
  aoFechar,
  aoAbrirCampanha,
  aoAbrirEpico,
}) {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = useState('campanhas');
  const [semRegistros, setSemRegistros] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const campanhas = dados.campanhas.filter(
    (c) =>
      !semRegistros ||
      (c.estado === 'emAndamento' && c.atividade.concluidasNosUltimosSeteDias === 0),
  );
  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={locais.fundo}>
        <Pressable style={StyleSheet.absoluteFill} accessible={false} onPress={aoFechar} />
        <View
          style={[locais.folha, { paddingBottom: Math.max(insets.bottom, 16) }]}
          accessibilityViewIsModal
          accessibilityLabel="Painel de objetivos"
        >
          <ScrollView contentContainerStyle={locais.conteudo}>
            <Text style={estilos.titulo} accessibilityRole="header">
              Seus objetivos
            </Text>
            <Text style={estilos.pequeno}>
              Estados e metas: agora · Atividade: {periodoCurto(periodo)}
            </Text>
            <View style={estilos.controle} accessibilityRole="tablist">
              {['campanhas', 'epicos'].map((id) => (
                <Pressable
                  key={id}
                  accessibilityRole="tab"
                  accessibilityLabel={
                    id === 'campanhas' ? 'Campanhas dos objetivos' : 'Épicos dos objetivos'
                  }
                  accessibilityState={{ selected: aba === id }}
                  onPress={() => {
                    setAba(id);
                    setExpandido(null);
                  }}
                  style={[estilos.opcao, aba === id && estilos.opcaoAtiva]}
                >
                  <Text style={[estilos.opcaoTexto, aba === id && estilos.opcaoTextoAtivo]}>
                    {id === 'campanhas' ? 'Campanhas' : 'Épicos'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {aba === 'campanhas' ? (
              <>
                {dados.campanhasSemRegistroRecente > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: semRegistros }}
                    onPress={() => {
                      setSemRegistros(!semRegistros);
                      setExpandido(null);
                    }}
                    style={estilos.botaoTexto}
                  >
                    <Text style={estilos.marca}>
                      {semRegistros
                        ? 'Ver todas as campanhas'
                        : `${dados.campanhasSemRegistroRecente} sem missão registrada nos últimos 7 dias`}
                    </Text>
                  </Pressable>
                ) : null}
                {campanhas.length === 0 ? (
                  <Text style={estilos.texto}>Nenhuma campanha neste grupo.</Text>
                ) : null}
                {campanhas.map((c) => (
                  <View key={c.id} style={estilos.cartao}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Detalhar campanha: ${c.titulo}`}
                      accessibilityState={{ expanded: expandido === `c${c.id}` }}
                      onPress={() => setExpandido(expandido === `c${c.id}` ? null : `c${c.id}`)}
                      style={locais.entrada}
                    >
                      <View style={estilos.textoFlexivel}>
                        <Text style={estilos.rotulo}>{estados[c.estado]}</Text>
                        <Text style={estilos.titulo}>{c.titulo}</Text>
                        <Text style={estilos.pequeno}>{atividade(c.atividade)}</Text>
                      </View>
                      <IconeAnalise nome="chevron" tamanho={18} />
                    </Pressable>
                    {expandido === `c${c.id}` ? (
                      <>
                        <MedidaAtual resultado={c.resultado} />
                        {c.resultado.registrosNoPeriodo > 0 ? (
                          <Text style={estilos.pequeno}>
                            {c.resultado.registrosNoPeriodo}{' '}
                            {c.resultado.registrosNoPeriodo === 1 ? 'registro' : 'registros'} de
                            progresso no período
                          </Text>
                        ) : null}
                        <DadosResultadoObjetivo campanha={c} periodo={periodo} />
                        <Text style={estilos.pequeno}>
                          {c.atividade.concluidasNosUltimosSeteDias == null
                            ? 'A data de alguns registros antigos está em aberto.'
                            : `${c.atividade.concluidasNosUltimosSeteDias} ${c.atividade.concluidasNosUltimosSeteDias === 1 ? 'missão registrada' : 'missões registradas'} nos últimos 7 dias`}
                        </Text>
                        <SecondaryButton
                          label={`Ver campanha: ${c.titulo}`}
                          onPress={() => aoAbrirCampanha(c.id)}
                        />
                      </>
                    ) : null}
                  </View>
                ))}
              </>
            ) : (
              <>
                {dados.epicos.length === 0 ? (
                  <Text style={estilos.texto}>Seus épicos aparecerão aqui.</Text>
                ) : null}
                {dados.epicos.map((e) => (
                  <View key={e.id} style={estilos.cartao}>
                    <Text style={estilos.rotulo}>{estados[e.estado]}</Text>
                    <Text style={estilos.titulo}>{e.titulo}</Text>
                    <Text style={estilos.texto}>
                      {e.campanhas.emAndamento} em andamento · {e.campanhas.planejadas} planejadas ·{' '}
                      {e.campanhas.concluidas} concluídas
                    </Text>
                    <Text style={estilos.pequeno}>{atividade(e.atividade)}</Text>
                    <Text style={estilos.pequeno}>
                      {e.atividade.concluidasNosUltimosSeteDias == null
                        ? 'Há datas de atividade em aberto.'
                        : `${e.atividade.concluidasNosUltimosSeteDias} ${e.atividade.concluidasNosUltimosSeteDias === 1 ? 'missão registrada' : 'missões registradas'} nos últimos 7 dias`}
                    </Text>
                    <SecondaryButton
                      label={`Ver épico: ${e.titulo}`}
                      onPress={() => aoAbrirEpico(e.id)}
                    />
                  </View>
                ))}
              </>
            )}
            <SecondaryButton label="Voltar ao progresso" onPress={aoFechar} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const locais = StyleSheet.create({
  fundo: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(29,21,48,0.4)' },
  folha: {
    maxHeight: '90%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  conteudo: { padding: 20, gap: 16 },
  entrada: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trilho: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.softPurple },
  barra: { height: '100%', borderRadius: 8, backgroundColor: colors.brand },
});
