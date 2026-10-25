import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav } from '../../components/BottomNav';
import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { useLoja } from '../../state/LojaContext';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { CartaoRecompensa } from './CartaoRecompensa';

const ESTADOS = { disponivel: 'Disponível', resgatada: 'Resgatada', utilizada: 'Utilizada' };

export function LojaScreen({ navigation }) {
  const { loja, carregando, enviando, erro, recarregar, resgatar, excluir, desfazer, utilizar } =
    useLoja();
  const [selecao, setSelecao] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const margens = useSafeAreaInsets();
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar]),
  );

  const selecionada = selecao?.protecao
    ? loja?.protecao
    : loja?.recompensas.find((item) => item.id === selecao?.id);
  const podeResgatar =
    selecionada &&
    loja.saldoPontos >= selecionada.custo &&
    (!selecao.protecao || loja.protecao.quantidade < loja.protecao.limite);

  async function confirmar() {
    const { acao, id } = confirmacao;
    const operacoes = { resgatar, excluir, desfazer, utilizar };
    if (await operacoes[acao](id)) {
      setConfirmacao(null);
      setSelecao(null);
    }
  }

  function pedirResgate() {
    setConfirmacao({
      acao: 'resgatar',
      id: selecao.protecao ? null : selecionada.id,
      titulo: 'Resgatar recompensa?',
      mensagem: `${selecionada.titulo} custa ${selecionada.custo} pontos. Seu saldo atual é ${loja.saldoPontos} pontos. Após o resgate, restarão ${loja.saldoPontos - selecionada.custo} pontos.`,
      botao: 'Confirmar resgate',
    });
  }

  const recompensa = (item) => (
    <CartaoRecompensa
      key={item.id}
      {...item}
      estado={item.estado === 'disponivel' ? undefined : ESTADOS[item.estado]}
      onPress={() => {
        setSelecao({ id: item.id });
        setConfirmacao(null);
      }}
      onExcluir={
        item.estado === 'disponivel'
          ? () =>
              setConfirmacao({
                acao: 'excluir',
                id: item.id,
                titulo: 'Excluir recompensa?',
                mensagem: `Excluir “${item.titulo}” da loja? Os resgates anteriores continuarão no histórico.`,
                botao: 'Excluir recompensa',
              })
          : undefined
      }
    />
  );

  return (
    <View style={styles.tela}>
      <ScrollView
        contentContainerStyle={[styles.conteudo, { paddingTop: margens.top + 24 }]}
        refreshControl={
          <RefreshControl refreshing={carregando} onRefresh={recarregar} tintColor={colors.loja} />
        }
      >
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Loja de recompensas</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar recompensa"
            onPress={() => navigation.navigate('FormularioRecompensa')}
            style={styles.adicionar}
          >
            <Text style={styles.mais}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.texto}>Troque pontos por descanso e personalização.</Text>
        <View style={styles.saldo}>
          <Text style={styles.rotuloSaldo}>Saldo disponível</Text>
          <Text style={styles.valorSaldo} accessibilityLiveRegion="polite">
            {loja ? `${loja.saldoPontos.toLocaleString('pt-BR')} pontos` : '—'}
          </Text>
        </View>
        {erro && !selecao && !confirmacao ? (
          <View style={styles.aviso}>
            <Text accessibilityRole="alert" style={styles.erro}>
              {erro}
            </Text>
            <SecondaryButton
              label="Atualizar loja"
              onPress={recarregar}
              disabled={enviando || carregando}
            />
          </View>
        ) : null}
        {carregando && !loja ? (
          <ActivityIndicator accessibilityLabel="Carregando loja" color={colors.lojaTexto} />
        ) : null}
        {loja ? (
          <>
            <Text style={styles.subtitulo}>Proteção de sequência</Text>
            <CartaoRecompensa
              titulo={loja.protecao.titulo}
              descricao="Uma proteção cobre um dia sem conclusão. Consumo automático pela sequência."
              custo={loja.protecao.custo}
              estado={`${loja.protecao.quantidade} de ${loja.protecao.limite} proteções no inventário`}
              onPress={() => {
                setSelecao({ protecao: true });
                setConfirmacao(null);
              }}
            />
            <Text style={styles.subtitulo}>Suas recompensas</Text>
            {!loja.recompensas.length ? (
              <Text style={styles.texto}>
                Sua loja ainda não tem recompensas. Toque em + para criar a primeira.
              </Text>
            ) : null}
            {loja.recompensas.filter((item) => item.estado === 'disponivel').map(recompensa)}
            {['resgatada', 'utilizada'].map((estado) => {
              const itens = loja.recompensas.filter((item) => item.estado === estado);
              return itens.length ? (
                <View key={estado} style={styles.grupo}>
                  <Text style={styles.rotulo}>
                    {estado === 'resgatada' ? 'Resgatadas' : 'Utilizadas'}
                  </Text>
                  {itens.map(recompensa)}
                </View>
              ) : null;
            })}
            <Text style={styles.subtitulo}>Histórico de resgates</Text>
            {!loja.resgates.length ? (
              <Text style={styles.texto}>Seus resgates aparecerão aqui.</Text>
            ) : null}
            {loja.resgates.map((item) => (
              <View key={item.id} style={styles.historico}>
                <Text style={styles.data}>
                  {new Date(item.resgatadoEm).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.rotulo}>{item.titulo}</Text>
                <Text style={styles.texto}>
                  {item.estado === 'estornado'
                    ? `Estornado · +${item.custo} pontos`
                    : `${item.estado === 'utilizado' ? 'Utilizado' : 'Resgatado'} · ${item.custo} pontos`}
                </Text>
                {item.protecao && item.estado === 'resgatado' ? (
                  <SecondaryButton
                    label="Desfazer resgate da proteção"
                    disabled={enviando}
                    onPress={() =>
                      setConfirmacao({
                        acao: 'desfazer',
                        id: item.id,
                        titulo: 'Desfazer resgate?',
                        mensagem: `${item.custo} pontos serão devolvidos ao seu saldo.`,
                        botao: 'Desfazer resgate',
                      })
                    }
                  />
                ) : null}
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
      <BottomNav
        activeItem="loja"
        onPressMissoes={() => navigation.navigate('MissionList')}
        onPressDiario={() => navigation.navigate('Diario')}
        onPressLoja={() => {}}
        onPressPerfil={() => navigation.navigate('Conta')}
      />
      <Modal
        visible={Boolean(selecao || confirmacao)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!enviando) {
            setSelecao(null);
            setConfirmacao(null);
          }
        }}
      >
        <View style={styles.fundoModal}>
          <View style={styles.modal} accessibilityViewIsModal>
            {confirmacao ? (
              <>
                <Text style={styles.subtitulo}>{confirmacao.titulo}</Text>
                <Text style={styles.texto}>{confirmacao.mensagem}</Text>
                {erro ? (
                  <Text style={styles.erro} accessibilityRole="alert">
                    {erro}
                  </Text>
                ) : null}
                <PrimaryButton
                  label={enviando ? 'Aguarde…' : confirmacao.botao}
                  onPress={confirmar}
                  disabled={enviando}
                  cor={colors.loja}
                  showIcon={false}
                />
                <SecondaryButton
                  label="Cancelar"
                  onPress={() => setConfirmacao(null)}
                  disabled={enviando}
                />
              </>
            ) : selecionada ? (
              <>
                <Text style={styles.subtitulo}>{selecionada.titulo}</Text>
                {selecionada.descricao ? (
                  <Text style={styles.texto}>{selecionada.descricao}</Text>
                ) : null}
                <Text style={styles.rotulo}>Custo: {selecionada.custo} pontos</Text>
                <Text style={styles.texto}>Seu saldo: {loja.saldoPontos} pontos</Text>
                {erro ? (
                  <Text style={styles.erro} accessibilityRole="alert">
                    {erro}
                  </Text>
                ) : null}
                {selecao.protecao || selecionada.estado === 'disponivel' ? (
                  <>
                    <PrimaryButton
                      label="Resgatar recompensa"
                      disabled={!podeResgatar || enviando}
                      onPress={pedirResgate}
                      cor={colors.loja}
                    />
                    {!podeResgatar ? (
                      <Text style={styles.texto}>
                        {selecao.protecao && loja.protecao.quantidade >= loja.protecao.limite
                          ? 'Limite de três proteções atingido.'
                          : 'Saldo insuficiente para este resgate.'}
                      </Text>
                    ) : null}
                    {!selecao.protecao && !selecionada.imutavel ? (
                      <SecondaryButton
                        label="Editar recompensa"
                        disabled={enviando}
                        onPress={() => {
                          setSelecao(null);
                          navigation.navigate('FormularioRecompensa', {
                            recompensaId: selecionada.id,
                          });
                        }}
                      />
                    ) : null}
                  </>
                ) : null}
                {!selecao.protecao && selecionada.estado === 'resgatada' ? (
                  <>
                    <PrimaryButton
                      label="Utilizar recompensa"
                      cor={colors.loja}
                      onPress={() =>
                        setConfirmacao({
                          acao: 'utilizar',
                          id: selecionada.resgateId,
                          titulo: 'Utilizar recompensa?',
                          mensagem:
                            'A utilização é irreversível. Depois de confirmar, não será possível desfazer o resgate nem recuperar os pontos.',
                          botao: 'Confirmar utilização',
                        })
                      }
                    />
                    <SecondaryButton
                      label="Desfazer resgate"
                      onPress={() =>
                        setConfirmacao({
                          acao: 'desfazer',
                          id: selecionada.resgateId,
                          titulo: 'Desfazer resgate?',
                          mensagem: `${selecionada.custo} pontos serão devolvidos ao saldo.`,
                          botao: 'Desfazer resgate',
                        })
                      }
                    />
                  </>
                ) : null}
                {selecionada.estado === 'utilizada' ? (
                  <Text style={styles.texto}>
                    Recompensa utilizada. Esta ação não pode ser desfeita.
                  </Text>
                ) : null}
                <SecondaryButton
                  label="Fechar"
                  disabled={enviando}
                  onPress={() => setSelecao(null)}
                />
              </>
            ) : (
              <SecondaryButton label="Fechar" onPress={() => setSelecao(null)} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.surface },
  conteudo: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    gap: 8,
  },
  titulo: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  adicionar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.loja,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mais: { color: colors.white, fontSize: 32, lineHeight: 36 },
  texto: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  saldo: { minHeight: 96, borderRadius: 16, padding: 16, gap: 8, backgroundColor: colors.loja },
  rotuloSaldo: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.white },
  valorSaldo: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 40, color: colors.white },
  subtitulo: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimaryStrong,
    marginTop: 8,
  },
  rotulo: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textPrimaryStrong },
  erro: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.dangerText },
  aviso: { gap: 12 },
  grupo: { gap: 16 },
  historico: {
    borderWidth: 1,
    borderColor: colors.borderDefaultAlt,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  data: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textMuted },
  fundoModal: { flex: 1, backgroundColor: '#1d153080', justifyContent: 'center', padding: 24 },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    maxHeight: '90%',
  },
});
