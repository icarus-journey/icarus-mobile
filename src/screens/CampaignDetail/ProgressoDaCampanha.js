import { CartaoProgressoCampanha } from '../../components/CartaoProgressoCampanha';
import { useSessao } from '../../state/SessaoContext';
import { useProgressoCampanha } from './useProgressoCampanha';

export function ProgressoDaCampanha(props) {
  const { sessao, requisitarAutenticado } = useSessao();
  return (
    <DadosDoProgresso
      key={`${sessao?.usuarioId}:${props.campanhaId}`}
      {...props}
      usuarioId={sessao?.usuarioId}
      requisitarAutenticado={requisitarAutenticado}
    />
  );
}

function DadosDoProgresso({
  usuarioId,
  campanhaId,
  campanha,
  requisitarAutenticado,
  aoAtualizar,
  aoDefinirMeta,
  aoConcluir,
  concluindo,
}) {
  const progresso = useProgressoCampanha({
    usuarioId,
    campanhaId,
    requisitarAutenticado,
    aoAtualizar,
  });
  return (
    <CartaoProgressoCampanha
      progresso={progresso}
      campanha={campanha}
      aoDefinirMeta={aoDefinirMeta}
      aoConcluir={aoConcluir}
      concluindo={concluindo}
    />
  );
}
