// Данные: каталог товаров.
const products = [
  { id: 1, name: "Ноутбук", price: 350000 },
  { id: 2, name: "Мышь", price: 8500 },
  { id: 3, name: "Клавиатура", price: 15000 },
  { id: 4, name: "Монитор", price: 95000 },
];
export default products; // default export
export function getProduct(id) {
  return products.find((p) => p.id === id);
}
