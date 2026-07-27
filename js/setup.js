/* ══════════════════════════════
   SETUP.JS — Setup form, chip selections, servings
   To add a new filter: add a chip in index.html and update getPreferences()
   ══════════════════════════════ */

const Setup = {

  // ── SERVINGS ──
  changeServings(delta) {
    State.servings = Math.max(1, Math.min(20, State.servings + delta));
    document.getElementById('servings-display').textContent = State.servings;
  },

  // ── CHIPS ──
  toggleChip(el, group) {
    // Single-select groups
    if (['time', 'days'].includes(group)) {
      el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    }
    // Diet: selecting any option deselects "No preference", and vice versa
    if (group === 'diet') {
      const noPreference = el.closest('.chip-group').querySelector('.chip:first-child');
      if (el === noPreference) {
        el.closest('.chip-group').querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      } else {
        noPreference.classList.remove('selected');
      }
    }
    el.classList.toggle('selected');
  },

  // ── READ PREFERENCES ──
  // Returns a preferences object. Add new fields here when you add new setup options.
  getPreferences() {
    const allChips = [...document.querySelectorAll('#screen-setup .chip.selected')].map(c => c.textContent.trim());
    const daysChip = allChips.find(t => t.includes('day')) || '3 days';

    return {
      servings: State.servings,
      days: parseInt(daysChip) || 3,
      who: allChips.filter(c => ['👶 Young kids (under 10)', '🧑 Tweens / Teens', '🧑‍🍳 Adults', '👴 Elderly'].includes(c)),
      diet: allChips.filter(c =>
        c.includes('🍽️') || c.includes('🥩') || c.includes('🦁') || c.includes('💪') ||
        c.includes('🍗') || c.includes('🫀') || c.includes('⚡') || c.includes('🌿') ||
        c.includes('🌱') || c.includes('🐟') || c.includes('🌾') || c.includes('🥛') ||
        c.includes('❤️') || c.includes('🕌') || c.includes('✡️')
      ),
      allergies: allChips.filter(c =>
        c.includes('🥜') || c.includes('🦐') || c.includes('🐟') ||
        c.includes('🥚') || c.includes('🫘')
      ),
      cookTime: allChips.find(c => c.includes('min') || c.includes('weekend')) || '30–45 min',
      avoid: document.getElementById('avoid-foods').value,
      love: document.getElementById('love-foods').value,
      pantry: State.pantryItems.map(p => p.name)
    };
  },

  // ── RESTORE UI FROM STATE ──
  restoreUI() {
    document.getElementById('servings-display').textContent = State.servings;
  }
};
