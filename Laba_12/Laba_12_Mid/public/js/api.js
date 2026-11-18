// Обёртка над fetch: все запросы к серверу проходят здесь.
// Cookie сессии браузер отправляет сам (credentials: 'same-origin'),
// JavaScript её не видит, потому что она HttpOnly.

export class ApiError extends Error {
  constructor(status, data) {
    super(data.error || `Ошибка ${status}`);
    this.status = status;
    this.code = data.code;
    this.fields = data.fields;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { error: 'Сервер недоступен. Проверьте, что он запущен.' });
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}
