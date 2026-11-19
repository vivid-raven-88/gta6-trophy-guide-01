// Leonida Nights — boot and event wiring.
// Loads app/data/trophies.json (a file of this app, nothing over the network),
// renders the checklist, roadmap and missables, and wires the tracker controls.

import {
  loadSavedState,
  saveProgress,
  toggleTrophy,
  exportProgressJson,
  importProgressJson,
  resetProgress,
} from './store.js';
import {
  renderChecklist,
  renderRoadmap,
  renderMissables,
  renderProgress,
  showTab,
} from './views.js';

/** Download a text file from the browser. */
function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Re-render every view from the current state. */
function renderAll(trophies, state) {
  renderChecklist(trophies, state);
  renderRoadmap(trophies, state);
  renderMissables(trophies, state);
  renderProgress(trophies, state);
}

/** Mark a filter chip group to one value. */
function setChip(group, value) {
  for (const chip of group.querySelectorAll('.chip')) chip.classList.toggle('active', chip.dataset[Object.keys(chip.dataset)[0]] === value);
}

/** Start the guide. */
async function main() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error(`trophies.json did not load (${response.status})`);
  const data = await response.json();
  const trophies = data.trophies;
  const state = loadSavedState();

  const spoilerToggle = document.getElementById('spoilerToggle');
  spoilerToggle.checked = state.spoilers;
  document.getElementById('searchInput').value = state.search;

  renderAll(trophies, state);
  showTab(state.tab === 'roadmap' || state.tab === 'missables' || state.tab === 'sources' ? state.tab : 'checklist');

  // Tabs.
  for (const button of document.querySelectorAll('.tab')) {
    button.addEventListener('click', () => {
      state.tab = button.dataset.tab;
      saveProgress(state);
      showTab(state.tab);
    });
  }

  // Spoiler setting.
  spoilerToggle.addEventListener('change', () => {
    state.spoilers = spoilerToggle.checked;
    saveProgress(state);
    renderAll(trophies, state);
  });

  // Search.
  document.getElementById('searchInput').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderChecklist(trophies, state);
  });

  // Kind, grade and earned filters.
  document.getElementById('kindFilters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-kind]');
    if (!chip) return;
    state.kind = chip.dataset.kind;
    setChip(document.getElementById('kindFilters'), state.kind);
    renderChecklist(trophies, state);
  });
  document.getElementById('gradeFilters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-grade]');
    if (!chip) return;
    state.grade = chip.dataset.grade;
    setChip(document.getElementById('gradeFilters'), state.grade);
    renderChecklist(trophies, state);
  });
  document.getElementById('earnedFilters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-earned]');
    if (!chip) return;
    state.earnedFilter = chip.dataset.earned;
    setChip(document.getElementById('earnedFilters'), state.earnedFilter);
    renderChecklist(trophies, state);
  });

  // One delegated handler for every trophy card: the checkbox and the guide toggle.
  const onCardClick = (event) => {
    const toggle = event.target.closest('[data-action="guide"]');
    if (toggle) {
      const guide = toggle.parentElement.querySelector('.guide');
      const open = guide.hidden;
      guide.hidden = !open;
      toggle.textContent = open ? 'Hide guide' : 'Show guide';
      toggle.setAttribute('aria-expanded', String(open));
      return;
    }
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (checkbox) {
      const card = checkbox.closest('[data-trophy-id]');
      const id = Number(card.dataset.trophyId);
      toggleTrophy(state, id);
      const earned = Boolean(state.earned[id]);
      card.classList.toggle('earned', earned);
      const mark = card.querySelector('.earned-mark');
      if (earned && !mark) {
        const name = card.querySelector('.trophy-name');
        name.insertAdjacentHTML('beforeend', ' <span class="earned-mark">✓ earned</span>');
      } else if (!earned && mark) {
        mark.remove();
      }
      renderProgress(trophies, state);
      renderRoadmap(trophies, state);
    }
  };
  document.getElementById('trophyList').addEventListener('click', onCardClick);
  document.getElementById('missableList').addEventListener('click', onCardClick);

  // Export, import and reset.
  document.getElementById('exportBtn').addEventListener('click', () => {
    downloadFile('leonida-nights-progress.json', exportProgressJson(state));
  });
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    file.text().then((text) => {
      const result = importProgressJson(state, text);
      if (!result.ok) {
        window.alert(`Could not import that file: ${result.error}`);
        return;
      }
      renderAll(trophies, state);
      window.alert(`Imported ${result.imported} earned trophies.`);
    });
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear every earned trophy? This cannot be undone.')) return;
    resetProgress(state);
    renderAll(trophies, state);
  });
}

main().catch((error) => {
  const list = document.getElementById('trophyList');
  list.innerHTML = `<li class="trophy"><p>The trophy list did not load: ${error.message}</p></li>`;
});
