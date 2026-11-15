export function lerValorProgresso(texto) {
  const valor = String(texto ?? '').trim();
  if (!/^\d{1,10}([,.]\d{1,2})?$/.test(valor)) return null;
  const numero = Number(valor.replace(',', '.'));
  return Number.isFinite(numero) && numero <= 9999999999.99 ? numero : null;
}

export function formatarValorProgresso(valor) {
  if (valor == null) return 'Não informado';
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}
