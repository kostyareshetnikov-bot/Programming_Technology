const API_URL = 'https://jsonplaceholder.typicode.com/posts/';

const form = document.querySelector('#search-form');
const input = document.querySelector('#post-id');
const loadBtn = document.querySelector('#load');
const retryBtn = document.querySelector('#retry');
const statusEl = document.querySelector('#status');
const result = document.querySelector('#result');

let lastId = null;

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = type;
}

function renderPost(post) {
  const card = document.createElement('article');
  card.className = 'card';

  const title = document.createElement('h2');
  title.textContent = post.title;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `ID: ${post.id} · userId: ${post.userId}`;

  const body = document.createElement('p');
  body.textContent = post.body;

  card.append(title, meta, body);
  result.replaceChildren(card);
}

async function loadPost(id) {
  lastId = id;
  loadBtn.disabled = true;
  retryBtn.hidden = true;
  result.replaceChildren();
  setStatus('Загрузка...', 'loading');
  const started = performance.now();

  try {
    const response = await fetch(API_URL + id);
    if (response.status === 404) {
      setStatus(`Публикация с ID ${id} не найдена`, 'error');
      return;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const post = await response.json();
    renderPost(post);
    // творческая функция: индикатор времени ответа
    const ms = Math.round(performance.now() - started);
    setStatus(`Успех: ответ получен за ${ms} мс`, 'success');
  } catch (error) {
    setStatus(`Ошибка загрузки: ${error.message}`, 'error');
    retryBtn.hidden = false;
  } finally {
    loadBtn.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const id = Number(input.value);
  if (!Number.isInteger(id) || id < 1) {
    result.replaceChildren();
    setStatus('Введите целое положительное число', 'error');
    return;
  }
  loadPost(id);
});

retryBtn.addEventListener('click', () => loadPost(lastId));
