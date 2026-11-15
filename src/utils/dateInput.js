const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function maskDateInput(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
}

export function isCompleteDate(text) {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(text);
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function isValidDateString(text) {
  if (!isCompleteDate(text)) return false;

  const [day, month, year] = text.split('/').map(Number);
  if (month < 1 || month > 12) return false;

  const maxDay = month === 2 && !isLeapYear(year) ? 28 : DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > maxDay) return false;

  return true;
}

/** Converte "dd/mm/aaaa" (formato de exibição) para "aaaa-mm-dd" (formato da API). */
export function paraDataIso(dataBr) {
  const [day, month, year] = dataBr.split('/');
  return `${year}-${month}-${day}`;
}

/** Converte "aaaa-mm-dd" (formato da API) para "dd/mm/aaaa" (formato de exibição). */
export function deDataIso(dataIso) {
  if (!dataIso) return null;
  const [year, month, day] = dataIso.split('-');
  return `${day}/${month}/${year}`;
}

/** Verifica se "dd/mm/aaaa" já passou em relação a hoje (ou à data de referência, em teste). */
export function isDataLimiteVencida(dataBr, referenceDate = new Date()) {
  if (!dataBr) return false;

  const [day, month, year] = dataBr.split('/').map(Number);
  const limite = new Date(year, month - 1, day);
  limite.setHours(0, 0, 0, 0);

  const hoje = new Date(referenceDate);
  hoje.setHours(0, 0, 0, 0);

  return limite < hoje;
}

export function formatDateDaysFromNow(days, referenceDate = new Date()) {
  const target = new Date(referenceDate);
  target.setDate(target.getDate() + days);

  const day = String(target.getDate()).padStart(2, '0');
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const year = target.getFullYear();

  return `${day}/${month}/${year}`;
}
