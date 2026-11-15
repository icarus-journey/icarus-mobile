import { useEffect, useMemo, useState } from 'react';
import { criarServicoHistoricoRelatorios } from '../services/historicoRelatorios';
import { useSessao } from '../state/SessaoContext';
export function useRelatorioSalvo(id) {
  const { sessao, requisitarAutenticado } = useSessao();
  const servico = useMemo(
    () => criarServicoHistoricoRelatorios({ usuarioId: sessao?.usuarioId, requisitarAutenticado }),
    [sessao?.usuarioId, requisitarAutenticado],
  );
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState({
    dados: null,
    carregando: true,
    erro: '',
    expirada: false,
  });
  useEffect(() => {
    let atual = true;
    servico
      .consultar(id)
      .then((dados) => {
        if (atual) setEstado({ dados, carregando: false, erro: '', expirada: false });
      })
      .catch((e) => {
        if (atual)
          setEstado({
            dados: null,
            carregando: false,
            erro:
              e.status === 401
                ? 'Sua sessão terminou. Entre novamente.'
                : 'Não foi possível abrir este relatório.',
            expirada: e.status === 401,
          });
      });
    return () => {
      atual = false;
    };
  }, [id, servico, tentativa]);
  return {
    ...estado,
    repetir: () => {
      setEstado({ dados: null, carregando: true, erro: '', expirada: false });
      setTentativa((v) => v + 1);
    },
  };
}
