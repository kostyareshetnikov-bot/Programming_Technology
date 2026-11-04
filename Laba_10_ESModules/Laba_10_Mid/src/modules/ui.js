// Только работа с DOM.
import { formatPrice } from "./format.js";

function button(text, action, id) {
  const b = document.createElement("button");
  b.textContent = text;
  b.dataset.action = action;
  b.dataset.id = id;
  return b;
}

export function renderCatalog(el, products) {
  el.replaceChildren(
    ...products.map((p) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${p.name} — ${formatPrice(p.price)}`;
      li.append(label, button("В корзину", "add", p.id));
      return li;
    })
  );
}

export function renderCart(el, cart, getProduct) {
  if (cart.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Корзина пуста";
    el.replaceChildren(li);
    return;
  }
  el.replaceChildren(
    ...cart.map((i) => {
      const p = getProduct(i.id);
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${p.name} × ${i.qty} = ${formatPrice(p.price * i.qty)}`;
      const controls = document.createElement("span");
      controls.append(button("−", "dec", i.id), button("+", "inc", i.id), button("Удалить", "remove", i.id));
      li.append(label, controls);
      return li;
    })
  );
}

export function renderTotal(el, total) {
  el.textContent = `Итого: ${formatPrice(total)}`;
}

export function showMessage(el, text, isError = true) {
  el.textContent = text;
  el.className = isError ? "error" : "ok";
}
