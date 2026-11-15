import { Pressable, Text, View } from 'react-native';

import { conteudoReferencia } from '../../utils/conteudoReferencia';
import { ValoresDaReferencia } from './ValoresDaReferencia';
import { IconeAnalise } from './IconeAnalise';
import { estilosPainel as estilos } from './estilosPainel';

export function CartaoReferenciaPublica({ referencia, onEntender }) {
  const { dados, recorte, pais } = referencia;
  const conteudo = conteudoReferencia(dados);
  const participantes =
    dados.fonte === 'ATUS'
      ? 'Participantes da pesquisa nos EUA'
      : dados.fonte === 'Vigitel'
        ? 'Adultos das capitais e do DF'
        : dados.populacao;
  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <View style={estilos.icone}>
          <IconeAnalise nome="globo" />
        </View>
        <View style={estilos.textoFlexivel}>
          <Text style={estilos.rotulo}>PESQUISA DE {dados.edicao}</Text>
          <Text style={estilos.pequeno}>
            {dados.fonte} · {pais}
          </Text>
        </View>
      </View>
      <Text style={estilos.titulo} accessibilityRole="header">
        {conteudo.titulo}
      </Text>
      {dados.medida === 'associacao' && conteudo.explicacao ? (
        <Text style={estilos.pequeno}>{conteudo.explicacao}</Text>
      ) : null}
      <ValoresDaReferencia dados={dados} compacto />
      {dados.medida !== 'associacao' && conteudo.explicacao ? (
        <Text style={estilos.pequeno}>{conteudo.explicacao}</Text>
      ) : null}
      <Text style={estilos.pequeno}>
        {participantes} · {dados.faixaEtaria} anos
      </Text>
      {recorte.ampliado ? (
        <Text style={estilos.pequeno}>Grupo mais amplo · veja os detalhes</Text>
      ) : null}
      <View style={estilos.divisor} />
      <Text style={estilos.rotulo}>PARA SUA ROTINA</Text>
      <Text style={estilos.texto}>{conteudo.reflexao}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Entender os dados"
        accessibilityHint={dados.titulo}
        onPress={onEntender}
        style={estilos.botaoTexto}
      >
        <Text style={estilos.marca}>Entender os dados</Text>
        <IconeAnalise nome="seta" tamanho={18} />
      </Pressable>
    </View>
  );
}
