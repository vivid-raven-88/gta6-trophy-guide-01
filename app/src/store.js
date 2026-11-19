// Leonida Nights — saved progress and filter state.
// Everything lives in this browser's localStorage; nothing is uploaded.

/** localStorage key for the whole tracker state. */
export const STORAGE_KEY = 'leonida-nights-v1';

/** The five roadmap phases, in the order to play them. */
export const ROADMAP_PHASES = [
  { number: 1, title: 'Play the story', blurb: 'Chapters 1 to 4, the final mission, and the named story missions. The story is the spine of the whole hunt — play it straight through and the chapter and mission trophies land on their own.' },
  { number: 2, title: 'The people of Leonida', blurb: 'The character finales — Andy, Kenton, Billy, Randy, Tyrone — plus the 8 stranger strands. Finish each person\u2019s storyline while the story is still fresh.' },
  { number: 3, title: 'Collectibles and exploration', blurb: 'Meditation spots, card sets, WAiNK locations, vehicles, the 52 areas of Leonida, garages and the Scooter Bros app. Cover the map systematically, area by area.' },
  { number: 4, title: 'Activities and challenges', blurb: 'The long grind: 100% completion, 250 stunts, the 42 Shooting Range challenges, races, fishing, bowling, robberies and the money trophies. Work the list and watch the PSN counts.' },
  { number: 5, title: 'Odd jobs and cleanup', blurb: 'The one-off moments — VCIA, the showroom, the cocktail on Ocean Beach, the second-try trophy and the strange ones — then the platinum itself.' },
];

/** A fresh tracker state: nothing earned, spoilers shown, checklist open. */
export function defaultState() {
  return {
    earned: {},
    spoilers: false,
    tab: 'checklist',
    search: '',
    kind: 'all',
    grade: 'all',
    earnedFilter: 'all',
  };
}

/** The saved state, or a fresh one when nothing is saved yet. */
export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const state = defaultState();
    if (parsed && typeof parsed === 'object') {
      if (parsed.earned && typeof parsed.earned === 'object') state.earned = parsed.earned;
      if (typeof parsed.spoilers === 'boolean') state.spoilers = parsed.spoilers;
      if (typeof parsed.tab === 'string') state.tab = parsed.tab;
    }
    return state;
  } catch {
    return defaultState();
  }
}

/** Persist the earned set and the spoiler setting. */
export function saveProgress(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: state.earned, spoilers: state.spoilers, tab: state.tab }));
  } catch {
    // A browser that refuses storage keeps the session in memory only.
  }
}

/** How many trophies of `trophies` are earned in `state`. */
export function earnedCount(trophies, state) {
  return trophies.filter((t) => state.earned[t.id]).length;
}

/** Earned counts per grade, as { platinum, gold, silver, bronze }. */
export function earnedByGrade(trophies, state) {
  const out = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (state.earned[t.id]) out[t.grade] = (out[t.grade] ?? 0) + 1;
  return out;
}

/** Flip one trophy's earned state and save. */
export function toggleTrophy(state, id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveProgress(state);
}

/** The progress file the Export button downloads. */
export function exportProgressJson(state) {
  const ids = Object.keys(state.earned).map((k) => Number(k)).filter((n) => Number.isInteger(n)).sort((a, b) => a - b);
  return JSON.stringify({ app: 'Leonida Nights', game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: ids }, null, 2);
}

/**
 * Apply an imported progress file's text to `state`.
 * Returns { ok: true, imported: n } or { ok: false, error: message }.
 */
export function importProgressJson(state, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not JSON.' };
  }
  const ids = parsed && Array.isArray(parsed.earned) ? parsed.earned : null;
  if (ids === null) return { ok: false, error: 'That file has no earned list.' };
  const earned = {};
  for (const id of ids) if (Number.isInteger(id)) earned[id] = true;
  state.earned = earned;
  saveProgress(state);
  return { ok: true, imported: Object.keys(earned).length };
}

/** Clear every earned trophy and save. */
export function resetProgress(state) {
  state.earned = {};
  saveProgress(state);
}
