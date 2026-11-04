// Проверка ввода. Возвращает { ok, value } или { ok: false, error }.
export function parsePositive(raw, name) {
  const text = String(raw).trim().replace(",", ".");
  if (text === "") return { ok: false, error: `Поле «${name}» пустое` };
  const n = Number(text);
  if (!Number.isFinite(n)) return { ok: false, error: `«${name}»: введите число` };
  if (n <= 0) return { ok: false, error: `«${name}» должно быть больше нуля` };
  return { ok: true, value: n };
}
