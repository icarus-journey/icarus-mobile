import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

import { vibrarConclusao } from './haptics';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

describe('vibrarConclusao', () => {
  const plataformaOriginal = Platform.OS;
  beforeEach(() => {
    jest.spyOn(Vibration, 'vibrate').mockImplementation(() => {});
  });
  afterEach(() => {
    Platform.OS = plataformaOriginal;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('dispara dois pulsos perceptíveis no Android sem repetir', async () => {
    Platform.OS = 'android';
    await vibrarConclusao();

    const [padrao, repetir] = Vibration.vibrate.mock.calls[0];
    expect(padrao).toHaveLength(4);
    expect(padrao[0]).toBe(0);
    expect(padrao[1]).toBeGreaterThanOrEqual(100);
    expect(padrao[2]).toBeGreaterThan(0);
    expect(padrao[3]).toBeGreaterThanOrEqual(100);
    expect(repetir).toBe(false);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('mantém o retorno háptico de sucesso no iOS', async () => {
    Platform.OS = 'ios';
    await vibrarConclusao();

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
    expect(Vibration.vibrate).not.toHaveBeenCalled();
  });

  it('não interrompe a conclusão se a vibração Android falhar', async () => {
    Platform.OS = 'android';
    Vibration.vibrate.mockImplementationOnce(() => {
      throw new Error('sem suporte');
    });
    await expect(vibrarConclusao()).resolves.toBeUndefined();
  });

  it('não propaga erro quando a plataforma não tem suporte', async () => {
    Platform.OS = 'ios';
    Haptics.notificationAsync.mockRejectedValueOnce(new Error('sem suporte'));

    await expect(vibrarConclusao()).resolves.toBeUndefined();
  });
});
