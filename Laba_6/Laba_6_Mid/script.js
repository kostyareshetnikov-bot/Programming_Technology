
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("gradesBody");
  const classAvgCell = document.getElementById("classAvg");
  const errorMsg = document.getElementById("tableError");

  if (!tableBody) return;

  const MIN_GRADE = 0;
  const MAX_GRADE = 100;

  function showError(show) {
    errorMsg.hidden = !show;
  }

  // Пересчёт среднего балла одной строки (ученика)
  function updateRowAverage(row) {
    const cells = row.querySelectorAll(".grade-cell");
    const values = Array.from(cells).map((cell) => parseFloat(cell.dataset.value));
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = values.length ? sum / values.length : 0;

    const avgCell = row.querySelector(".avg-cell");
    avgCell.textContent = avg.toFixed(1);

    avgCell.classList.remove("avg-cell--low", "avg-cell--mid", "avg-cell--high");
    if (avg < 60) avgCell.classList.add("avg-cell--low");
    else if (avg < 80) avgCell.classList.add("avg-cell--mid");
    else avgCell.classList.add("avg-cell--high");
  }

  function updateClassAverage() {
    const rows = tableBody.querySelectorAll("tr");
    let total = 0;
    rows.forEach((row) => {
      const cells = row.querySelectorAll(".grade-cell");
      const values = Array.from(cells).map((cell) => parseFloat(cell.dataset.value));
      total += values.reduce((acc, v) => acc + v, 0) / values.length;
    });
    const classAvg = rows.length ? total / rows.length : 0;
    classAvgCell.textContent = classAvg.toFixed(1);
  }

  function recalcAll() {
    tableBody.querySelectorAll("tr").forEach(updateRowAverage);
    updateClassAverage();
  }

  function enterEditMode(cell) {
    if (cell.isContentEditable) return;
    cell.contentEditable = "true";
    cell.classList.add("editing");
    cell.textContent = cell.dataset.value;
    cell.focus();
    const range = document.createRange();
    range.selectNodeContents(cell);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function exitEditMode(cell) {
    const raw = cell.textContent.trim().replace(",", ".");
    const num = parseFloat(raw);

    const isValid = raw !== "" && !isNaN(num) && num >= MIN_GRADE && num <= MAX_GRADE;

    if (isValid) {
      cell.dataset.value = num;
      cell.textContent = num;
      showError(false);
    } else {
      cell.textContent = cell.dataset.value;
      showError(true);
    }

    cell.contentEditable = "false";
    cell.classList.remove("editing");

    const row = cell.closest("tr");
    updateRowAverage(row);
    updateClassAverage();
  }

  tableBody.addEventListener("click", (event) => {
    const cell = event.target.closest(".grade-cell");
    if (!cell) return;
    enterEditMode(cell);
  });

  tableBody.addEventListener(
    "blur",
    (event) => {
      const cell = event.target.closest(".grade-cell");
      if (!cell || !cell.isContentEditable) return;
      exitEditMode(cell);
    },
    true
  );

  tableBody.addEventListener("keydown", (event) => {
    const cell = event.target.closest(".grade-cell");
    if (!cell || !cell.isContentEditable) return;

    if (event.key === "Enter") {
      event.preventDefault();
      cell.blur();
    }
    if (event.key === "Escape") {
      cell.textContent = cell.dataset.value;
      cell.blur();
    }
  });

  recalcAll();
});