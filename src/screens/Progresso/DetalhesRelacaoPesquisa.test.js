import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { pesquisasQuantitativasDeTeste } from '../../testUtils/dadosAnaliticos';
import { DetalhesDaReferenciaScreen } from './DetalhesDaReferenciaScreen';

it('abre o detalhe quantitativo com recomendação e fonte, permite retorno e recuperação do navegador', async () => {
  const voltar = jest.fn();
  const abrir = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Sem navegador'));
  const leitura = pesquisasQuantitativasDeTeste().leituras[0];
  render(
    <DetalhesDaReferenciaScreen navigation={{ goBack: voltar }} route={{ params: { leitura } }} />,
  );
  expect(screen.getByText(leitura.recomendacao.texto)).toBeTruthy();
  expect(screen.getByText(leitura.dadosDaPesquisa)).toBeTruthy();
  expect(screen.queryByText('Como interpretar')).toBeNull();
  fireEvent.press(screen.getByText('Ver fonte oficial'));
  await screen.findByText('Não foi possível abrir a fonte. Tente novamente.');
  abrir.mockResolvedValueOnce();
  fireEvent.press(screen.getByText('Ver fonte oficial'));
  expect(abrir).toHaveBeenLastCalledWith(leitura.urlFonte);
  fireEvent.press(screen.getByLabelText('Voltar'));
  expect(voltar).toHaveBeenCalledTimes(1);
  abrir.mockRestore();
});
