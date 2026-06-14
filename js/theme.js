const KEY = 'petapp.theme';
export function currentTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}
export function initTheme() {
  let t = 'light';
  try { t = localStorage.getItem(KEY) || 'light'; } catch {}
  document.documentElement.dataset.theme = t;
}
export function toggleTheme() {
  const t = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(KEY, t); } catch {}
  return t;
}
