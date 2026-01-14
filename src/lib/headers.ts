export function authHeaders(contentType?: string, tokenKey = 'token') {
  const token = localStorage.getItem(tokenKey);
  const headers: Record<string,string> = {};
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}
