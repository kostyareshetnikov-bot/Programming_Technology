import { rectArea, rectPerimeter, circleArea, circlePerimeter } from "./modules/geometry.js";
import { parsePositive } from "./modules/validators.js";
import { formatNumber } from "./modules/format.js";

const $ = (s) => document.querySelector(s);

function show(el, text, isError) {
  el.textContent = text;
  el.className = isError ? "error" : "ok";
}

function readAll(fields) {
  const values = [];
  for (const [selector, name] of fields) {
    const res = parsePositive($(selector).value, name);
    if (!res.ok) return res;
    values.push(res.value);
  }
  return { ok: true, values };
}

$("#calc-rect").addEventListener("click", () => {
  const res = readAll([["#w", "Ширина"], ["#h", "Высота"]]);
  const out = $("#rect-result");
  if (!res.ok) return show(out, res.error, true);
  const [w, h] = res.values;
  show(out, `Площадь: ${formatNumber(rectArea(w, h))}; периметр: ${formatNumber(rectPerimeter(w, h))}`);
});

$("#calc-circle").addEventListener("click", () => {
  const res = readAll([["#r", "Радиус"]]);
  const out = $("#circle-result");
  if (!res.ok) return show(out, res.error, true);
  const [r] = res.values;
  show(out, `Площадь: ${formatNumber(circleArea(r))}; длина окружности: ${formatNumber(circlePerimeter(r))}`);
});

$("#reset").addEventListener("click", () => {
  document.querySelectorAll("input").forEach((i) => (i.value = ""));
  show($("#rect-result"), "");
  show($("#circle-result"), "");
});
