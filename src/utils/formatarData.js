export function formatarDataCurta(dataIso) {
  const partes = dataIso?.split('-');

  if (partes?.length !== 3 || partes.some((parte) => !/^\d+$/.test(parte))) {
    return '';
  }

  const [ano, mes, dia] = partes;

  if (ano.length !== 4 || mes.length !== 2 || dia.length !== 2) {
    return '';
  }

  return `${dia}/${mes}`;
}

export function obterDataLocal(data = new Date()) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
