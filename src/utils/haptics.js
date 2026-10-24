import * as Haptics from 'expo-haptics';

/**
 * Vibração de sucesso ao concluir missão/campanha/épico. Silenciosa em plataforma ou
 * dispositivo sem suporte (ex.: web) — nunca deve interromper o fluxo de conclusão.
 */
export async function vibrarConclusao() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // sem suporte — ignora
  }
}
