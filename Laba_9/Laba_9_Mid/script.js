const API_URL = 'https://jsonplaceholder.typicode.com/posts';

const results = document.querySelector('#results');
const statusEl = document.querySelector('#status');
const retryBtn = document.querySelector('#retry');
const prevBtn = document.querySelector('#prev');
const nextBtn = document.querySelector('#next');
const pageInfo = document.querySelector('#page-info');
const pageSizeSelect = document.querySelector('#page-size');

let page = 1;
let limit = Number(pageSizeSelect.value);
let totalCount = 100;      // уточняется по заголовку X-Total-Count
let requestedPage = 1;     // страница, которую пытались загрузить (для «Повторить»)
let loading = false;

function setStatus(text, type = '') {
  statusEl.textContent = text;
  statusEl.className = type;
}

function totalPages() {
  return Math.max(1, Math.ceil(totalCount / limit));
}

function updatePager() {
  pageInfo.textContent = `Страница ${page} из ${totalPages()}`;
  prevBtn.disabled = loading || page <= 1;
  nextBtn.disabled = loading || page >= totalPages();
  pageSizeSelect.disabled = loading;
}

function renderPosts(posts) {
  results.replaceChildren();
  for (const post of posts) {
    const item = document.createElement('li');
    item.textContent = `${post.id}. ${post.title}`;
    results.append(item);
  }
}

async function loadPage(targetPage) {
  requestedPage = targetPage;
  loading = true;
  retryBtn.hidden = true;
  setStatus('Загрузка...', 'loading');
  updatePager();

  try {
    const response = await fetch(`${API_URL}?_page=${targetPage}&_limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const posts = await response.json();
    const header = response.headers.get('X-Total-Count');
    if (header) totalCount = Number(header);

    if (posts.length === 0) {
      results.replaceChildren();
      setStatus('На этой странице данных нет', 'error');
    } else {
      page = targetPage;
      renderPosts(posts);
      setStatus(`Загружено записей: ${posts.length}`, 'success');
    }
  } catch (error) {
    setStatus(`Ошибка загрузки: ${error.message}`, 'error');
    retryBtn.hidden = false;
  } finally {
    loading = false;
    updatePager();
  }
}

prevBtn.addEventListener('click', () => loadPage(page - 1));
nextBtn.addEventListener('click', () => loadPage(page + 1));
retryBtn.addEventListener('click', () => loadPage(requestedPage));
pageSizeSelect.addEventListener('change', () => {
  limit = Number(pageSizeSelect.value);
  page = 1;
  loadPage(1);
});

loadPage(1);
