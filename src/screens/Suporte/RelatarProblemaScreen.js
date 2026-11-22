import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';

import { PrimaryButton, SecondaryButton } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { criarChaveEnvio } from '../../services/suporte';
import { colors } from '../../theme/colors';
import { AvisoSuporte, TelaSuporte, estilos, useServicoSuporte } from './SuporteUI';

export function RelatarProblemaScreen({ navigation }) {
  const servico = useServicoSuporte();
  const [assunto, setAssunto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(false);
  const ocupado = useRef(false);
  const tentativa = useRef(null);
  const preenchido = Boolean(assunto.trim() && descricao.trim());

  async function enviar() {
    if (ocupado.current || !preenchido) return;
    const conteudo = { assunto: assunto.trim(), descricao: descricao.trim() };
    if (
      tentativa.current?.assunto !== conteudo.assunto ||
      tentativa.current?.descricao !== conteudo.descricao
    ) {
      tentativa.current = { ...conteudo, chaveEnvio: criarChaveEnvio() };
    }

    ocupado.current = true;
    setEnviando(true);
    setErro(false);
    try {
      const relato = await servico.enviar(tentativa.current);
      if (navigation.isFocused()) {
        navigation.replace('RelatoEnviado', { id: relato.id, protocolo: relato.protocolo });
      }
    } catch {
      setErro(true);
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }

  return (
    <TelaSuporte
      navigation={navigation}
      titulo="Relatar problema"
      centralizarTitulo
      rodape={
        <PrimaryButton
          label={enviando ? 'Enviando…' : erro ? 'Tentar novamente' : 'Enviar relato'}
          disabled={!preenchido || enviando}
          onPress={enviar}
          showIcon={false}
        />
      }
    >
      {erro ? (
        <AvisoSuporte titulo="Não foi possível confirmar o envio">
          Seu texto foi mantido. Tente novamente.
        </AvisoSuporte>
      ) : null}
      <InputField
        label="Assunto"
        value={assunto}
        onChangeText={setAssunto}
        editable={!enviando}
        maxLength={100}
        placeholder="Ex.: Diário não abre"
      />
      <InputField
        label="O que aconteceu?"
        value={descricao}
        onChangeText={setDescricao}
        editable={!enviando}
        maxLength={2000}
        multiline
        placeholder="Ex.: Toquei em uma entrada do Diário e a tela ficou carregando."
      />
      <Text style={estilos.nota}>Evite incluir senhas ou dados pessoais.</Text>
    </TelaSuporte>
  );
}

export function RelatoEnviadoScreen({ navigation, route }) {
  const { id, protocolo } = route.params;

  function acompanhar() {
    navigation.dispatch((estado) => {
      const rotas = estado.routes.slice(0, estado.index);
      if (rotas.at(-1)?.name !== 'MeusRelatos') rotas.push({ name: 'MeusRelatos' });
      return CommonActions.reset({
        routes: [...rotas, { name: 'DetalheRelato', params: { id } }],
        index: rotas.length,
      });
    });
  }

  return (
    <TelaSuporte
      navigation={navigation}
      rodape={
        <>
          <PrimaryButton label="Acompanhar relato" showIcon={false} onPress={acompanhar} />
          <SecondaryButton
            label="Voltar ao perfil"
            onPress={() => navigation.popTo('AreaPrincipal')}
          />
        </>
      }
    >
      <View style={estilosEnvio.confirmacao}>
        <View style={estilosEnvio.icone} accessible={false}>
          <View style={estilosEnvio.marca} />
        </View>
        <Text accessibilityRole="header" style={estilos.titulo}>
          Relato enviado
        </Text>
        <Text style={estilos.texto}>Veja o andamento em Meus relatos.</Text>
        <View style={estilosEnvio.protocolo}>
          <Text style={estilos.nota}>Protocolo</Text>
          <Text style={estilos.acao}>{protocolo}</Text>
        </View>
      </View>
    </TelaSuporte>
  );
}

const estilosEnvio = StyleSheet.create({
  confirmacao: { flex: 1, minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: 16 },
  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marca: {
    width: 18,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.brand,
    transform: [{ rotate: '-45deg' }],
  },
  protocolo: {
    alignItems: 'center',
    gap: 4,
    minWidth: 180,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.softPurple,
  },
});
