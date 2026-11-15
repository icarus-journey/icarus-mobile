import { AccessibilityInfo } from 'react-native';
import { focarElemento } from './focarElemento';

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

it('foca o elemento com leitor de tela habilitado', async () => {
  jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(true);
  const foco = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => {});
  jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(42);
  await focarElemento({ current: {} });
  expect(foco).toHaveBeenCalledWith(42);
});

it('não move o foco quando o leitor está desabilitado ou o elemento já foi removido', async () => {
  const leitor = jest.spyOn(AccessibilityInfo, 'isScreenReaderEnabled').mockResolvedValue(false);
  const foco = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => {});
  await focarElemento({ current: {} });
  leitor.mockResolvedValue(true);
  await focarElemento({ current: null });
  expect(foco).not.toHaveBeenCalled();
});
