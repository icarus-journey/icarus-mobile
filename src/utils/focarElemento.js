import { AccessibilityInfo, findNodeHandle } from 'react-native';

export async function focarElemento(referencia) {
  if (!(await AccessibilityInfo.isScreenReaderEnabled())) return;
  const identificador = referencia.current && findNodeHandle(referencia.current);
  if (identificador) AccessibilityInfo.setAccessibilityFocus(identificador);
}
