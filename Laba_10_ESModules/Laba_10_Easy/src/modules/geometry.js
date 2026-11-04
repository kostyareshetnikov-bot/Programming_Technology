// Чистая вычислительная логика: без DOM.
export function rectArea(w, h) {
  return w * h;
}
export function rectPerimeter(w, h) {
  return 2 * (w + h);
}
export function circleArea(r) {
  return Math.PI * r ** 2;
}
export function circlePerimeter(r) {
  return 2 * Math.PI * r;
}
