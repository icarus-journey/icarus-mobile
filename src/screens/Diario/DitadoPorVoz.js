import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import IconMicrofone from '../../assets/icons/icon-microfone.svg';
import { colors } from '../../theme/colors';

let moduloReconhecimentoVoz = null;

try {
  moduloReconhecimentoVoz = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  moduloReconhecimentoVoz = null;
}

const MENSAGENS_ERRO = {
  'language-not-supported':
    'O modelo de português não está instalado para reconhecimento no dispositivo.',
  'not-allowed': 'Permita o acesso ao microfone para usar o ditado.',
  'no-speech': 'Nenhuma fala foi identificada. Tente novamente mais perto do microfone.',
  'service-not-allowed': 'O reconhecimento de voz não está disponível neste dispositivo.',
};

function juntarTexto(textoAtual, transcricao) {
  return [textoAtual.trim(), transcricao.trim()].filter(Boolean).join(' ');
}

export function DitadoPorVoz({ textoAtual, onTextoChange }) {
  const textoAntesDoDitado = useRef('');
  const onTextoChangeRef = useRef(onTextoChange);
  const [isEscutando, setIsEscutando] = useState(false);

  useEffect(() => {
    onTextoChangeRef.current = onTextoChange;
  }, [onTextoChange]);

  useEffect(() => {
    if (!moduloReconhecimentoVoz) {
      return undefined;
    }

    const ouvintes = [
      moduloReconhecimentoVoz.addListener('start', () => {
        setIsEscutando(true);
      }),
      moduloReconhecimentoVoz.addListener('end', () => setIsEscutando(false)),
      moduloReconhecimentoVoz.addListener('result', (evento) => {
        const transcricao = evento.results[0]?.transcript;

        if (transcricao) {
          onTextoChangeRef.current(juntarTexto(textoAntesDoDitado.current, transcricao));
        }
      }),
      moduloReconhecimentoVoz.addListener('error', (evento) => {
        setIsEscutando(false);

        if (evento.error !== 'aborted') {
          exibirErro(
            MENSAGENS_ERRO[evento.error] ||
              'Não foi possível transcrever sua fala. Tente novamente.',
          );
        }
      }),
    ];

    return () => {
      ouvintes.forEach((ouvinte) => ouvinte.remove());
      moduloReconhecimentoVoz.abort();
    };
  }, []);

  function exibirErro(mensagem) {
    Alert.alert('Não foi possível usar o ditado', mensagem);
  }

  async function iniciarDitado() {
    if (!moduloReconhecimentoVoz) {
      exibirErro('O ditado não funciona no Expo Go. Execute o aplicativo pelo development build.');
      return;
    }

    try {
      if (
        !moduloReconhecimentoVoz.isRecognitionAvailable() ||
        !moduloReconhecimentoVoz.supportsOnDeviceRecognition()
      ) {
        exibirErro('O reconhecimento de voz local não está disponível neste dispositivo.');
        return;
      }

      const permissao = await moduloReconhecimentoVoz.requestMicrophonePermissionsAsync();

      if (!permissao.granted) {
        exibirErro('Permita o acesso ao microfone para usar o ditado.');
        return;
      }

      textoAntesDoDitado.current = textoAtual;
      moduloReconhecimentoVoz.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        requiresOnDeviceRecognition: true,
      });
    } catch {
      exibirErro('Não foi possível iniciar o ditado. Tente novamente.');
    }
  }

  function finalizarDitado() {
    moduloReconhecimentoVoz?.stop();
  }

  return (
    <Pressable
      onPress={isEscutando ? finalizarDitado : iniciarDitado}
      accessibilityRole="button"
      accessibilityLabel={isEscutando ? 'Concluir ditado' : 'Ditar texto'}
      accessibilityHint="O texto reconhecido será inserido neste campo."
      accessibilityState={{ busy: isEscutando }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.botaoMicrofone,
        isEscutando && styles.botaoMicrofoneEscutando,
        pressed && styles.pressed,
      ]}
    >
      <IconMicrofone
        width={20}
        height={20}
        color={isEscutando ? colors.dangerText : colors.brand}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botaoMicrofone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softPurple,
  },
  botaoMicrofoneEscutando: {
    backgroundColor: colors.dangerSoft,
  },
  pressed: {
    opacity: 0.75,
  },
});
