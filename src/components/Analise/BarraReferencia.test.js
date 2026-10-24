import { render, screen } from '@testing-library/react-native';

import { CartaoConexaoHabitos } from './CartaoConexaoHabitos';
import { BarraReferencia } from './BarraReferencia';

it('apresenta os percentuais dos dois grupos com os rótulos e a ressalva de associação', () => {
  render(
    <CartaoConexaoHabitos
      valores={{ grupoExpostoPercentual: 64.4, grupoNaoExpostoPercentual: 48.2 }}
    />,
  );
  expect(screen.getByLabelText('Com atividade física suficiente no lazer: 64,4%')).toBeTruthy();
  expect(screen.getByLabelText('Sem atividade física suficiente no lazer: 48,2%')).toBeTruthy();
  expect(screen.getByText(/não prova que o exercício causou o resultado/)).toBeTruthy();
});

it('identifica a ausência de valor sem apresentar percentual zero', () => {
  render(<BarraReferencia rotulo="Noite" percentual={null} />);
  expect(screen.getByLabelText('Noite: Sem valor publicado')).toBeTruthy();
  expect(screen.queryByText('0%')).toBeNull();
});
