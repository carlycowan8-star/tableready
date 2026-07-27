/* ══════════════════════════════
   UTILS.JS — Shared helpers used across modules
   Add generic helpers here. Keep module-specific logic in its own file.
   ══════════════════════════════ */

// ── TOAST ──
let _toastTimeout;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimeout);
  _toastTimeout = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── LOADING ──
function showLoading(text = 'Loading…', sub = '') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-sub').textContent = sub;
  document.getElementById('loading').classList.add('visible');
  const fill = document.querySelector('.loading-bar-fill');
  fill.style.animation = 'none';
  requestAnimationFrame(() => { fill.style.animation = 'load 4s ease-in-out forwards'; });
}
function hideLoading() {
  document.getElementById('loading').classList.remove('visible');
}

// ── MEAL EMOJI ──
function getMealEmoji(mealName) {
  const n = (mealName || '').toLowerCase();
  if (n.includes('chicken')) return '🍗';
  if (n.includes('beef') || n.includes('steak') || n.includes('burger')) return '🥩';
  if (n.includes('salmon') || n.includes('tuna') || n.includes('shrimp') || n.includes('fish')) return '🐟';
  if (n.includes('pasta') || n.includes('spaghetti') || n.includes('lasagna') || n.includes('penne')) return '🍝';
  if (n.includes('soup') || n.includes('stew') || n.includes('chili')) return '🍲';
  if (n.includes('salad')) return '🥗';
  if (n.includes('taco') || n.includes('burrito') || n.includes('enchilada') || n.includes('fajita')) return '🌮';
  if (n.includes('pizza')) return '🍕';
  if (n.includes('fried rice') || n.includes('rice bowl')) return '🍚';
  if (n.includes('pork') || n.includes('bacon') || n.includes('ham')) return '🥓';
  if (n.includes('veggie') || n.includes('vegetable') || n.includes('tofu') || n.includes('lentil')) return '🥦';
  if (n.includes('curry')) return '🍛';
  if (n.includes('sandwich') || n.includes('wrap') || n.includes('sub')) return '🥪';
  if (n.includes('egg') || n.includes('frittata') || n.includes('omelette')) return '🍳';
  if (n.includes('lamb') || n.includes('kebab')) return '🍖';
  if (n.includes('turkey')) return '🦃';
  if (n.includes('noodle') || n.includes('ramen') || n.includes('pho')) return '🍜';
  return '🍽️';
}

// ── TIMER FORMAT ──
function formatTimer(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return sec > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${m} min`;
}

// ── API CALL ──
async function callClaude(prompt, maxTokens = 2000) {
  const response = await fetch('/.netlify/functions/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.details || data.error);
  const textBlock = data.content?.find(b => b.type === 'text');
  if (!textBlock) throw new Error('No text content in response');
  const text = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}
