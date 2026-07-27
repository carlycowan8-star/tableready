/* ══════════════════════════════
   FAVORITES.JS — Saved recipes, import by URL or name
   ══════════════════════════════ */

const Favorites = {

  // ── RENDER LIST ──
  render() {
    const list = document.getElementById('favorites-list');
    if (!State.favorites.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">❤️</div><div class="empty-title">No favorites yet</div><div class="empty-sub">Tap 🤍 on any meal card to save it here, or import a recipe below.</div></div>`;
      return;
    }
    list.innerHTML = State.favorites.map((meal, i) => this.renderCard(meal, i)).join('');
  },

  renderCard(meal, index) {
    const emoji = getMealEmoji(meal.meal);
    return `
      <div class="fav-card fade-in">
        <div class="fav-card-img-placeholder">${emoji}</div>
        <div class="fav-card-body">
          <div class="fav-card-name">${meal.meal}</div>
          <div class="fav-card-meta">⏱ ${meal.prepTime || '?'} prep · ${meal.cookTime || '?'} cook${meal.savedAt ? ' · Saved ' + meal.savedAt : ''}${meal.imported ? ' · Imported' : ''}</div>
          <div class="fav-card-actions">
            <button class="fav-action-btn" onclick="Recipe.open(${index}, 'favorites')">📖 View</button>
            <button class="fav-action-btn" onclick="Recipe.openCookMode(${index}, 'favorites')">👨‍🍳 Cook</button>
            <button class="fav-action-btn danger" onclick="Favorites.remove(${index})">✕ Remove</button>
          </div>
        </div>
      </div>`;
  },

  remove(index) {
    State.favorites.splice(index, 1);
    State.saveFavorites();
    this.render();
    showToast('Removed from favorites');
  },

  // ── IMPORT RECIPE ──
  // Accepts a URL or a dish name/description
  async import() {
    const input = document.getElementById('import-url').value.trim();
    if (!input) { showToast('Enter a URL or dish name'); return; }

    showToast('Importing recipe…');

    const prompt = `The user wants to save this recipe: "${input}"

If it looks like a dish name or description, create a complete recipe for it.
If it looks like a URL, create a plausible recipe for the dish the URL likely refers to.

Return ONLY valid JSON (no markdown):
{"meal":"Recipe Name","prepTime":"10 min","cookTime":"30 min","difficulty":"Easy","diet":[],"servings":4,"description":"Brief description","estimatedCost":"$12–15","ingredients":[{"qty":"1 lb","name":"ingredient","detail":"detail","section":"Produce","sub":"alternative"}],"steps":[{"text":"Step here","timer":null}],"nutrition":{"calories":400,"protein":"30g","carbs":"20g","fat":"15g","fiber":"4g"},"tips":["Tip here"],"serving":"Serving suggestion"}`;

    try {
      const recipe = await callClaude(prompt, 2000);
      recipe.savedAt = new Date().toLocaleDateString();
      recipe.imported = true;
      State.favorites.push(recipe);
      State.saveFavorites();
      document.getElementById('import-url').value = '';
      this.render();
      showToast('✓ Recipe imported!');
    } catch(e) {
      showToast('Could not import. Try a dish name instead.');
    }
  }
};
