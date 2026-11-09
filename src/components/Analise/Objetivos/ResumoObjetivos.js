import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PickerModal } from '../../PickerModal';
import { MetaEmFoco } from '../MetaEmFoco';
import { DadosResultadoObjetivo } from './DadosResultadoObjetivo';
import { IconeAnalise } from '../IconeAnalise';
import { estilosPainel as estilos } from '../estilosPainel';

const estados = { planejada: 'Planejada', emAndamento: 'Em andamento', concluida: 'Concluída' };
const tituloDaCampanha = (c) =>
  c.estado === 'emAndamento' ? c.titulo : `${c.titulo} · ${estados[c.estado]}`;

export function ResumoObjetivos({
  dados,
  periodo,
  campanhaSelecionadaId = null,
  aoSelecionarCampanha,
  aoAbrirCampanha,
  aoVerMeta,
  erroAbertura,
  abrindo,
}) {
  const [seletorAberto, setSeletorAberto] = useState(false);
  if (!dados?.campanhas?.length) return null;
  // A API escolhe a entrada automática; a pessoa pode trocar somente a visualização.
  const campanha =
    dados.campanhas.find((c) => c.id === campanhaSelecionadaId) ??
    dados.campanhas.find((c) => c.id === dados.campanhaEmDestaqueId);
  const meta = campanha?.resultado;
  const mensurada = meta?.valorAtual != null && meta.valorMensurado > 0 && meta.unidade;
  return (
    <View style={estilos.secao}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escolher campanha do progresso"
        accessibilityState={{ expanded: seletorAberto }}
        accessibilityValue={{
          text: campanha ? tituloDaCampanha(campanha) : 'Escolha uma campanha',
        }}
        onPress={() => setSeletorAberto(true)}
        style={[estilos.cartao, estilos.entre]}
      >
        <View style={estilos.textoFlexivel}>
          <Text style={estilos.pequeno}>Campanha em foco</Text>
          <Text style={estilos.marca}>
            {campanha ? tituloDaCampanha(campanha) : 'Escolha uma campanha'}
          </Text>
        </View>
        <IconeAnalise nome="chevron" tamanho={20} />
      </Pressable>
      {erroAbertura ? (
        <Text style={estilos.erro} accessibilityRole="alert">
          {erroAbertura}
        </Text>
      ) : null}
      {campanha ? (
        mensurada ? (
          <MetaEmFoco
            titulo="Sua meta em foco"
            estadosPermitidos={['planejada', 'emAndamento', 'concluida']}
            campanhas={[
              {
                id: campanha.id,
                titulo: campanha.titulo,
                estado: campanha.estado,
                valorAtual: meta.valorAtual,
                valorMensurado: meta.valorMensurado,
                unidade: meta.unidade,
                areaDaVida: campanha.areaDaVida,
              },
            ]}
            onAbrir={aoVerMeta ?? aoAbrirCampanha}
            renderEvolucao={() => (
              <DadosResultadoObjetivo campanha={campanha} periodo={periodo} compacto />
            )}
          />
        ) : (
          <View style={estilos.cartao}>
            <Text style={estilos.rotulo}>Sua meta em foco</Text>
            <Text style={estilos.titulo}>{campanha.titulo}</Text>
            <Text style={estilos.texto}>
              Esta campanha ainda não tem um resultado mensurado para exibir.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ver campanha: ${campanha.titulo}`}
              style={estilos.botaoTexto}
              onPress={() => aoAbrirCampanha(campanha.id)}
              disabled={abrindo}
            >
              <Text style={estilos.marca}>Ver campanha</Text>
              <IconeAnalise nome="seta" tamanho={18} />
            </Pressable>
          </View>
        )
      ) : (
        <Text style={estilos.texto}>Escolha a campanha que você quer acompanhar.</Text>
      )}
      <PickerModal
        visible={seletorAberto}
        title="Escolha uma campanha"
        items={dados.campanhas.map((c) => ({ id: String(c.id), titulo: tituloDaCampanha(c) }))}
        onClose={() => setSeletorAberto(false)}
        onSelect={(item) => {
          aoSelecionarCampanha(Number(item.id));
          setSeletorAberto(false);
        }}
      />
    </View>
  );
}
