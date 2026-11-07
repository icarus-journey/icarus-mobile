import { CartaoProximoAjuste } from '../../components/Analise/CartaoProximoAjuste';

export function ResumoInicial({ dados, carregando, onVerSemana }) {
  return <CartaoProximoAjuste dados={dados} carregando={carregando} onVerSemana={onVerSemana} />;
}
