import * as Haptics from 'expo-haptics';

import { vibrarConclusao } from './haptics';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

describe('vibrarConclusao', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispara o retorno háptico de sucesso', async () => {
    await vibrarConclusao();

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
  });

  it('não propaga erro quando a plataforma não tem suporte', async () => {
    Haptics.notificationAsync.mockRejectedValueOnce(new Error('sem suporte'));

    await expect(vibrarConclusao()).resolves.toBeUndefined();
  });
});
