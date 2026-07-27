/* ══════════════════════════════
   NAV.JS — Screen switching, tab bar management
   To add a new screen: add it to TAB_ORDER and create the screen HTML in index.html
   ══════════════════════════════ */

const TAB_ORDER = ['menu', 'shopping', 'favorites', 'pantry'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function switchTab(tab) {
  const screenMap = {
    menu: 'screen-menu',
    shopping: 'screen-shopping',
    favorites: 'screen-favorites',
    pantry: 'screen-pantry'
  };

  showScreen(screenMap[tab]);

  // Sync all tab bars on the page
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab').forEach((t, i) => {
      t.classList.toggle('active', TAB_ORDER[i] === tab);
    });
  });

  // Trigger render for tabs that need it
  if (tab === 'favorites') Favorites.render();
}
