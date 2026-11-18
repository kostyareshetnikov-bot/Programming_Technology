// Работа с сервером и токенами.
// access token хранится ТОЛЬКО в переменной (в памяти вкладки), а не в localStorage:
// вредоносный скрипт не найдёт его в хранилище, а после F5 токен восстанавливается через refresh.
// refresh token лежит в cookie HttpOnly — JavaScript его вообще не видит.

export class ApiError extends Error {
  constructor(status, data) {
    super(data.error || `Ошибка ${status}`);
    this.status = status;
    this.code = data.code;
    this.fields = data.fields;
  }
}

let accessToken = null;
let refreshing = null;

// Колбэки, которые подключает app.js: журнал запросов, смена токена, конец сессии
const handlers = { onRequest() {}, onToken() {}, onSessionEnd() {} };
export const setHandlers = (custom) => Object.assign(handlers, custom);

function setAccessToken(token) {
  accessToken = token;
  handlers.onToken(token);
}

async function send(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError(0, { error: 'Сервер недоступен. Проверьте, что он запущен.' });
  }

  const data = await response.json().catch(() => ({}));
  handlers.onRequest({ method, path: `/api${path}`, status: response.status, code: data.code });
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

function endSession(error) {
  setAccessToken(null);
  handlers.onSessionEnd(error);
}

export async function login(loginValue, password) {
  const data = await send('/auth/login', { method: 'POST', body: { login: loginValue, password } });
  setAccessToken(data.accessToken);
  return data;
}

// Новая пара токенов по refresh-cookie. Если несколько запросов одновременно
// получили 401, обновление всё равно выполняется один раз (общий Promise)
export function refresh() {
  refreshing ??= send('/auth/refresh', { method: 'POST' })
    .then((data) => {
      setAccessToken(data.accessToken);
      return data;
    })
    .catch((error) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// Запрос к защищённому API. Если access token истёк — тихо обновляем его и повторяем запрос один раз
export async function api(path, options) {
  try {
    return await send(path, options);
  } catch (error) {
    if (error.code !== 'token_expired') {
      if (error.status === 401) endSession(error);
      throw error;
    }
  }

  try {
    await refresh();
    return await send(path, options);
  } catch (error) {
    if (error.status === 401) endSession(error);
    throw error;
  }
}

export async function logout({ everywhere = false } = {}) {
  try {
    if (everywhere) await api('/auth/logout-all', { method: 'POST' });
    else await send('/auth/logout', { method: 'POST' });
  } finally {
    setAccessToken(null);
  }
}
