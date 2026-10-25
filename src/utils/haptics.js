import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

/**
 * Vibração de sucesso ao concluir missão/campanha/épico. Silenciosa em plataforma ou
 * dispositivo sem suporte (ex.: web) — nunca deve interromper o fluxo de conclusão.
 */
export async function vibrarConclusao() {
  try {
    if (Platform.OS === 'android') {
      // Motores simples precisam de pulsos mais longos que o efeito háptico de sucesso.
      Vibration.vibrate([0, 140, 80, 180], false);
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // sem suporte — ignora
  }
}
