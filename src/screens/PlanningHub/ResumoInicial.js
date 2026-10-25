import { CartaoProximoAjuste } from '../../components/Analise/CartaoProximoAjuste';
import { useRelatorioSemanal } from '../../hooks/useRelatorioSemanal';

export function ResumoInicial({ onVerSemana }) {
  const { dados, carregando } = useRelatorioSemanal();
  return <CartaoProximoAjuste dados={dados} carregando={carregando} onVerSemana={onVerSemana} />;
}
