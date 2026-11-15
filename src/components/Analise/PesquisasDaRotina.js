import { useState } from 'react';
import { Text, View } from 'react-native';

import { AcessoPesquisa } from './AcessoPesquisa';
import { CartaoLeituraQuantitativa } from './CartaoLeituraQuantitativa';
import { estilosPainel as estilos } from './estilosPainel';

export function PesquisasDaRotina({ dados, aoVerReferencia }) {
  const [selecionadaId, setSelecionadaId] = useState(null);
  const leituras = dados.leituras ?? [];
  const selecionada = leituras.find((l) => l.id === selecionadaId) ?? leituras[0];
  if (!selecionada)
    return (
      <View style={estilos.cartao}>
        <Text style={estilos.titulo}>Ainda sem uma relação para mostrar</Text>
        <Text style={estilos.texto} accessibilityLiveRegion="polite">
          {dados.estado === 'disponivel'
            ? 'Ainda não há uma relação quantitativa compatível com este tema e recorte.'
            : dados.mensagem}
        </Text>
      </View>
    );
  return (
    <View style={estilos.secao}>
      <CartaoLeituraQuantitativa
        leitura={selecionada}
        aoAbrir={() => aoVerReferencia(selecionada)}
      />
      {leituras
        .filter((l) => l.id !== selecionada.id)
        .map((l) => (
          <AcessoPesquisa key={l.id} rotulo={l.atalho} aoAbrir={() => setSelecionadaId(l.id)} />
        ))}
    </View>
  );
}
