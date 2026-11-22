const caminho = '/api/suporte/relatos';

export function criarChaveEnvio() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    [
      Date.now().toString(36),
      Math.random().toString(36).slice(2),
      Math.random().toString(36).slice(2),
    ].join('-')
  );
}

export function criarServicoSuporte(requisitarAutenticado) {
  return {
    enviar: (corpo) => requisitarAutenticado(caminho, { metodo: 'POST', corpo }),
    listar: (signal) => requisitarAutenticado(caminho, { signal }),
    consultar: (id, signal) => requisitarAutenticado(`${caminho}/${id}`, { signal }),
  };
}
