import { useState } from 'react';
import { Text, View } from 'react-native';
import IconeBrilho from '../../assets/icons/icone-brilho-relatorio.svg';
import { SecondaryButton } from '../../components/Button';
import { ComparacaoDaSemana } from '../../components/Analise/ComparacaoDaSemana';
import { ResumoAdesao } from '../../components/Analise/ResumoAdesao';
import { useRelatorioSalvo } from '../../hooks/useRelatorioSalvo';
import { useSessao } from '../../state/SessaoContext';
import { nomeDoFuso, periodoCurto } from '../../utils/formatarProgresso';
import { EstadoRelatorio } from './EstadoRelatorio';
import { PaginaRelatorio } from './PaginaRelatorio';
import { dataDaGeracao, resumoDoRelatorio } from './apresentacaoRelatorios';
import { estilos as e } from './styles';
export function RelatorioSalvoScreen(props) {
  const { sessao } = useSessao();
  return (
    <LeituraDaSessao key={`${sessao?.usuarioId}:${props.route.params.relatorioId}`} {...props} />
  );
}
function LeituraDaSessao({ route, navigation }) {
  const id = route.params.relatorioId,
    estado = useRelatorioSalvo(id);
  const [resumo, setResumo] = useState(false),
    [reflexao, setReflexao] = useState(false);
  const dados = estado.dados,
    r = dados?.relatorio,
    s = dados?.resumo;
  return (
    <PaginaRelatorio titulo="Relatório" aoVoltar={() => navigation.goBack()}>
      <EstadoRelatorio estado={estado} />
      {r ? (
        <>
          <View style={e.grupo}>
            <Text style={[e.rotulo, e.roxo]}>{periodoCurto(s.periodo)}</Text>
            <Text style={e.legenda}>
              {s.periodo.fusoHorario
                ? nomeDoFuso(s.periodo.fusoHorario)
                : 'Fuso desta semana não registrado.'}
            </Text>
          </View>
          <Text style={[e.legenda, e.roxo]}>REFLEXÃO COM INTELIGÊNCIA ARTIFICIAL</Text>
          <Text style={e.titulo} accessibilityRole="header">
            {r.texto.titulo}
          </Text>
          {r.texto.proximoAjuste ? (
            <View style={[e.cartao, e.ajuste]}>
              <View style={[e.linha, e.linhaAjuste]}>
                <IconeBrilho accessible={false} />
                <Text style={[e.legenda, e.roxo]}>UM PRÓXIMO PASSO POSSÍVEL</Text>
              </View>
              <Text style={e.texto}>{r.texto.proximoAjuste}</Text>
            </View>
          ) : null}
          {s.planejamento?.estado === 'disponivel' ? (
            <ResumoAdesao
              style={e.planejamento}
              adesao={{
                estado: 'disponivel',
                previstasRegistradas: s.planejamento.previstas,
                concluidasDoPlanejamento: s.planejamento.concluidas,
                taxaConclusao: s.planejamento.taxaConclusao,
              }}
            />
          ) : (
            <View style={e.cartao}>
              <Text style={e.rotulo}>Atividade da semana</Text>
              <Text style={e.texto}>{resumoDoRelatorio(s)}</Text>
              <Text style={e.legenda}>
                {s.planejamento?.estado === 'sem_planejamento'
                  ? 'Não havia missões planejadas nesta semana.'
                  : 'O planejamento desta semana não está disponível.'}
              </Text>
            </View>
          )}
          {r.comparacaoSemanal ? (
            <ComparacaoDaSemana
              comparacao={r.comparacaoSemanal}
              mostrarPlanejamento={false}
              estiloCartao={e.cartao}
            />
          ) : null}
          <SecondaryButton
            style={e.botao}
            estiloRotulo={e.rotuloBotao}
            label="Sua semana em palavras"
            onPress={() => setResumo(!resumo)}
            accessibilityState={{ expanded: resumo }}
          />
          {resumo ? <Text style={e.texto}>{r.texto.resumo}</Text> : null}
          <SecondaryButton
            style={e.botao}
            estiloRotulo={e.rotuloBotao}
            label="Uma pergunta para refletir"
            onPress={() => setReflexao(!reflexao)}
            accessibilityState={{ expanded: reflexao }}
          />
          {reflexao ? <Text style={e.texto}>{r.texto.reflexao}</Text> : null}
          <SecondaryButton
            style={e.botao}
            estiloRotulo={e.rotuloBotao}
            label="Como foi feito"
            onPress={() => navigation.navigate('OrigemRelatorioScreen', { relatorioId: id })}
          />
          <Text style={e.legenda}>
            {s.periodo.fusoHorario ? `Salvo em ${dataDaGeracao(s)}` : dataDaGeracao(s)}
          </Text>
        </>
      ) : !estado.carregando && !estado.expirada ? (
        <SecondaryButton
          style={e.botao}
          estiloRotulo={e.rotuloBotao}
          label="Voltar ao histórico"
          onPress={() => navigation.goBack()}
        />
      ) : null}
    </PaginaRelatorio>
  );
}
