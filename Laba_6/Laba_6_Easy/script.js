const noteInput   = document.querySelector("#noteInput");
const addBtn      = document.querySelector("#addBtn");
const notesList   = document.querySelector("#notesList");
const errorMsg    = document.querySelector("#error");
const emptyMsg    = document.querySelector("#emptyMsg");
const counter     = document.querySelector("#counter");
const searchInput = document.querySelector("#searchInput");

function createNote(text) {
  const item = document.createElement("li");
  item.className = "note";
  item.dataset.text = text;                 

  const body = document.createElement("div");
  body.className = "note__body";

  const p = document.createElement("p");
  p.className = "note__text";
  p.textContent = text;                     

  const time = document.createElement("span");
  time.className = "note__time";
  time.textContent = new Date().toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "note__delete";
  delBtn.textContent = "Удалить";
  delBtn.setAttribute("aria-label", "Удалить заметку");

  body.append(p, time);
  item.append(body, delBtn);
  return item;
}

function addNote() {
  const text = noteInput.value.trim();

  if (text === "") {                        
    errorMsg.hidden = false;
    noteInput.classList.add("invalid");
    noteInput.focus();
    return;
  }

  notesList.prepend(createNote(text));      
  noteInput.value = "";
  errorMsg.hidden = true;
  noteInput.classList.remove("invalid");
  noteInput.focus();

  applyFilter();
  updateState();
}

function updateState() {
  const total = notesList.children.length;
  counter.textContent = "Заметок: " + total;
  emptyMsg.hidden = total !== 0;
}

function applyFilter() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  notesList.querySelectorAll(".note").forEach((note) => {
    const text = note.dataset.text;
    const match = text.toLowerCase().includes(query);
    note.hidden = !match;

    const p = note.querySelector(".note__text");
    p.textContent = "";            
    if (match && query) {
      const start = text.toLowerCase().indexOf(query);
      const mark = document.createElement("mark");
      mark.textContent = text.slice(start, start + query.length);
      p.append(
        text.slice(0, start),
        mark,
        text.slice(start + query.length)
      );
    } else {
      p.textContent = text;
    }
    if (match) visible++;
  });

  const total = notesList.children.length;
  counter.textContent = query
    ? "Найдено: " + visible + " из " + total
    : "Заметок: " + total;
}

addBtn.addEventListener("click", addNote);

noteInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    addNote();
  }
});

noteInput.addEventListener("input", () => {
  errorMsg.hidden = true;
  noteInput.classList.remove("invalid");
});

notesList.addEventListener("click", (event) => {
  const btn = event.target.closest(".note__delete");
  if (!btn) return;
  btn.closest(".note").remove();          
  applyFilter();
  updateState();
});


searchInput.addEventListener("input", applyFilter);

updateState();