import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico } from './formatarReferencia';

const AREAS = {
  CORPO_E_SAUDE: 'Corpo e saúde',
  SONO_E_RECUPERACAO: 'Sono e recuperação',
  MENTE_E_EMOCOES: 'Mente e emoções',
  ESTUDOS_E_APRENDIZADO: 'Estudos e aprendizado',
  TRABALHO_E_CARREIRA: 'Trabalho e carreira',
  FINANCAS: 'Finanças',
  RELACIONAMENTOS_E_COMUNIDADE: 'Relacionamentos e comunidade',
  CASA_E_VIDA_PRATICA: 'Casa e vida prática',
  LAZER_E_CRIATIVIDADE: 'Lazer e criatividade',
  PROPOSITO_E_ESPIRITUALIDADE: 'Propósito e espiritualidade',
};

export function DistribuicaoPorArea({ indicadores }) {
  const areas = [...(indicadores?.distribuicaoPorArea ?? [])].sort(
    (a, b) => b.concluidas - a.concluidas,
  );
  if (!areas.length) return null;
  const maior = Math.max(...areas.map((area) => area.concluidas), 1);
  return (
    <View style={estilos.cartao}>
      <View style={estilos.entre}>
        <Text style={[estilos.titulo, estilos.textoFlexivel]} accessibilityRole="header">
          Por área da vida
        </Text>
        <Text style={estilos.pequeno}>missões feitas</Text>
      </View>
      {areas.map((area) => (
        <View
          key={area.areaDaVida}
          style={locais.area}
          accessible
          accessibilityLabel={`${AREAS[area.areaDaVida] ?? area.areaDaVida}: ${area.concluidas} ${area.concluidas === 1 ? 'missão feita' : 'missões feitas'}`}
        >
          <View style={estilos.entre}>
            <Text style={[estilos.texto, estilos.textoFlexivel]}>
              {AREAS[area.areaDaVida] ?? area.areaDaVida}
            </Text>
            <Text style={locais.quantidade}>{numeroPublico(area.concluidas)}</Text>
          </View>
          <View style={locais.trilho}>
            <View style={[locais.barra, { width: `${(area.concluidas / maior) * 100}%` }]} />
          </View>
        </View>
      ))}
      {indicadores.conclusoesSemArea > 0 ? (
        <Text style={estilos.pequeno}>
          Mais {indicadores.conclusoesSemArea} missões avulsas feitas, sem uma área escolhida.
        </Text>
      ) : null}
    </View>
  );
}

const locais = StyleSheet.create({
  area: { gap: 8 },
  quantidade: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.brandDark },
  trilho: { height: 7, backgroundColor: colors.progressTrack, borderRadius: 4, overflow: 'hidden' },
  barra: { height: '100%', borderRadius: 4, backgroundColor: colors.brandAccent },
});
