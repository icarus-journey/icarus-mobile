export function formularioDoPerfil(perfil) {
  return {
    estuda: perfil.estuda ?? null,
    cargaHorariaEstudoSemanal: formatarCarga(perfil.cargaHorariaEstudoSemanal),
    trabalha: perfil.trabalha ?? null,
    cargaHorariaTrabalhoSemanal: formatarCarga(perfil.cargaHorariaTrabalhoSemanal),
  };
}

function formatarCarga(valor) {
  return valor == null ? '' : String(valor).replace('.', ',');
}

export function validarPerfil(formulario) {
  const erros = {};
  const dados = { estuda: formulario.estuda, trabalha: formulario.trabalha };
  for (const [situacao, campo] of [
    ['estuda', 'cargaHorariaEstudoSemanal'],
    ['trabalha', 'cargaHorariaTrabalhoSemanal'],
  ]) {
    const valor = formulario[campo].trim().replace(',', '.');
    dados[campo] = formulario[situacao] === true && valor ? Number(valor) : null;
    if (
      formulario[situacao] === true &&
      valor &&
      (!/^\d+(\.\d{1,2})?$/.test(valor) || Number(valor) > 168)
    ) {
      erros[campo] = 'Informe de 0 a 168 horas, com até duas casas decimais.';
    }
  }
  return { erros, dados };
}
