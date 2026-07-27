/* ══════════════════════════════
   RECIPE.JS — Recipe screen, cook mode, step timers
   To add a new recipe tab: add it to renderTabs() and create a renderPanel_X() function
   ══════════════════════════════ */

const Recipe = {
  _timerInterval: null,

  // ── OPEN RECIPE ──
  open(index, source) {
    State.recipeSource = source || 'menu';
    State.currentRecipeIndex = index;
    State.currentRecipe = source === 'favorites' ? State.favorites[index] : State.currentMenu[index];
    this.render();
    showScreen('screen-recipe');
  },

  // ── RENDER RECIPE SCREEN ──
  render() {
    const meal = State.currentRecipe;
    const index = State.currentRecipeIndex;
    const source = State.recipeSource;
    const isFav = State.isFavorite(meal.meal);
    const emoji = getMealEmoji(meal.meal);

    document.getElementById('recipe-content').innerHTML = `
      <div class="recipe-hero">
        <div class="recipe-hero-img-placeholder">${emoji}</div>
        <div class="recipe-hero-overlay">
          <button class="recipe-back" onclick="showScreen('screen-${source === 'favorites' ? 'favorites' : 'menu'}')">← Back</button>
          <div class="recipe-title-row">
            <div class="recipe-title">${meal.meal}</div>
            <button class="recipe-fav-btn" onclick="Recipe.toggleFav(${index}, '${source}')">${isFav ? '❤️' : '🤍'}</button>
          </div>
          <div class="recipe-meta-row">
            <div class="recipe-meta-item"><span class="recipe-meta-label">Prep</span><span class="recipe-meta-value">${meal.prepTime}</span></div>
            <div class="recipe-meta-item"><span class="recipe-meta-label">Cook</span><span class="recipe-meta-value">${meal.cookTime}</span></div>
            <div class="recipe-meta-item"><span class="recipe-meta-label">Serves</span><span class="recipe-meta-value">${meal.servings || State.servings}</span></div>
            <div class="recipe-meta-item"><span class="recipe-meta-label">Cost</span><span class="recipe-meta-value">${meal.estimatedCost || '–'}</span></div>
          </div>
        </div>
      </div>

      <div style="display:flex;gap:8px;padding:14px 16px 4px;">
        <button class="btn-secondary" style="flex:1" onclick="Recipe.openCookMode(${index}, '${source}')">👨‍🍳 Start Cooking</button>
        ${source === 'menu' ? `<button class="btn-secondary" style="flex:1" onclick="Menu.swap(${index});showScreen('screen-menu')">🔄 Swap</button>` : ''}
      </div>

      <div class="recipe-tabs">
        <div class="recipe-tab active" onclick="Recipe.showTab('ingredients', this)">Ingredients</div>
        <div class="recipe-tab" onclick="Recipe.showTab('steps', this)">Steps</div>
        <div class="recipe-tab" onclick="Recipe.showTab('nutrition', this)">Nutrition</div>
        <div class="recipe-tab" onclick="Recipe.showTab('tips', this)">Tips</div>
      </div>

      ${this.renderPanel_Ingredients(meal)}
      ${this.renderPanel_Steps(meal)}
      ${this.renderPanel_Nutrition(meal)}
      ${this.renderPanel_Tips(meal)}
    `;
  },

  // ── TAB PANELS ──
  // To add a new tab: add a button in render() and create renderPanel_X() here

  renderPanel_Ingredients(meal) {
    return `<div class="recipe-panel active" id="rp-ingredients">
      ${(meal.ingredients || []).map(ing => `
        <div class="ingredient-row">
          <div class="ingredient-qty">${ing.qty}</div>
          <div style="flex:1">
            <div class="ingredient-name">${ing.name}</div>
            ${ing.detail ? `<div class="ingredient-note">${ing.detail}</div>` : ''}
            ${ing.sub ? `<div class="sub-card">🔄 Sub: ${ing.sub}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
  },

  renderPanel_Steps(meal) {
    return `<div class="recipe-panel" id="rp-steps">
      ${(meal.steps || []).map((s, i) => `
        <div class="step-item">
          <div class="step-num">${i + 1}</div>
          <div class="step-text">${s.text}
            ${s.timer ? `<div><button class="step-timer" onclick="Recipe.startTimer(${s.timer})">⏱ Start ${formatTimer(s.timer)} timer</button></div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
  },

  renderPanel_Nutrition(meal) {
    return `<div class="recipe-panel" id="rp-nutrition">
      <div style="padding:16px 0 8px;font-size:0.8rem;color:var(--text-light)">Per serving</div>
      <div class="nutrition-grid">
        <div class="nutrition-item"><div class="nutrition-value">${meal.nutrition?.calories || '–'}</div><div class="nutrition-label">Calories</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${meal.nutrition?.protein || '–'}</div><div class="nutrition-label">Protein</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${meal.nutrition?.carbs || '–'}</div><div class="nutrition-label">Carbs</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${meal.nutrition?.fat || '–'}</div><div class="nutrition-label">Fat</div></div>
        <div class="nutrition-item"><div class="nutrition-value">${meal.nutrition?.fiber || '–'}</div><div class="nutrition-label">Fiber</div></div>
      </div>
      ${meal.serving ? `<div class="tip-card"><p>🍽️ <strong>Serving:</strong> ${meal.serving}</p></div>` : ''}
    </div>`;
  },

  renderPanel_Tips(meal) {
    return `<div class="recipe-panel" id="rp-tips">
      ${(meal.tips || ['No additional tips.']).map(tip => `<div class="tip-card"><p>💡 ${tip}</p></div>`).join('')}
      ${meal.leftoversNote ? `<div class="tip-card"><p>♻️ <strong>Leftovers:</strong> ${meal.leftoversNote}</p></div>` : ''}
    </div>`;
  },

  showTab(name, el) {
    document.querySelectorAll('.recipe-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.recipe-panel').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('rp-' + name).classList.add('active');
  },

  // ── FAVORITES ──
  toggleFav(index, source) {
    const meal = source === 'favorites' ? State.favorites[index] : State.currentMenu[index];
    const nowFav = State.toggleFavorite(meal);
    showToast(nowFav ? '❤️ Saved!' : 'Removed from favorites');
    this.render();
    if (State.currentMenu.length) Menu.render();
  },

  // ── COOK MODE ──
  openCookMode(index, source) {
    State.currentRecipe = source === 'favorites' ? State.favorites[index] : State.currentMenu[index];
    State.currentRecipeIndex = index;
    State.recipeSource = source;
    State.cookStep = 0;
    this.renderCookStep();
    document.getElementById('cook-mode').classList.add('visible');
    document.getElementById('cook-recipe-name').textContent = State.currentRecipe.meal;
  },

  closeCookMode() {
    document.getElementById('cook-mode').classList.remove('visible');
  },

  renderCookStep() {
    const steps = State.currentRecipe.steps || [];
    const step = steps[State.cookStep];
    const total = steps.length;
    document.getElementById('cook-step-counter').textContent = `${State.cookStep + 1} / ${total}`;
    document.getElementById('cook-step-label').textContent = `Step ${State.cookStep + 1} of ${total}`;
    document.getElementById('cook-step-text').textContent = step.text;
    document.getElementById('cook-progress').style.width = `${((State.cookStep + 1) / total) * 100}%`;
    const timerBtn = document.getElementById('cook-timer-btn');
    if (step.timer) { timerBtn.textContent = `⏱ Start ${formatTimer(step.timer)} timer`; timerBtn.classList.add('visible'); }
    else { timerBtn.classList.remove('visible'); }
    document.getElementById('cook-next-btn').textContent = State.cookStep === total - 1 ? '🎉 Done!' : 'Next →';
  },

  cookNav(delta) {
    const steps = State.currentRecipe.steps || [];
    if (State.cookStep + delta < 0) return;
    if (State.cookStep + delta >= steps.length) { this.closeCookMode(); showToast('🎉 Enjoy your meal!'); return; }
    State.cookStep += delta;
    this.renderCookStep();
  },

  startCookTimer() {
    const step = (State.currentRecipe.steps || [])[State.cookStep];
    if (step?.timer) this.startTimer(step.timer);
  },

  startTimer(seconds) {
    if (this._timerInterval) clearInterval(this._timerInterval);
    let remaining = seconds;
    showToast(`⏱ ${formatTimer(remaining)} started`);
    this._timerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) { clearInterval(this._timerInterval); showToast('⏰ Timer done!'); }
    }, 1000);
  }
};
