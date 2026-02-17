const HISTORY_KEY = 'retro-history';

export function saveToHistory(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const updated = [
      { ...entry, id: Date.now(), time: new Date().toLocaleString() },
      ...existing,
    ].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}
