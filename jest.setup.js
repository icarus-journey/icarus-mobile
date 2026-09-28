jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

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
