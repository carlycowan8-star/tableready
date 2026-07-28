/* ══════════════════════════════
   SETUP.JS — Setup form, chip selections, servings
   To add a new filter: add a chip in index.html and update getPreferences()
   ══════════════════════════════ */

const Setup = {

  // ── HEADCOUNT ──
  changeHeadcount(category, delta) {
    State.headcount[category] = Math.max(0, Math.min(20, State.headcount[category] + delta));
    this.renderHeadcount();
  },

  renderHeadcount() {
    document.getElementById('count-kids').textContent = State.headcount.kids;
    document.getElementById('count-teens').textContent = State.headcount.teens;
    document.getElementById('count-adults').textContent = State.headcount.adults;
    document.getElementById('count-elderly').textContent = State.headcount.elderly;
    document.getElementById('total-servings').textContent = State.servings;
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

    const who = [];
    const h = State.headcount;
    if (h.kids > 0) who.push(`${h.kids} young kid${h.kids > 1 ? 's' : ''} (under 10)`);
    if (h.teens > 0) who.push(`${h.teens} tween/teen${h.teens > 1 ? 's' : ''}`);
    if (h.adults > 0) who.push(`${h.adults} adult${h.adults > 1 ? 's' : ''}`);
    if (h.elderly > 0) who.push(`${h.elderly} elderly`);

    return {
      servings: State.servings,
      days: parseInt(daysChip) || 3,
      who,
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
    this.renderHeadcount();
  }
};
