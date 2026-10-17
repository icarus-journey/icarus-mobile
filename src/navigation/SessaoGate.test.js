import { useState } from 'react';
import { Button, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { useSessao } from '../state/SessaoContext';
import { SessaoGate } from './SessaoGate';

jest.mock('../state/SessaoContext', () => ({ useSessao: jest.fn() }));

function Rascunho() {
  const [texto, setTexto] = useState('');
  return (
    <>
      <Button title="Editar reflexão" onPress={() => setTexto('Reflexão ainda não salva')} />
      <Text>{texto}</Text>
    </>
  );
}

it('preserva o rascunho e bloqueia a tela durante uma falha temporária de conexão', () => {
  useSessao.mockReturnValue({ carregando: false, erroRestauracao: '' });
  const { rerender } = render(
    <SessaoGate>
      <Rascunho />
    </SessaoGate>,
  );
  fireEvent.press(screen.getByText('Editar reflexão'));
  useSessao.mockReturnValue({ carregando: false, erroRestauracao: 'Sem conexão' });
  rerender(
    <SessaoGate>
      <Rascunho />
    </SessaoGate>,
  );
  expect(screen.getByText('Sem conexão')).toBeTruthy();
  expect(screen.queryByText('Reflexão ainda não salva')).toBeNull();
  useSessao.mockReturnValue({ carregando: false, erroRestauracao: '' });
  rerender(
    <SessaoGate>
      <Rascunho />
    </SessaoGate>,
  );
  expect(screen.getByText('Reflexão ainda não salva')).toBeTruthy();
});
