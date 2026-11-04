import products, { getProduct } from "./modules/products.js";
import { addItem, changeQty, removeItem, calculateTotal } from "./modules/cart.js";
import { loadCart, saveCart } from "./modules/storage.js";
import { renderCatalog, renderCart, renderTotal, showMessage } from "./modules/ui.js";

const $ = (s) => document.querySelector(s);
let cart = loadCart().filter((i) => getProduct(i.id)); // отбрасываем неизвестные товары

function refresh() {
  renderCart($("#cart"), cart, getProduct);
  renderTotal($("#total"), calculateTotal(cart, getProduct));
  saveCart(cart);
}

function onClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  showMessage($("#message"), "");
  switch (btn.dataset.action) {
    case "add": {
      const res = addItem(cart, id);
      cart = res.cart;
      if (res.error) showMessage($("#message"), res.error);
      break;
    }
    case "inc": cart = changeQty(cart, id, 1); break;
    case "dec": cart = changeQty(cart, id, -1); break;
    case "remove": cart = removeItem(cart, id); break;
  }
  refresh();
}

renderCatalog($("#catalog"), products);
$("#catalog").addEventListener("click", onClick);
$("#cart").addEventListener("click", onClick);
$("#clear").addEventListener("click", () => {
  cart = [];
  showMessage($("#message"), "Корзина очищена", false);
  refresh();
});
refresh();
