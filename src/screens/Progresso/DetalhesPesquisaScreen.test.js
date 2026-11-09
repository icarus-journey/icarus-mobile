import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { DetalhesPesquisaScreen } from './DetalhesPesquisaScreen';

it('preserva a fonte e permite tentar novamente se o navegador falhar', async () => {
  const abrir = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Sem navegador'));
  render(
    <DetalhesPesquisaScreen
      navigation={{ goBack: jest.fn() }}
      route={{
        params: {
          pesquisa: {
            titulo: 'Pesquisa de teste',
            ano: 2011,
            doi: '10.1126/science.1199327',
            url: 'https://pubmed.ncbi.nlm.nih.gov/21252317/',
            achado: 'Achado educativo',
            populacao: 'População estudada',
            desenho: 'Experimento',
            desfecho: 'Compreensão',
            limites: 'Não avalia este usuário.',
          },
        },
      }}
    />,
  );
  fireEvent.press(screen.getByText('Abrir publicação original'));
  await screen.findByText('Não foi possível abrir a publicação. Tente novamente.');
  abrir.mockResolvedValueOnce();
  fireEvent.press(screen.getByText('Abrir publicação original'));
  expect(abrir).toHaveBeenLastCalledWith('https://pubmed.ncbi.nlm.nih.gov/21252317/');
  abrir.mockRestore();
});
