// Catálogo fixo do RF-03.1 (icarus-context, docs/product-specification/04-requisitos.md) — os
// ids já são os valores de fio da API (AreaDaVida, camelCase), sem tradução necessária.
export const AREA_DA_VIDA_OPTIONS = [
  { id: 'corpoESaude', titulo: 'Corpo e saúde' },
  { id: 'sonoERecuperacao', titulo: 'Sono e recuperação' },
  { id: 'menteEEmocoes', titulo: 'Mente e emoções' },
  { id: 'estudosEAprendizado', titulo: 'Estudos e aprendizado' },
  { id: 'trabalhoECarreira', titulo: 'Trabalho e carreira' },
  { id: 'financas', titulo: 'Finanças' },
  { id: 'relacionamentosEComunidade', titulo: 'Relacionamentos e comunidade' },
  { id: 'casaEVidaPratica', titulo: 'Casa e vida prática' },
  { id: 'lazerECriatividade', titulo: 'Lazer e criatividade' },
  { id: 'propositoEEspiritualidade', titulo: 'Propósito e espiritualidade' },
];

export function labelDaAreaDaVida(areaDaVidaId) {
  return AREA_DA_VIDA_OPTIONS.find((area) => area.id === areaDaVidaId)?.titulo ?? null;
}
