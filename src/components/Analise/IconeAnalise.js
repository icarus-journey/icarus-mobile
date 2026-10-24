import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../../theme/colors';

const TRACOS = {
  calendario:
    'M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  pontos: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z',
  presente:
    'M4 12h16v9H4v-9Zm-1-5h18v5H3V7Zm9 0v14M12 7H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
  seta: 'M5 12h14m-6-6 6 6-6 6',
  voltar: 'm14 6-6 6 6 6',
  proximo: 'm10 6 6 6-6 6',
  chevron: 'm6 9 6 6 6-6',
  confirmar: 'm5 12 4 4L19 6',
  grafico: 'M4 20V4m0 16h17M8 16v-4m5 4V8m5 8V5',
  brilho: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  info: 'M12 11v6m0-10v.1',
  globo: 'M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z',
};

export function IconeAnalise({ nome, tamanho = 20, cor = colors.brand }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" accessible={false}>
      {nome === 'info' || nome === 'globo' ? (
        <Circle cx="12" cy="12" r="9" stroke={cor} strokeWidth="1.7" />
      ) : null}
      <Path
        d={TRACOS[nome] ?? TRACOS.grafico}
        stroke={cor}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
