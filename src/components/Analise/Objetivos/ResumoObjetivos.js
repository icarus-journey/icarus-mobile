import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MetaEmFoco } from '../MetaEmFoco';
import { DadosResultadoObjetivo } from './DadosResultadoObjetivo';
import { IconeAnalise } from '../IconeAnalise';
import { estilosPainel as estilos } from '../estilosPainel';
import { PainelObjetivos } from './PainelObjetivos';
import { colors } from '../../../theme/colors';

export function ResumoObjetivos({
  dados,
  periodo,
  aoAbrirCampanha,
  aoAbrirEpico,
  aoVerPesquisas,
  erroAbertura,
  abrindo,
}) {
  const [aberto, setAberto] = useState(false);
  if (!dados || (dados.campanhas.length === 0 && dados.epicos.length === 0)) return null;
  const destaque = dados.campanhas.find((c) => c.id === dados.campanhaEmDestaqueId);
  const meta = destaque?.resultado;
  const mensurada = meta?.valorAtual != null && meta.valorMensurado > 0 && meta.unidade;
  function abrir(callback, id) {
    setAberto(false);
    callback(id);
  }
  return (
    <View style={estilos.secao}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver meus objetivos"
        onPress={() => setAberto(true)}
        style={[estilos.cartao, locais.resumo]}
      >
        <View style={estilos.textoFlexivel}>
          <Text style={estilos.rotulo}>Seus objetivos · Agora</Text>
          <Text style={estilos.texto}>
            {dados.campanhasEmAndamento}{' '}
            {dados.campanhasEmAndamento === 1 ? 'campanha' : 'campanhas'} ·{' '}
            {dados.epicosEmAndamento} {dados.epicosEmAndamento === 1 ? 'épico' : 'épicos'} em
            andamento
          </Text>
        </View>
        <IconeAnalise nome="chevron" tamanho={20} />
      </Pressable>
      {erroAbertura ? (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erroAbertura}
        </Text>
      ) : null}
      {destaque ? (
        mensurada ? (
          <View style={estilos.secao}>
            <Text style={estilos.pequeno}>Destaque dos últimos 7 dias · Valor da meta agora</Text>
            <MetaEmFoco
              titulo="Sua campanha em destaque"
              campanhas={[
                {
                  id: destaque.id,
                  titulo: destaque.titulo,
                  estado: destaque.estado,
                  valorAtual: meta.valorAtual,
                  valorMensurado: meta.valorMensurado,
                  unidade: meta.unidade,
                  areaDaVida: destaque.areaDaVida,
                  dataLimite: destaque.prazoFim.split('-').reverse().join('/'),
                },
              ]}
              onAbrir={aoAbrirCampanha}
              onVerPesquisas={aoVerPesquisas}
              renderEvolucao={() => (
                <DadosResultadoObjetivo campanha={destaque} periodo={periodo} />
              )}
            />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver campanha em destaque: ${destaque.titulo}`}
            onPress={() => aoAbrirCampanha(destaque.id)}
            style={estilos.cartao}
            disabled={abrindo}
          >
            <Text style={estilos.rotulo}>Sua campanha em destaque</Text>
            <Text style={estilos.titulo}>{destaque.titulo}</Text>
            <Text style={estilos.texto}>
              {destaque.atividade.concluidasNosUltimosSeteDias}{' '}
              {destaque.atividade.concluidasNosUltimosSeteDias === 1
                ? 'missão registrada'
                : 'missões registradas'}{' '}
              nos últimos 7 dias
            </Text>
            <Text style={estilos.marca}>Ver campanha</Text>
          </Pressable>
        )
      ) : null}
      <PainelObjetivos
        key={`${dados.consultadoEm}:${periodo?.inicio}:${periodo?.fim}`}
        visivel={aberto}
        dados={dados}
        periodo={periodo}
        aoFechar={() => setAberto(false)}
        aoAbrirCampanha={(id) => abrir(aoAbrirCampanha, id)}
        aoAbrirEpico={(id) => abrir(aoAbrirEpico, id)}
      />
    </View>
  );
}
const locais = StyleSheet.create({
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderColor: colors.borderDefaultAlt,
  },
});
