/* ══════════════════════════════
   STATE.JS — Single source of truth for all app data
   Add new data here. Never store data in other modules.
   ══════════════════════════════ */

const State = {
  headcount: { kids: 0, teens: 0, adults: 4, elderly: 0 },
  get servings() {
    return this.headcount.kids + this.headcount.teens + this.headcount.adults + this.headcount.elderly;
  },
  currentMenu: [],
  currentRecipe: null,
  currentRecipeIndex: -1,
  recipeSource: 'menu', // 'menu' or 'favorites'
  cookStep: 0,
  weekBudget: '',

  // Persisted to localStorage
  pantryItems: JSON.parse(localStorage.getItem('tr_pantry') || '[]'),
  favorites: JSON.parse(localStorage.getItem('tr_favorites') || '[]'),
  checkedItems: new Set(JSON.parse(localStorage.getItem('tr_checked') || '[]')),

  // ── PERSIST HELPERS ──
  saveMenu() {
    localStorage.setItem('tr_menu', JSON.stringify({ days: this.currentMenu, weekBudget: this.weekBudget }));
    localStorage.setItem('tr_headcount', JSON.stringify(this.headcount));
  },
  savePantry() {
    localStorage.setItem('tr_pantry', JSON.stringify(this.pantryItems));
  },
  saveFavorites() {
    localStorage.setItem('tr_favorites', JSON.stringify(this.favorites));
  },
  saveChecked() {
    localStorage.setItem('tr_checked', JSON.stringify([...this.checkedItems]));
  },
  clearMenu() {
    this.currentMenu = [];
    this.weekBudget = '';
    localStorage.removeItem('tr_menu');
  },

  // ── FAVORITES HELPERS ──
  isFavorite(mealName) {
    return this.favorites.some(f => f.meal === mealName);
  },
  addFavorite(meal) {
    if (!this.isFavorite(meal.meal)) {
      this.favorites.push({ ...meal, savedAt: new Date().toLocaleDateString() });
      this.saveFavorites();
      return true;
    }
    return false;
  },
  removeFavorite(mealName) {
    const idx = this.favorites.findIndex(f => f.meal === mealName);
    if (idx >= 0) { this.favorites.splice(idx, 1); this.saveFavorites(); return true; }
    return false;
  },
  toggleFavorite(meal) {
    if (this.isFavorite(meal.meal)) {
      this.removeFavorite(meal.meal);
      return false; // now not a favorite
    } else {
      this.addFavorite(meal);
      return true; // now a favorite
    }
  },

  // ── LOAD SAVED STATE ──
  restore() {
    const savedHeadcount = localStorage.getItem('tr_headcount');
    if (savedHeadcount) {
      try { this.headcount = JSON.parse(savedHeadcount); } catch(e) {}
    } else {
      // Back-compat: migrate the old single "tr_servings" number (pre-headcount UI)
      const savedServings = localStorage.getItem('tr_servings');
      if (savedServings) this.headcount = { kids: 0, teens: 0, adults: parseInt(savedServings) || 4, elderly: 0 };
    }

    const savedData = localStorage.getItem('tr_menu');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.currentMenu = parsed.days || parsed;
        this.weekBudget = parsed.weekBudget || '';
        return true; // had saved menu
      } catch(e) {
        console.error('Could not restore menu:', e);
        return false;
      }
    }
    return false;
  }
};
