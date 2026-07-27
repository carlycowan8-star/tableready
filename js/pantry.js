/* ══════════════════════════════
   PANTRY.JS — Pantry items, add/remove
   ══════════════════════════════ */

const Pantry = {

  render() {
    const list = document.getElementById('pantry-list');
    if (!State.pantryItems.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">🥫</div><div class="empty-title">Pantry is empty</div><div class="empty-sub">Add items you already have and they'll be excluded from your shopping list.</div></div>`;
      return;
    }
    list.innerHTML = State.pantryItems.map((item, i) => `
      <div class="pantry-item">
        <span class="pantry-icon">🫙</span>
        <span class="pantry-name">${item.name}</span>
        <button class="pantry-remove" onclick="Pantry.remove(${i})">✕</button>
      </div>`).join('');
  },

  add() {
    const input = document.getElementById('pantry-input');
    const val = input.value.trim();
    if (!val) return;
    State.pantryItems.push({ name: val });
    State.savePantry();
    input.value = '';
    this.render();
    showToast(`Added: ${val}`);
  },

  remove(index) {
    State.pantryItems.splice(index, 1);
    State.savePantry();
    this.render();
  }
};
