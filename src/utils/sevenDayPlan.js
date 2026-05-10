const STORAGE_KEY = 'sanatana.sevenDayPlan.completed';

function safeParse(json, fallback) {
  try {
    return JSON.parse(json ?? '');
  } catch {
    return fallback;
  }
}

export function getCompletedDays() {
  if (typeof window === 'undefined') return [];
  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY), []);
  return Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6) : [];
}

export function setCompletedDays(dayIndexes) {
  const unique = [...new Set(dayIndexes)].filter((n) => n >= 0 && n <= 6).sort((a, b) => a - b);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export function toggleDayComplete(dayIndex) {
  const current = new Set(getCompletedDays());
  if (current.has(dayIndex)) {
    current.delete(dayIndex);
  } else {
    current.add(dayIndex);
  }
  return setCompletedDays([...current]);
}

export function resetSevenDayPlan() {
  setCompletedDays([]);
}
