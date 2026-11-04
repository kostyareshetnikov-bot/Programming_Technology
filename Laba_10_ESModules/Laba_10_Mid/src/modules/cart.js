// Логика корзины. Корзина — массив { id, qty }. Функции не меняют исходный массив.
export const MAX_QTY = 99;

export function addItem(cart, id) {
  const item = cart.find((i) => i.id === id);
  if (!item) return { cart: [...cart, { id, qty: 1 }] };
  if (item.qty >= MAX_QTY) return { cart, error: `Максимум ${MAX_QTY} шт. одного товара` };
  return { cart: cart.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) };
}

export function changeQty(cart, id, delta) {
  const res = cart
    .map((i) => (i.id === id ? { ...i, qty: Math.min(MAX_QTY, i.qty + delta) } : i))
    .filter((i) => i.qty > 0);
  return res;
}

export function removeItem(cart, id) {
  return cart.filter((i) => i.id !== id);
}

export function calculateTotal(cart, getProduct) {
  return cart.reduce((sum, i) => sum + getProduct(i.id).price * i.qty, 0);
}
