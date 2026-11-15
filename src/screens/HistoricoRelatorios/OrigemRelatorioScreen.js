import { useSessao } from '../../state/SessaoContext';
import { useRelatorioSalvo } from '../../hooks/useRelatorioSalvo';
import { PaginaRelatorio } from './PaginaRelatorio';
import { EstadoRelatorio } from './EstadoRelatorio';
import { InformacoesRelatorio } from './InformacoesRelatorio';
export function OrigemRelatorioScreen(props) {
  const { sessao } = useSessao();
  return (
    <OrigemDaSessao
      key={`${sessao?.usuarioId}:${props.route.params.relatorioId}:${props.configuracao}`}
      {...props}
    />
  );
}
function OrigemDaSessao({ route, navigation, configuracao = false }) {
  const id = route.params.relatorioId,
    estado = useRelatorioSalvo(id);
  return (
    <PaginaRelatorio
      titulo={configuracao ? 'Sobre a IA' : 'Como foi feito'}
      aoVoltar={() => navigation.goBack()}
    >
      <EstadoRelatorio estado={estado} />
      {estado.dados ? (
        <InformacoesRelatorio
          dados={estado.dados}
          configuracao={configuracao}
          aoVoltar={() => navigation.goBack()}
          aoVerIA={() => navigation.navigate('ConfiguracaoRelatorioScreen', { relatorioId: id })}
        />
      ) : null}
    </PaginaRelatorio>
  );
}
