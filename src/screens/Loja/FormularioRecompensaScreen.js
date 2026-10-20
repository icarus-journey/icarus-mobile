import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconeVoltar from '../../assets/icons/icone-voltar-loja.svg';
import { PrimaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useLoja } from '../../state/LojaContext';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { CartaoRecompensa } from './CartaoRecompensa';

export function FormularioRecompensaScreen({ navigation, route }) {
  const { loja, salvar, enviando, erro } = useLoja();
  const id = route.params?.recompensaId;
  const recompensa = loja?.recompensas.find((item) => item.id === id);
  const [titulo, setTitulo] = useState(recompensa?.titulo ?? '');
  const [descricao, setDescricao] = useState(recompensa?.descricao ?? '');
  const [custo, setCusto] = useState(recompensa ? String(recompensa.custo) : '');
  const [erros, setErros] = useState({});
  const envio = useRef(false);
  const margens = useSafeAreaInsets();

  async function enviar() {
    if (envio.current) return;
    const validacao = {};
    if (!titulo.trim() || titulo.length > 120)
      validacao.titulo = 'Informe um nome de até 120 caracteres.';
    if (descricao.length > 1000) validacao.descricao = 'Use até 1.000 caracteres.';
    if (!/^\d+$/.test(custo) || Number(custo) < 1 || Number(custo) > 1000000)
      validacao.custo = 'Informe um inteiro entre 1 e 1.000.000.';
    setErros(validacao);
    if (Object.keys(validacao).length) return;
    envio.current = true;
    try {
      if (
        await salvar(
          { titulo: titulo.trim(), descricao: descricao.trim() || null, custo: Number(custo) },
          id,
        )
      )
        navigation.goBack();
    } finally {
      envio.current = false;
    }
  }

  return (
    <View style={[styles.tela, { paddingTop: margens.top + 12 }]}>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.conteudo, { paddingBottom: margens.bottom + 24 }]}
      >
        <ScreenHeader
          title={id ? 'Editar recompensa' : 'Nova recompensa'}
          onBack={() => navigation.goBack()}
          corVoltar={colors.lojaSuave}
          IconeVoltar={IconeVoltar}
        />
        {id && (!recompensa || recompensa.imutavel || recompensa.estado !== 'disponivel') ? (
          <Text accessibilityRole="alert" style={styles.erro}>
            Esta recompensa não pode mais ser editada.
          </Text>
        ) : (
          <>
            <InputField
              label="Nome da recompensa"
              required
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex.: Tarde livre"
              maxLength={120}
              error={erros.titulo}
            />
            <InputField
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Como você quer aproveitar?"
              maxLength={1000}
              error={erros.descricao}
            />
            <InputField
              label="Custo em pontos"
              required
              value={custo}
              onChangeText={setCusto}
              placeholder="Ex.: 300"
              keyboardType="number-pad"
              maxLength={7}
              error={erros.custo}
            />
            <Text style={styles.rotulo}>Prévia</Text>
            <CartaoRecompensa
              titulo={titulo.trim() || 'Sua recompensa'}
              descricao={descricao.trim()}
              custo={Number(custo) || 0}
              previa
            />
            {erro ? (
              <Text accessibilityRole="alert" style={styles.erro}>
                {erro}
              </Text>
            ) : null}
            <PrimaryButton
              label={enviando ? 'Salvando…' : id ? 'Salvar alterações' : 'Criar recompensa'}
              onPress={enviar}
              disabled={enviando}
              cor={colors.loja}
            />
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.surface },
  conteudo: { paddingHorizontal: 24, gap: 16 },
  rotulo: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimaryStrong },
  erro: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.dangerText },
});
