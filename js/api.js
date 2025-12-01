const BASE = 'https://29.javascript.htmlacademy.pro/kekstagram';
const TIMEOUT = 10000;

function timeoutFetch(resource, options = {}, timeout = TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const merged = { ...options, signal: controller.signal };
  return fetch(resource, merged)
    .finally(() => clearTimeout(id));
}


export async function loadPhotos() {
  return timeoutFetch(`${BASE}/data`)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Ошибка загрузки: ${resp.status} ${resp.statusText}`);
      }
      return resp.json();
    })
    .catch((err) => {
      throw new Error(`Не удалось получить данные с сервера. ${err.message}`);
    });
}


export async function sendForm(formData) {
  return timeoutFetch(BASE, {
    method: 'POST',
    body: formData
  })
    .then((resp) => {
      if (!resp.ok) {
        throw new Error(`Ошибка отправки: ${resp.status} ${resp.statusText}`);
      }
      return resp;
    })
    .catch((err) => {
      throw new Error(`Не удалось отправить форму. ${err.message}`);
    });
}
