export const medicaoFluidezAtiva =
  typeof __DEV__ !== 'undefined' && __DEV__ && process.env.EXPO_PUBLIC_MEDIR_FLUIDEZ === '1';

function registrar(medicao) {
  if (!medicaoFluidezAtiva) return;
  console.info('[Icarus fluidez]', JSON.stringify(medicao));
}

export function iniciarMedicaoHttp(caminho, metodo) {
  if (!medicaoFluidezAtiva) return () => {};
  const inicio = performance.now();
  const rota = caminho
    .split('?')[0]
    .replace(/\/usuarios\/[^/]+/, '/usuarios/:usuario')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
  return (status, cancelada) =>
    registrar({
      tipo: 'http',
      rota,
      metodo,
      status,
      cancelada,
      duracaoMs: Math.round(performance.now() - inicio),
    });
}

export function medirRenderizacao(tela, fase, duracaoMs) {
  registrar({ tipo: 'renderizacao', tela, fase, duracaoMs: Math.round(duracaoMs * 100) / 100 });
}
