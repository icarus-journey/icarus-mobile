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
