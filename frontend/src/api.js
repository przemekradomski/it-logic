const pendingGetRequests = new Map();
let csrfRequest;

function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

async function ensureCsrfCookie() {
  if (getCookie('csrftoken')) return;

  if (!csrfRequest) {
    csrfRequest = fetch('/api/auth/csrf/', { credentials: 'include' })
      .then((response) => {
        if (!response.ok) throw new Error('Nie udało się zabezpieczyć żądania.');
      })
      .finally(() => {
        csrfRequest = null;
      });
  }

  await csrfRequest;
}

async function sendRequest(url, options) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  if (method !== 'GET' && method !== 'HEAD') {
    await ensureCsrfCookie();
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;

    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'include',
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || data.error || data.message || 'Wystąpił błąd. Spróbuj ponownie.');
  }
  return data;
}

export function apiRequest(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') return sendRequest(url, options);

  const pendingRequest = pendingGetRequests.get(url);
  if (pendingRequest) return pendingRequest;

  const request = sendRequest(url, options).finally(() => {
    if (pendingGetRequests.get(url) === request) {
      pendingGetRequests.delete(url);
    }
  });
  pendingGetRequests.set(url, request);
  return request;
}
