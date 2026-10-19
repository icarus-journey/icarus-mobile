jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('expo-secure-store', () => {
  const armazenamento = new Map();

  return {
    setItemAsync: jest.fn(async (chave, valor) => {
      armazenamento.set(chave, valor);
    }),
    getItemAsync: jest.fn(async (chave) => armazenamento.get(chave) ?? null),
    deleteItemAsync: jest.fn(async (chave) => {
      armazenamento.delete(chave);
    }),
  };
});

jest.mock('expo-speech-recognition', () => {
  const ouvintes = {};

  return {
    ExpoSpeechRecognitionModule: {
      abort: jest.fn(),
      addListener: jest.fn((evento, callback) => {
        ouvintes[evento] = callback;
        return { remove: jest.fn() };
      }),
      isRecognitionAvailable: jest.fn(() => true),
      requestMicrophonePermissionsAsync: jest.fn(async () => ({ granted: true })),
      start: jest.fn(),
      stop: jest.fn(),
      supportsOnDeviceRecognition: jest.fn(() => true),
    },
    emitirEventoReconhecimento: (evento, dados = {}) => ouvintes[evento]?.(dados),
  };
});
