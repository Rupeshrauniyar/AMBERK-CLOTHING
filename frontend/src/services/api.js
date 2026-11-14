export async function fetchApi(endpoint, options = {}) {
  const base = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
  const url = endpoint.startsWith('http') ? endpoint : `${base}/api${endpoint}`;

  const config = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    const e = new Error('Cannot reach the store right now. Check your connection and try again.');
    e.code = 'NETWORK_ERROR';
    throw e;
  }
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error?.message || 'Something went wrong. Please try again.');
    error.code = data.error?.code || 'UNKNOWN_ERROR';
    error.details = data.error?.details;
    error.status = response.status;
    throw error;
  }

  return data.data;
}
