import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as TextoSvg } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { estilosPainel as estilos } from './estilosPainel';
import { numeroPublico as numero } from './formatarReferencia';

export function GraficoEvolucaoMeta({ pontos, unidade, alvo }) {
  const [largura, setLargura] = useState(300);
  const recentes = pontos.slice(-5);
  if (recentes.length < 2) return null;
  const teto = Math.max(
    1,
    Number.isFinite(alvo) && alvo > 0 ? alvo : 0,
    ...recentes.map((p) => p.valor),
  );
  const inicio = Date.parse(recentes[0].data);
  const duracao = Date.parse(recentes.at(-1).data) - inicio || 1;
  const x = (p) => 44 + ((Date.parse(p.data) - inicio) / duracao) * (largura - 64);
  const y = (valor) => 170 - (valor / teto) * 140;
  return (
    <View onLayout={(e) => setLargura(e.nativeEvent.layout.width || 300)} style={{ gap: 8 }}>
      <Text style={estilos.titulo}>Evolução da meta</Text>
      <Text style={estilos.pequeno}>{unidade}</Text>
      <View
        accessible
        accessibilityLabel={recentes
          .map(
            (p) =>
              `${p.data}: ${numero(p.valor)} ${unidade}${p.revisado ? ', valor revisado' : ''}`,
          )
          .join('. ')}
      >
        <Svg width="100%" height={206} viewBox={`0 0 ${largura} 206`} accessible={false}>
          {[0, 1, 2, 3, 4].map((i) => (
            <ViewSvgGrade
              key={i}
              largura={largura}
              y={y((teto * i) / 4)}
              valor={numero((teto * i) / 4)}
            />
          ))}
          <Polyline
            points={recentes.map((p) => `${x(p)},${y(p.valor)}`).join(' ')}
            fill="none"
            stroke={colors.brand}
            strokeWidth={2.5}
          />
          {recentes.map((p) => (
            <GrupoPonto key={p.data} ponto={p} x={x(p)} y={y(p.valor)} />
          ))}
        </Svg>
      </View>
      <Text style={[estilos.pequeno, { textAlign: 'center' }]}>Data do registro</Text>
      {pontos.length > recentes.length ? (
        <Text style={estilos.pequeno}>Últimos {recentes.length} registros da meta.</Text>
      ) : null}
    </View>
  );
}
function ViewSvgGrade({ largura, y, valor }) {
  return (
    <>
      <Line x1={44} y1={y} x2={largura - 20} y2={y} stroke={colors.borderDefault} />
      <TextoSvg x={36} y={y + 4} fontSize={11} textAnchor="end" fill={colors.textSecondary}>
        {valor}
      </TextoSvg>
    </>
  );
}
function GrupoPonto({ ponto, x, y }) {
  return (
    <>
      <Circle cx={x} cy={y} r={3.5} fill={colors.brand} />
      <TextoSvg x={x} y={y - 10} textAnchor="middle" fontSize={11} fill={colors.textPrimary}>
        {numero(ponto.valor)}
      </TextoSvg>
      <TextoSvg x={x} y={193} textAnchor="middle" fontSize={11} fill={colors.textSecondary}>
        {`${ponto.data.slice(8, 10)}/${ponto.data.slice(5, 7)}`}
      </TextoSvg>
    </>
  );
}
