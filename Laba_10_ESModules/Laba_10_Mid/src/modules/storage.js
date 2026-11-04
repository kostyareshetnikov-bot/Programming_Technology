// Творческий модуль: сохранение корзины в localStorage.
const KEY = "lab10_cart";
export function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
export function saveCart(cart) {
  try {
    localStorage.setItem(KEY, JSON.stringify(cart));
  } catch {
    /* хранилище недоступно — работаем без сохранения */
  }
}
