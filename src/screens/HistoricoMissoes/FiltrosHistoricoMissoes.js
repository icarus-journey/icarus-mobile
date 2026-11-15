import { InputField } from '../../components/InputField';
import { deDataIso, paraDataIso, isValidDateString, maskDateInput } from '../../utils/dateInput';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { PickerModal } from '../../components/PickerModal';
import { colors } from '../../theme/colors';
import { ESTADOS, FILTROS_INICIAIS, filtroDoPeriodo } from './apresentacaoHistorico';
import { estilos as e } from './styles';

export function FiltrosHistoricoMissoes({ filtros, periodos, servico, aoAplicar, aoFechar }) {
  const insets = useSafeAreaInsets();
  const [inicio, setInicio] = useState(deDataIso(filtros.inicio) ?? '');
  const [fim, setFim] = useState(deDataIso(filtros.fim) ?? '');
  const [erroPeriodo, setErroPeriodo] = useState('');
  const [rascunho, setRascunho] = useState(filtros),
    [seletor, setSeletor] = useState(null);
  const [campanhas, setCampanhas] = useState([]),
    [erro, setErro] = useState(''),
    [carregando, setCarregando] = useState(true),
    [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let atual = true;
    servico
      .campanhas()
      .then((lista) => {
        if (atual) {
          setCampanhas(lista);
          setErro('');
        }
      })
      .catch((f) => {
        if (atual)
          setErro(
            f.status === 401
              ? 'Sua sessão terminou. Entre novamente.'
              : 'Não foi possível carregar as campanhas.',
          );
      })
      .finally(() => {
        if (atual) setCarregando(false);
      });
    return () => {
      atual = false;
    };
  }, [servico, tentativa]);
  const opcoes = [
    { id: 'todas', titulo: 'Todas as campanhas' },
    { id: 'avulsas', titulo: 'Missões avulsas' },
    ...campanhas.map((c) => ({
      id: String(c.id),
      campanhaId: c.id,
      titulo: `${c.titulo}${c.removida ? ' · Removida' : ''}`,
    })),
  ];
  const campanhaSelecionada = rascunho.avulsas
    ? 'Missões avulsas'
    : rascunho.campanhaId
      ? (opcoes.find((c) => c.campanhaId === rascunho.campanhaId)?.titulo ??
        rascunho.campanhaTitulo ??
        'Campanha selecionada')
      : 'Todas as campanhas';
  function aplicar() {
    if (rascunho.periodo !== 'personalizado') {
      aoAplicar(rascunho);
      return;
    }
    if (!isValidDateString(inicio) || !isValidDateString(fim)) {
      setErroPeriodo('Confira as duas datas.');
      return;
    }
    const inicioIso = paraDataIso(inicio),
      fimIso = paraDataIso(fim);
    const dias = (Date.parse(fimIso) - Date.parse(inicioIso)) / 86400000;
    if (inicioIso < '0001-01-01' || fimIso < inicioIso || !Number.isFinite(dias) || dias > 3660) {
      setErroPeriodo('Escolha um período de até dez anos, com início antes do fim.');
      return;
    }
    aoAplicar({ ...rascunho, inicio: inicioIso, fim: fimIso });
  }
  return (
    <Modal visible animationType="slide" onRequestClose={aoFechar}>
      <View accessibilityLabel="Filtros do histórico" style={[e.tela, { paddingTop: insets.top }]}>
        <View style={e.cabecalho}>
          <ScreenHeader title="Filtrar histórico" onBack={aoFechar} />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[e.conteudo, { paddingBottom: insets.bottom + 24 }]}
        >
          <Text style={e.rotulo}>Período</Text>
          <SecondaryButton
            label={periodos.find((p) => p.id === rascunho.periodo)?.titulo ?? 'Período selecionado'}
            onPress={() => setSeletor('periodo')}
          />
          <Text style={e.legenda}>Pela data prevista da missão.</Text>
          {rascunho.periodo === 'personalizado' ? (
            <View style={e.espaco}>
              <InputField
                label="Data inicial"
                placeholder="dd/mm/aaaa"
                keyboardType="number-pad"
                value={inicio}
                onChangeText={(t) => setInicio(maskDateInput(t))}
              />
              <InputField
                label="Data final"
                placeholder="dd/mm/aaaa"
                keyboardType="number-pad"
                value={fim}
                onChangeText={(t) => setFim(maskDateInput(t))}
              />
              {erroPeriodo ? (
                <Text accessibilityRole="alert" style={e.erro}>
                  {erroPeriodo}
                </Text>
              ) : null}
            </View>
          ) : null}
          <Text style={e.rotulo}>Estado</Text>
          <View style={e.filtros}>
            {ESTADOS.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityLabel={item.titulo}
                accessibilityState={{ checked: rascunho.estado === item.id }}
                style={[e.pill, rascunho.estado === item.id && e.pillAtiva]}
                onPress={() => setRascunho({ ...rascunho, estado: item.id })}
              >
                <Text style={[e.rotulo, rascunho.estado === item.id && e.branco]}>
                  {item.titulo}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={e.rotulo}>Campanha</Text>
          <SecondaryButton label={campanhaSelecionada} onPress={() => setSeletor('campanha')} />
          {carregando ? (
            <ActivityIndicator accessibilityLabel="Buscando campanhas" color={colors.brand} />
          ) : null}
          {erro ? (
            <View style={e.aviso}>
              <Text accessibilityRole="alert" style={e.erro}>
                {erro}
              </Text>
              <SecondaryButton
                label="Atualizar campanhas"
                onPress={() => {
                  setCarregando(true);
                  setTentativa((n) => n + 1);
                }}
              />
            </View>
          ) : null}
          <Text style={e.legenda}>Missões avulsas também entram no histórico.</Text>
          <PrimaryButton label="Aplicar filtros" showIcon={false} onPress={aplicar} />
          <SecondaryButton label="Limpar filtros" onPress={() => setRascunho(FILTROS_INICIAIS)} />
        </ScrollView>
      </View>
      <PickerModal
        visible={seletor === 'periodo'}
        title="Escolher período"
        items={periodos}
        onClose={() => setSeletor(null)}
        onSelect={(p) => {
          setRascunho(filtroDoPeriodo(rascunho, p));
          setSeletor(null);
        }}
      />
      <PickerModal
        visible={seletor === 'campanha'}
        title="Escolher campanha"
        items={opcoes}
        onClose={() => setSeletor(null)}
        onSelect={(p) => {
          setRascunho({
            ...rascunho,
            campanhaId: p.campanhaId ?? null,
            avulsas: p.id === 'avulsas',
            campanhaTitulo: p.titulo,
          });
          setSeletor(null);
        }}
      />
    </Modal>
  );
}
