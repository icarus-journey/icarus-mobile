import { useEffect, useState } from 'react';

import { consultarMissao } from '../services/missoes';
import { useSessao } from '../state/SessaoContext';

export function useConfiguracaoMissao(missaoId, necessaria) {
  const { sessao, requisitarAutenticado } = useSessao();
  const [tentativa, setTentativa] = useState(0);
  const chave = `${sessao?.usuarioId}:${missaoId}`;
  const [estado, setEstado] = useState({ chave, carregando: true, dados: null, erro: '' });

  useEffect(() => {
    if (!necessaria) return;
    let ativa = true;
    consultarMissao({ usuarioId: sessao.usuarioId, missaoId, requisitarAutenticado })
      .then((dados) => {
        if (ativa) setEstado({ chave, carregando: false, dados, erro: '' });
      })
      .catch((erro) => {
        if (ativa)
          setEstado({
            chave,
            carregando: false,
            dados: null,
            erro:
              erro.status === 404
                ? 'Esta missão não está mais disponível.'
                : 'Não foi possível carregar a missão.',
          });
      });
    return () => {
      ativa = false;
    };
  }, [necessaria, sessao.usuarioId, missaoId, requisitarAutenticado, tentativa, chave]);

  function tentarNovamente() {
    setEstado({ chave, carregando: true, dados: null, erro: '' });
    setTentativa((atual) => atual + 1);
  }

  return {
    ...(estado.chave === chave ? estado : { carregando: true, dados: null, erro: '' }),
    tentarNovamente,
  };
}
