const API_URL = import.meta.env.VITE_API_URL || '';

export const apiFetch = (url, options) => fetch(API_URL + url, { credentials: 'include', ...options });
