// Декодирование JWT в браузере — ТОЛЬКО для показа на странице.
// Подпись здесь не проверяется: секрета у клиента нет и быть не должно, проверяет сервер.

function decodePart(part) {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)); // TextDecoder — чтобы кириллица в name читалась
}

export function decodeJwt(token) {
  const [header, payload, signature] = token.split('.');
  return { header: decodePart(header), payload: decodePart(payload), signature, parts: [header, payload, signature] };
}

// Пояснения к стандартным и нашим полям payload
export const CLAIMS = {
  sub: 'ID пользователя (subject)',
  name: 'имя для интерфейса',
  sid: 'ID сессии — по нему сервер проверяет, не вышел ли пользователь',
  iat: 'когда выдан',
  exp: 'когда истекает',
  aud: 'для кого (audience)',
  iss: 'кто выдал (issuer)',
  jti: 'уникальный ID токена',
};
