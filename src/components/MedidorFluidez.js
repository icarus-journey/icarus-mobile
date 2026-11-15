import { Profiler } from 'react';

import { medicaoFluidezAtiva, medirRenderizacao } from '../utils/medirFluidez';

export function MedidorFluidez({ children }) {
  return medicaoFluidezAtiva ? (
    <Profiler id="navegacao" onRender={medirRenderizacao}>
      {children}
    </Profiler>
  ) : (
    children
  );
}
