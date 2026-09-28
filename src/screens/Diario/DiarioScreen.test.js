import { emitirEventoReconhecimento, ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { DiariosProvider } from '../../state/DiariosContext';
import { DiarioScreen } from './DiarioScreen';

const navigation = { navigate: jest.fn() };

function renderScreen(initialEntries = []) {
  return render(
    <DiariosProvider initialEntries={initialEntries}>
      <DiarioScreen navigation={navigation} />
    </DiariosProvider>,
  );
}

describe('DiarioScreen', () => {
  it('renderiza o microfone no campo de texto e o estado vazio', () => {
    renderScreen();

    expect(screen.getByText('Diário de crescimento')).toBeTruthy();
    expect(screen.getByLabelText('Reflexão de hoje')).toBeTruthy();
    expect(screen.getByLabelText('Ditar texto')).toBeTruthy();
    expect(screen.queryByText('Ditado por voz')).toBeNull();
    expect(screen.getByText('Seu diário começa aqui')).toBeTruthy();
  });

  it('solicita permissão e inicia o reconhecimento de voz em português', async () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Ditar texto'));

    await waitFor(() => {
      expect(ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync).toHaveBeenCalled();
      expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalledWith({
        lang: 'pt-BR',
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        requiresOnDeviceRecognition: true,
      });
    });
  });

  it('acrescenta a transcrição reconhecida ao texto existente', async () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Comecei escrevendo.');
    fireEvent.press(screen.getByLabelText('Ditar texto'));

    await waitFor(() => expect(ExpoSpeechRecognitionModule.start).toHaveBeenCalled());

    act(() => {
      emitirEventoReconhecimento('result', {
        results: [{ transcript: 'Hoje consegui concluir minhas prioridades.' }],
        isFinal: true,
      });
    });

    expect(
      screen.getByDisplayValue('Comecei escrevendo. Hoje consegui concluir minhas prioridades.'),
    ).toBeTruthy();
  });

  it('registra uma reflexão textual no histórico', () => {
    renderScreen();

    fireEvent.changeText(
      screen.getByLabelText('Reflexão de hoje'),
      'Consegui respeitar meu ritmo.',
    );
    fireEvent.press(screen.getByLabelText('Registrar reflexão'));

    expect(screen.getByText('Reflexão registrada')).toBeTruthy();
    expect(screen.getByText('Consegui respeitar meu ritmo.')).toBeTruthy();
  });

  it('exige texto escrito ou ditado antes de registrar', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Registrar reflexão'));

    expect(screen.getByText('Escreva ou dite uma mensagem para continuar.')).toBeTruthy();
  });

  it('alterna para o registro de deslize sem linguagem punitiva', () => {
    renderScreen();

    fireEvent.press(screen.getByLabelText('Deslize'));

    expect(screen.getByText('Sem culpa: entender o padrão também é progresso.')).toBeTruthy();
    expect(screen.getByLabelText('Explicação')).toBeTruthy();
    expect(screen.getByLabelText('Registrar e retomar')).toBeTruthy();
  });

  it('permite editar uma entrada existente', () => {
    renderScreen([
      {
        id: 'diario-1',
        tipo: 'REFLEXAO',
        texto: 'Texto original',
        dataRegistro: '2026-09-15',
        criadaEm: '2026-09-15T20:00:00.000Z',
        atualizadaEm: null,
        excluidaEm: null,
      },
    ]);

    fireEvent.press(screen.getByLabelText('Editar entrada de 15/09'));
    fireEvent.changeText(screen.getByLabelText('Reflexão de hoje'), 'Texto revisado');
    fireEvent.press(screen.getByLabelText('Salvar alterações'));

    expect(screen.getByText('Texto revisado')).toBeTruthy();
    expect(screen.queryByText('Texto original')).toBeNull();
  });
});
