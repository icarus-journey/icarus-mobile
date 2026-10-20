import { SeletorPeriodoProgresso } from '../../components/Analise/SeletorPeriodoProgresso';
import { ResumoEvolucaoPessoal } from '../../components/Analise/ResumoEvolucaoPessoal';
import { CartaoConquistaAVista } from '../../components/Analise/CartaoConquistaAVista';
import { formatarPeriodo } from '../../components/Analise/formatarPeriodo';
import { useProgresso } from '../../hooks/useProgresso';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SecondaryButton } from '../../components/Button';
import { PickerModal } from '../../components/PickerModal';
import { SelectField } from '../../components/SelectField';
import { CartaoReferenciaPublica } from '../../components/Analise/CartaoReferenciaPublica';
import { estilosAnalise as estilos } from '../../components/Analise/estilosAnalise';
import { useReferenciasPublicas } from '../../hooks/useReferenciasPublicas';
import { AREA_DA_VIDA_OPTIONS } from '../EpicForm/areaDaVidaOptions';
import { estilosProgresso } from './estilosProgresso';
import { colors } from '../../theme/colors';

const areas = AREA_DA_VIDA_OPTIONS.map((area) => ({
  ...area,
  id: area.id.replace(/([A-Z])/g, '_$1').toUpperCase(),
}));
export function ProgressoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState(null);
  const [periodo, setPeriodo] = useState('semanaAnterior');
  const pessoal = useProgresso(periodo);
  const [seletor, setSeletor] = useState(false);
  const { dados, carregando, erro, carregar } = useReferenciasPublicas(area);
  const areaEfetiva = area ?? dados?.areaDaVida;
  return (
    <View style={[estilosProgresso.tela, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[estilosProgresso.conteudo, { paddingBottom: insets.bottom + 24 }]}
      >
        <ScreenHeader title="Meu progresso" onBack={() => navigation.goBack()} />
        <SeletorPeriodoProgresso periodo={periodo} onChange={setPeriodo} />
        {pessoal.dados?.periodo ? (
          <Text style={estilos.texto}>{formatarPeriodo(pessoal.dados.periodo)}</Text>
        ) : null}
        {pessoal.carregando ? (
          <Text style={estilos.texto} accessibilityLiveRegion="polite">
            Carregando seus registros…
          </Text>
        ) : null}
        {pessoal.erro ? (
          <>
            <Text style={estilos.erro} accessibilityRole="alert">
              {pessoal.erro}
            </Text>
            <SecondaryButton label="Atualizar meus registros" onPress={pessoal.carregar} />
          </>
        ) : null}
        {pessoal.dados ? (
          <>
            <ResumoEvolucaoPessoal dados={pessoal.dados} />
            <CartaoConquistaAVista situacao={pessoal.dados.situacaoCenarios} />
          </>
        ) : null}
        <SecondaryButton
          label="Ver minha semana"
          onPress={() => navigation.navigate('RelatorioSemanalScreen')}
        />

        <Text style={estilos.titulo} accessibilityRole="header">
          Contexto para sua jornada
        </Text>
        <Text style={estilos.texto}>
          Conheça referências públicas para refletir sobre seus próximos passos. Elas não avaliam
          sua rotina nem definem uma meta pessoal.
        </Text>
        <SelectField
          label="Área do contexto público"
          value={areas.find((item) => item.id === areaEfetiva)?.titulo}
          placeholder="Escolher área"
          onPress={() => setSeletor(true)}
        />
        {carregando ? (
          <>
            <ActivityIndicator color={colors.brand} />
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              Carregando referências…
            </Text>
          </>
        ) : null}
        {erro ? (
          <>
            <Text style={estilos.erro} accessibilityRole="alert">
              {erro}
            </Text>
            <SecondaryButton label="Tentar novamente" onPress={carregar} />
          </>
        ) : null}
        {dados ? (
          <>
            <Text style={estilos.texto} accessibilityLiveRegion="polite">
              {dados.mensagem}
            </Text>
            {dados.referencias.map((referencia) => (
              <CartaoReferenciaPublica
                key={referencia.dados.id}
                referencia={referencia}
                onEntender={() => navigation.navigate('DetalhesDaReferenciaScreen', { referencia })}
              />
            ))}
            {dados.estado === 'indisponivel' ? (
              <SecondaryButton label="Atualizar referências" onPress={carregar} />
            ) : null}
          </>
        ) : null}
      </ScrollView>
      <PickerModal
        visible={seletor}
        title="Área do contexto público"
        items={areas}
        onClose={() => setSeletor(false)}
        onSelect={(item) => {
          setArea(item.id);
          setSeletor(false);
        }}
      />
    </View>
  );
}
