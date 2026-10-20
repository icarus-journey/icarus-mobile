import { Text, View } from 'react-native';
import { SecondaryButton } from '../Button';
import { ValoresDaReferencia } from './ValoresDaReferencia';
import { estilosAnalise as estilos } from './estilosAnalise';
import { tipoDiaDaReferencia } from './formatarReferencia';

export function CartaoReferenciaPublica({ referencia, onEntender }) {
  const { dados, recorte, pais } = referencia;
  return (
    <View style={estilos.cartao}>
      <Text style={estilos.rotulo}>
        Referência pública · {dados.fonte} {dados.edicao} · {pais}
      </Text>
      <Text style={estilos.titulo} accessibilityRole="header">
        {dados.titulo}
      </Text>
      <ValoresDaReferencia dados={dados} />
      <Text style={estilos.texto}>
        {dados.populacao} · {dados.faixaEtaria} anos · {tipoDiaDaReferencia(dados.tipoDia)}
      </Text>
      <Text style={estilos.texto}>{dados.denominador}</Text>
      {recorte.ampliado ? (
        <Text style={estilos.aviso}>
          Referência de um grupo mais amplo. Confira o recorte em Entender os dados.
        </Text>
      ) : null}
      <Text style={estilos.texto}>{dados.pergunta}</Text>
      <Text style={estilos.texto}>{dados.reflexao}</Text>
      <SecondaryButton
        label="Entender os dados"
        accessibilityHint={dados.titulo}
        onPress={onEntender}
      />
    </View>
  );
}
