// Творческий модуль: форматирование чисел.
export function formatNumber(n) {
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}
