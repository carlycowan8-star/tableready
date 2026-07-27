/* ══════════════════════════════
   MENU.JS — AI menu generation, meal cards, swap
   To change how the menu is built: update buildPrompt()
   To change how cards look: update renderCard()
   ══════════════════════════════ */

const Menu = {

  // ── BUILD PROMPT ──
  // Edit this function to change what the AI is asked to generate
  buildPrompt(prefs) {
    return `You are a family meal planning assistant. Build a ${prefs.days}-day dinner menu for ${prefs.servings} people.

Preferences:
- Who's eating: ${prefs.who.join(', ') || 'family mix'}
- Diet: ${prefs.diet.join(', ') || 'no restrictions'}
- Allergies: ${prefs.allergies.join(', ') || 'none'}
- Max cook time: ${prefs.cookTime}
- Foods to avoid: ${prefs.avoid || 'none'}
- Foods they love: ${prefs.love || 'no preference'}
- Pantry already stocked: ${prefs.pantry.join(', ') || 'nothing specified'}

RULES:
1. FLAVOR DIVERSITY: Every meal must use a completely different cuisine/spice base. No repeating Mexican, Italian, etc.
2. LEFTOVERS: Mark 1 meal as leftoversNote with a short tip like "Makes great lunch next day".
3. BUDGET: Include a rough estimatedCost per meal in USD (e.g. "$12–15").
4. SUBSTITUTIONS: For key ingredients add a "sub" field with a simple swap.

Return ONLY valid JSON (no markdown):
{"weekBudget":"$35–45","days":[{"day":"Monday","meal":"Honey Garlic Chicken","prepTime":"10 min","cookTime":"35 min","difficulty":"Easy","diet":[],"servings":${prefs.servings},"description":"Brief description","estimatedCost":"$14–17","leftoversNote":"Makes great lunch wraps","ingredients":[{"qty":"2 lbs","name":"chicken thighs","detail":"bone-in, skin-on","section":"Meat & Seafood","sub":"boneless thighs work too"}],"steps":[{"text":"Step here","timer":null}],"nutrition":{"calories":420,"protein":"38g","carbs":"18g","fat":"22g","fiber":"4g"},"tips":["Tip here"],"serving":"Serving suggestion"}]}`;
  },

  // ── BUILD MENU ──
  async build() {
    const prefs = Setup.getPreferences();
    showLoading('Planning your week…', 'Mixing flavors and finding the perfect meals');
    showScreen('screen-menu');
    try {
      const parsed = await callClaude(this.buildPrompt(prefs), 4000);
      State.currentMenu = parsed.days;
      State.weekBudget = parsed.weekBudget || '';
      State.saveMenu();
      this.render();
      Shopping.renderList();
    } catch(e) {
      console.error('Build menu error:', e);
      showToast('Error: ' + e.message);
    }
    hideLoading();
  },

  // ── SWAP A MEAL ──
  async swap(index) {
    showToast('Finding a new meal…');
    const meal = State.currentMenu[index];
    const prefs = Setup.getPreferences();
    const existing = State.currentMenu.map(m => m.meal).join(', ');

    const prompt = `Suggest ONE different dinner meal for ${State.servings} people for ${meal.day}.
Avoid these already in the plan: ${existing}.
Foods to avoid: ${prefs.avoid || 'none'}. Foods they love: ${prefs.love || 'none'}.
Diet: ${prefs.diet.join(', ') || 'none'}.
CRITICAL: Different cuisine/flavor base from all existing meals.
Return ONLY valid JSON:
{"day":"${meal.day}","meal":"Name","prepTime":"10 min","cookTime":"30 min","difficulty":"Easy","diet":[],"servings":${State.servings},"description":"Brief","estimatedCost":"$12–15","leftoversNote":"","ingredients":[{"qty":"1 lb","name":"x","detail":"y","section":"Produce","sub":"z"}],"steps":[{"text":"Step","timer":null}],"nutrition":{"calories":400,"protein":"35g","carbs":"20g","fat":"15g","fiber":"4g"},"tips":["tip"],"serving":"suggestion"}`;

    try {
      const newMeal = await callClaude(prompt, 2000);
      State.currentMenu[index] = newMeal;
      State.saveMenu();
      this.render();
      Shopping.renderList();
      showToast('✓ Meal swapped!');
    } catch(e) {
      showToast('Could not swap. Try again.');
    }
  },

  // ── CLEAR MENU ──
  clear() {
    if (!confirm('Clear your saved menu and start fresh?')) return;
    State.clearMenu();
    showScreen('screen-setup');
    showToast('Menu cleared');
  },

  // ── RENDER MEAL CARD ──
  // Edit this function to change how individual meal cards look
  renderCard(meal, index) {
    const isFav = State.isFavorite(meal.meal);
    const emoji = getMealEmoji(meal.meal);
    const div = document.createElement('div');
    div.className = `meal-card fade-in fade-in-${Math.min(index + 1, 4)}`;
    div.innerHTML = `
      <div class="meal-card-img-placeholder">${emoji}</div>
      <div class="meal-card-inner">
        <button class="meal-fav-btn" onclick="Menu.toggleFav(${index}, event)">${isFav ? '❤️' : '🤍'}</button>
        <div class="meal-day">${meal.day}</div>
        <div class="meal-name">${meal.meal}</div>
        <div class="meal-meta">
          <span class="meal-tag tag-time">⏱ ${meal.prepTime} prep · ${meal.cookTime} cook</span>
          ${meal.difficulty ? `<span class="meal-tag tag-easy">${meal.difficulty}</span>` : ''}
          ${meal.estimatedCost ? `<span class="meal-tag tag-budget">💰 ${meal.estimatedCost}</span>` : ''}
          ${meal.leftoversNote ? `<span class="meal-tag tag-leftover">♻️ Leftovers</span>` : ''}
        </div>
        <div class="meal-desc">${meal.description || ''}</div>
        ${meal.leftoversNote ? `<div style="margin-top:6px;font-size:0.78rem;color:#3A5FC1">💡 ${meal.leftoversNote}</div>` : ''}
      </div>
      <div class="meal-actions">
        <button class="meal-action-btn" onclick="Menu.swap(${index})">🔄 Swap</button>
        <button class="meal-action-btn" onclick="Recipe.open(${index}, 'menu')">📖 Recipe</button>
        <button class="meal-action-btn primary-action" onclick="Recipe.openCookMode(${index}, 'menu')">👨‍🍳 Cook</button>
      </div>
    `;
    return div;
  },

  // ── RENDER MENU SCREEN ──
  render() {
    const container = document.getElementById('menu-content');
    container.innerHTML = `
      <div class="section-header">
        <div>
          <div class="section-title">This Week's Menu</div>
          <div class="section-sub">${State.currentMenu.length} meals · ${State.servings} servings each</div>
        </div>
        <button class="btn-secondary" onclick="Menu.build()">Rebuild ↺</button>
      </div>
      ${State.weekBudget ? `
        <div class="budget-banner">
          <div class="budget-icon">💰</div>
          <div>
            <div class="budget-label">Estimated Weekly Grocery Cost</div>
            <div class="budget-amount">${State.weekBudget}</div>
          </div>
        </div>` : ''}
    `;
    State.currentMenu.forEach((meal, i) => {
      container.appendChild(this.renderCard(meal, i));
    });
  },

  // ── TOGGLE FAVORITE FROM CARD ──
  toggleFav(index, e) {
    if (e) e.stopPropagation();
    const meal = State.currentMenu[index];
    const nowFav = State.toggleFavorite(meal);
    showToast(nowFav ? '❤️ Saved to favorites!' : 'Removed from favorites');
    this.render();
  }
};
