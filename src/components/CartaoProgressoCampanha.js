import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from './Button';
import { DetailProgressCard } from './DetailProgressCard';
import { InputField } from './InputField';
import { EvolucaoDaMeta } from './Analise/EvolucaoDaMeta';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { formatarValorProgresso } from '../utils/valorProgresso';

function dataDoRegistro(registro) {
  try {
    return new Date(registro.registradaEm).toLocaleString('pt-BR', {
      ...(registro.fusoHorario ? { timeZone: registro.fusoHorario } : {}),
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date(registro.registradaEm).toLocaleString('pt-BR');
  }
}

export function CartaoProgressoCampanha({
  progresso,
  campanha,
  aoDefinirMeta,
  aoConcluir,
  concluindo,
}) {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const { dados, carregando, enviando, editando, valor, erro, sucesso } = progresso;
  const meta = campanha ?? dados;
  const medicoes = dados?.medicoes ?? [];
  return (
    <View style={styles.container}>
      {meta?.valorMensurado > 0 ? (
        <DetailProgressCard
          title="Sua meta"
          subtitle={`${formatarValorProgresso(meta.valorAtual)} de ${formatarValorProgresso(meta.valorMensurado)} ${meta.unidade ?? 'unidade não informada'}`}
          current={meta.valorAtual}
          total={meta.valorMensurado}
        />
      ) : !carregando && dados ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>Qual resultado você quer alcançar?</Text>
          <Text style={styles.texto}>
            Defina uma quantidade e uma unidade para acompanhar sua meta.
          </Text>
          {dados.estado !== 'concluida' && dados.estado !== 'excluida' ? (
            <SecondaryButton label="Definir minha meta" onPress={aoDefinirMeta} />
          ) : null}
        </View>
      ) : null}

      {carregando ? (
        <View style={styles.carregamento}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.texto}>Carregando seu progresso…</Text>
        </View>
      ) : null}
      {erro ? (
        <Text style={styles.erro} accessibilityRole="alert">
          {erro}
        </Text>
      ) : null}
      {sucesso ? (
        <Text style={styles.sucesso} accessibilityLiveRegion="polite">
          {sucesso}
        </Text>
      ) : null}

      {dados?.evolucao &&
      !['meta_nao_definida', 'unidade_sem_resultado_mensurado'].includes(dados.evolucao.estado) &&
      !carregando &&
      !erro ? (
        <View style={styles.card}>
          <EvolucaoDaMeta dados={dados} />
        </View>
      ) : null}

      {dados?.podeRegistrar && !carregando ? (
        editando ? (
          <View style={styles.card}>
            <InputField
              label="Quanto você já alcançou?"
              value={valor}
              onChangeText={progresso.alterarValor}
              keyboardType="decimal-pad"
              maxLength={13}
              editable={!enviando}
              placeholder="Ex.: 5"
              helper={`Total acumulado em ${dados.unidade}, não apenas o avanço de hoje.`}
            />
            <PrimaryButton
              label={enviando ? 'Salvando progresso…' : 'Salvar progresso'}
              onPress={progresso.registrar}
              disabled={enviando}
              showIcon={false}
            />
            <SecondaryButton
              label="Cancelar registro"
              onPress={progresso.cancelar}
              disabled={enviando}
            />
          </View>
        ) : (
          <PrimaryButton
            label="Registrar progresso"
            onPress={progresso.abrirRegistro}
            showIcon={false}
          />
        )
      ) : null}

      {dados?.metaAlcancada && dados.estado !== 'concluida' ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>Meta alcançada!</Text>
          <Text style={styles.texto}>Deseja concluir esta campanha?</Text>
          <SecondaryButton
            label="Concluir esta meta"
            onPress={aoConcluir}
            disabled={concluindo || enviando || carregando}
          />
        </View>
      ) : null}

      {dados ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>Seu caminho até aqui</Text>
          {!medicoes.length ? (
            <Text style={styles.texto}>
              Seu histórico começa no primeiro registro de progresso.
            </Text>
          ) : (
            (mostrarTodos ? medicoes : []).map((registro) => (
              <View key={registro.id} style={styles.registro}>
                <Text style={styles.data}>{dataDoRegistro(registro)}</Text>
                <Text style={styles.valor}>
                  {formatarValorProgresso(registro.valorAtual)} de{' '}
                  {formatarValorProgresso(registro.valorMensurado)} {registro.unidade}
                </Text>
                {registro.valorAnterior != null && registro.valorAtual < registro.valorAnterior ? (
                  <Text style={styles.texto}>Valor revisado</Text>
                ) : null}
              </View>
            ))
          )}
          {medicoes.length ? (
            <SecondaryButton
              label={mostrarTodos ? 'Ocultar registros' : 'Ver registros da meta'}
              onPress={() => setMostrarTodos(!mostrarTodos)}
            />
          ) : null}
        </View>
      ) : null}
      {!enviando ? (
        <SecondaryButton
          label="Atualizar histórico da meta"
          onPress={progresso.recarregar}
          disabled={carregando}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    backgroundColor: colors.surface,
  },
  titulo: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.label,
    color: colors.textPrimaryStrong,
  },
  texto: { fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.textSecondary },
  registro: {
    gap: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
  },
  data: { fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.textSecondary },
  valor: { fontFamily: fontFamily.semiBold, fontSize: fontSize.label, color: colors.brand },
  erro: { fontFamily: fontFamily.regular, fontSize: fontSize.base, color: colors.dangerText },
  sucesso: { fontFamily: fontFamily.semiBold, fontSize: fontSize.base, color: colors.success },
  carregamento: { alignItems: 'center', padding: 12, gap: 10 },
});
