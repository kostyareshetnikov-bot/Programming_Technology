const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const DEBOUNCE_MS = 400;

const searchInput = document.querySelector('#search');
const statusEl = document.querySelector('#status');
const retryBtn = document.querySelector('#retry');
const countersEl = document.querySelector('#counters');
const results = document.querySelector('#results');

let timerId = null;          // таймер debounce
let currentController = null; // AbortController активного запроса
let lastQuery = '';
const stats = { sent: 0, aborted: 0 }; // творческая функция: счётчик запросов

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = type;
}

function updateCounters() {
  countersEl.textContent = `Запросов отправлено: ${stats.sent} · отменено: ${stats.aborted}`;
}

// Безопасная подсветка: только textContent + <mark>, без innerHTML
function appendHighlighted(parent, text, query) {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let pos = 0;
  let idx;
  while (q && (idx = lower.indexOf(q, pos)) !== -1) {
    parent.append(text.slice(pos, idx));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(idx, idx + q.length);
    parent.append(mark);
    pos = idx + q.length;
  }
  parent.append(text.slice(pos));
}

function renderPosts(posts, query) {
  results.replaceChildren();
  for (const post of posts) {
    const item = document.createElement('li');
    item.append(`${post.id}. `);
    appendHighlighted(item, post.title, query);
    results.append(item);
  }
}

async function search(query) {
  lastQuery = query;
  retryBtn.hidden = true;

  // отмена предыдущего запроса
  if (currentController) currentController.abort();
  const controller = new AbortController();
  currentController = controller;

  setStatus('Загрузка...', 'loading');
  stats.sent++;
  updateCounters();

  try {
    const url = `${API_URL}?q=${encodeURIComponent(query)}&_limit=20`;
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const posts = await response.json();
    if (posts.length === 0) {
      results.replaceChildren();
      setStatus(`По запросу «${query}» ничего не найдено`, 'error');
    } else {
      renderPosts(posts, query);
      setStatus(`Найдено: ${posts.length}`, 'success');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      stats.aborted++;
      updateCounters();
      return; // запрос отменён нами — это не ошибка для пользователя
    }
    results.replaceChildren();
    setStatus(`Ошибка загрузки: ${error.message}`, 'error');
    retryBtn.hidden = false;
  }
}

searchInput.addEventListener('input', () => {
  clearTimeout(timerId);
  const query = searchInput.value.trim();

  if (!query) {
    if (currentController) currentController.abort();
    results.replaceChildren();
    retryBtn.hidden = true;
    setStatus('');
    return;
  }
  timerId = setTimeout(() => search(query), DEBOUNCE_MS);
});

retryBtn.addEventListener('click', () => search(lastQuery));
updateCounters();
