/* ══════════════════════════════
   SHOPPING.JS — Shopping list, check off, share
   To add new groupings: update SECTION_ORDER and SECTION_ICONS
   ══════════════════════════════ */

const Shopping = {

  SECTION_ORDER: ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry', 'Grains & Bread', 'Frozen', 'Canned Goods', 'Spices & Seasonings', 'Other'],
  SECTION_ICONS: { 'Produce': '🥦', 'Meat & Seafood': '🥩', 'Dairy & Eggs': '🥛', 'Pantry': '🫙', 'Grains & Bread': '🍞', 'Frozen': '❄️', 'Canned Goods': '🥫', 'Spices & Seasonings': '🧂', 'Other': '📦' },

  // ── CONSOLIDATE INGREDIENTS ──
  consolidate() {
    const allIngredients = {};
    const pantryNames = State.pantryItems.map(p => p.name.toLowerCase());

    State.currentMenu.forEach(meal => {
      (meal.ingredients || []).forEach(ing => {
        if (pantryNames.some(p => ing.name.toLowerCase().includes(p))) return;
        const key = ing.name.toLowerCase();
        if (!allIngredients[key]) allIngredients[key] = { ...ing, meals: [meal.meal], count: 1 };
        else { allIngredients[key].meals.push(meal.meal); allIngredients[key].count++; }
      });
    });
    return allIngredients;
  },

  // ── RENDER LIST ──
  renderList() {
    const container = document.getElementById('shopping-content');
    if (!State.currentMenu.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><div class="empty-title">No list yet</div><div class="empty-sub">Build your menu first.</div></div>`;
      return;
    }

    const allIngredients = this.consolidate();
    const sections = {};
    Object.values(allIngredients).forEach(ing => {
      const sec = ing.section || 'Other';
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(ing);
    });

    const totalItems = Object.values(allIngredients).length;
    container.innerHTML = `
      <div class="section-header">
        <div>
          <div class="section-title">Shopping List</div>
          <div class="section-sub">${totalItems} items · ${State.currentMenu.length} meals</div>
        </div>
      </div>`;

    const ordered = [...this.SECTION_ORDER.filter(s => sections[s]), ...Object.keys(sections).filter(s => !this.SECTION_ORDER.includes(s))];
    ordered.forEach(secName => {
      container.appendChild(this.renderSection(secName, sections[secName]));
    });
  },

  renderSection(secName, items) {
    const secDiv = document.createElement('div');
    secDiv.className = 'shop-section fade-in';
    secDiv.innerHTML = `
      <div class="shop-section-header">
        <span class="shop-section-icon">${this.SECTION_ICONS[secName] || '📦'}</span>
        <span class="shop-section-name">${secName}</span>
        <span class="shop-section-count">${items.length} item${items.length > 1 ? 's' : ''}</span>
      </div>
      ${items.map(item => this.renderItem(item)).join('')}
    `;
    return secDiv;
  },

  renderItem(item) {
    const id = 'item-' + item.name.replace(/\W/g, '_');
    const isChecked = State.checkedItems.has(id);
    return `
      <div class="shop-item" id="${id}-row">
        <div class="shop-check ${isChecked ? 'checked' : ''}" onclick="Shopping.toggleCheck('${id}')" id="${id}-check">${isChecked ? '✓' : ''}</div>
        <div class="shop-item-info">
          <div class="shop-item-name" style="${isChecked ? 'text-decoration:line-through;opacity:0.5' : ''}">${item.name}</div>
          ${item.detail ? `<div class="shop-item-detail">${item.detail}</div>` : ''}
          ${item.sub ? `<div class="shop-item-sub">🔄 Sub: ${item.sub}</div>` : ''}
          <div class="shop-item-detail" style="margin-top:3px">For: ${item.meals.slice(0, 2).join(', ')}${item.meals.length > 2 ? ` +${item.meals.length - 2} more` : ''}</div>
        </div>
        <div>
          <div class="shop-item-qty">${item.qty}</div>
          ${item.count > 1 ? `<div class="shop-item-meals">×${item.count} meals</div>` : ''}
        </div>
      </div>`;
  },

  // ── CHECK OFF ──
  toggleCheck(id) {
    const check = document.getElementById(id + '-check');
    const row = document.getElementById(id + '-row');
    if (State.checkedItems.has(id)) {
      State.checkedItems.delete(id);
      check.classList.remove('checked'); check.textContent = '';
      row.querySelector('.shop-item-name').style = '';
    } else {
      State.checkedItems.add(id);
      check.classList.add('checked'); check.textContent = '✓';
      row.querySelector('.shop-item-name').style = 'text-decoration:line-through;opacity:0.5';
    }
    State.saveChecked();
  },

  uncheckAll() {
    State.checkedItems.clear();
    State.saveChecked();
    this.renderList();
    showToast('List reset');
  },

  // ── SHARE ──
  share() {
    if (!State.currentMenu.length) { showToast('No shopping list yet'); return; }
    const allIngredients = this.consolidate();
    const lines = Object.values(allIngredients).map(i => `${i.qty} ${i.name}${i.detail ? ' (' + i.detail + ')' : ''}`);
    const text = `🛒 TableReady Shopping List\n\n${lines.join('\n')}`;
    if (navigator.share) {
      navigator.share({ title: 'Shopping List', text });
    } else {
      navigator.clipboard.writeText(text).then(() => showToast('📋 List copied to clipboard!'));
    }
  }
};
