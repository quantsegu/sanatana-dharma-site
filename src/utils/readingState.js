const BOOKMARKS_KEY = "sanatana.bookmarks";
const PROGRESS_KEY = "sanatana.readingProgress";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

export function getBookmarks() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(BOOKMARKS_KEY), []);
}

export function isBookmarked(topicId) {
  return getBookmarks().includes(topicId);
}

export function toggleBookmark(topicId) {
  const current = new Set(getBookmarks());
  if (current.has(topicId)) {
    current.delete(topicId);
  } else {
    current.add(topicId);
  }

  const next = Array.from(current);
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  return next;
}

export function setBookmarks(nextBookmarks) {
  if (typeof window === "undefined") return [];
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextBookmarks));
  return nextBookmarks;
}

export function getReadingProgress() {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(PROGRESS_KEY), {});
}

export function getTopicProgress(topicId) {
  const progress = getReadingProgress();
  return Math.max(0, Math.min(100, Number(progress[topicId] ?? 0)));
}

export function setTopicProgress(topicId, percentage) {
  const nextValue = Math.max(0, Math.min(100, Math.round(percentage)));
  const current = getReadingProgress();
  const prev = Number(current[topicId] ?? 0);
  if (nextValue <= prev) {
    return prev;
  }

  const next = { ...current, [topicId]: nextValue };
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  return nextValue;
}

export function getResumeTopicId() {
  const bookmarks = getBookmarks();
  if (!bookmarks.length) return null;

  const progress = getReadingProgress();

  // Prefer active in-progress topics, closest to completion.
  const inProgress = bookmarks
    .map((id) => ({ id, value: Number(progress[id] ?? 0) }))
    .filter((item) => item.value > 0 && item.value < 100)
    .sort((a, b) => b.value - a.value);

  if (inProgress.length) return inProgress[0].id;

  // Fall back to not-yet-started bookmarks.
  const notStarted = bookmarks.find((id) => Number(progress[id] ?? 0) === 0);
  if (notStarted) return notStarted;

  // Otherwise return the least-complete finished bookmark.
  const bestFallback = bookmarks
    .map((id) => ({ id, value: Number(progress[id] ?? 100) }))
    .sort((a, b) => a.value - b.value)[0];

  return bestFallback?.id ?? null;
}
