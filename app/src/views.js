// Leonida Nights — rendering: the checklist, the roadmap and the missables pages.
// All text comes from app/data/trophies.json; nothing is fetched from the network.

import { ROADMAP_PHASES, earnedCount, earnedByGrade } from './store.js';

/** The grade names the filter chips and badges show. */
export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

/** The kind names the filter chips show. */
export const KIND_LABELS = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', platinum: 'Platinum' };

/** Escape text for insertion into HTML. */
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Whether a trophy's name and description are hidden right now:
 * the spoiler setting is on, the trophy is a story trophy, and it is not earned yet.
 */
export function isSpoilerHidden(trophy, state) {
  return state.spoilers && trophy.kind === 'story' && !state.earned[trophy.id];
}

/** The trophies the checklist shows under the current filters and search. */
export function visibleTrophies(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.earnedFilter === 'earned' && !state.earned[t.id]) return false;
    if (state.earnedFilter === 'remaining' && state.earned[t.id]) return false;
    if (query !== '') {
      const haystack = isSpoilerHidden(t, state) ? '' : `${t.name} ${t.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

/** One trophy card, as HTML. The guide starts collapsed. */
export function trophyCard(trophy, state) {
  const earned = Boolean(state.earned[trophy.id]);
  const hidden = isSpoilerHidden(trophy, state);
  const name = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = hidden ? 'Earn this trophy to reveal its name and description.' : trophy.description;
  const meta = [`<span class="badge ${trophy.grade}">${GRADE_LABELS[trophy.grade]}</span>`];
  if (trophy.count !== null && trophy.count !== undefined) meta.push(`<span class="tag">PSN count: ${trophy.count}</span>`);
  if (trophy.missable) meta.push('<span class="tag missable">Missable</span>');
  if (trophy.hidden) meta.push('<span class="tag hidden-flag">Hidden on PSN</span>');
  meta.push(`<span class="tag">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>`);
  meta.push(`<span class="tag">Phase ${trophy.roadmap}</span>`);
  const guide = hidden
    ? '<p>Turn the spoiler setting off, or earn this trophy, to read its guide.</p>'
    : `<p>${escapeHtml(trophy.guide)}</p><h3>Sources</h3><ul>${trophy.sources.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>`;
  return `<li class="trophy${earned ? ' earned' : ''}${hidden ? ' spoiler-hidden' : ''}" data-trophy-id="${trophy.id}">
    <div class="trophy-top">
      <input type="checkbox" class="trophy-check" data-action="toggle" aria-label="Mark ${escapeHtml(name)} earned"${earned ? ' checked' : ''}>
      <div class="trophy-body">
        <h3 class="trophy-name">${escapeHtml(name)}${earned ? ' <span class="earned-mark">✓ earned</span>' : ''}</h3>
        <p class="trophy-desc">${escapeHtml(desc)}</p>
        <div class="trophy-meta">${meta.join('')}</div>
        <button type="button" class="guide-toggle" data-action="guide" aria-expanded="false">Show guide</button>
        <div class="guide" hidden>${guide}</div>
      </div>
    </div>
  </li>`;
}

/** Render the checklist into #trophyList and update the result count. */
export function renderChecklist(trophies, state) {
  const list = document.getElementById('trophyList');
  const shown = visibleTrophies(trophies, state);
  list.innerHTML = shown.map((t) => trophyCard(t, state)).join('');
  const count = document.getElementById('resultCount');
  if (state.kind === 'online') {
    count.textContent = 'No online trophies: the official list holds no online trophies.';
  } else {
    count.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
  }
  document.getElementById('emptyState').hidden = shown.length !== 0;
}

/** Render the five-phase roadmap into #roadmapList. */
export function renderRoadmap(trophies, state) {
  const list = document.getElementById('roadmapList');
  list.innerHTML = ROADMAP_PHASES.map((phase) => {
    const members = trophies.filter((t) => t.roadmap === phase.number);
    const done = members.filter((t) => state.earned[t.id]).length;
    const items = members
      .map((t) => `<li class="${state.earned[t.id] ? 'done' : ''}">${escapeHtml(isSpoilerHidden(t, state) ? 'Hidden story trophy' : t.name)} — ${GRADE_LABELS[t.grade]}${t.missable ? ' · Missable' : ''}</li>`)
      .join('');
    return `<li class="phase"><h2><span class="phase-num">${phase.number}</span>${escapeHtml(phase.title)}</h2>
      <p class="phase-desc">${escapeHtml(phase.blurb)}</p>
      <p class="phase-progress">${done} of ${members.length} earned in this phase</p>
      <ul class="phase-trophies">${items}</ul></li>`;
  }).join('');
}

/** Render the missable trophies into #missableList. */
export function renderMissables(trophies, state) {
  const list = document.getElementById('missableList');
  const missables = trophies.filter((t) => t.missable);
  list.innerHTML = missables.map((t) => trophyCard(t, state)).join('');
}

/** Update the header progress card from the current state. */
export function renderProgress(trophies, state) {
  const earned = earnedCount(trophies, state);
  document.getElementById('earnedCount').textContent = String(earned);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned));
  const byGrade = earnedByGrade(trophies, state);
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) totals[t.grade] = (totals[t.grade] ?? 0) + 1;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${byGrade.platinum}/${totals.platinum} · Gold ${byGrade.gold}/${totals.gold} · Silver ${byGrade.silver}/${totals.silver} · Bronze ${byGrade.bronze}/${totals.bronze}`;
  document.getElementById('platinumNote').textContent =
    earned === trophies.length ? 'Platinum earned — Leonida Legend!' : 'The platinum pops when the other 54 are done.';
  const missableTotal = trophies.filter((t) => t.missable).length;
  document.getElementById('missableCount').textContent = `(${missableTotal})`;
}

/** Show one tab's view and mark its tab active. */
export function showTab(tab) {
  for (const button of document.querySelectorAll('.tab')) {
    const active = button.dataset.tab === tab;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  for (const view of document.querySelectorAll('.view')) {
    const active = view.id === `view-${tab}`;
    view.classList.toggle('active', active);
    view.hidden = !active;
  }
}
