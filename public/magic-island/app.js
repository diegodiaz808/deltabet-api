const API = '/api';
const MAX_PLAYERS = 4;
const BG = '/assets/magic-island/bg-island.png';

let match = null;

const $ = (id) => document.getElementById(id);
const show = (id) => {
  ['view-round-intro', 'view-spin', 'view-challenge', 'view-scoreboard', 'view-winner'].forEach((v) =>
    $(v).classList.toggle('hidden', v !== id)
  );
};

async function api(path, body) {
  const res = await fetch(API + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

// ---------- Home ----------
function playerRow(value) {
  if ($('player-list').children.length >= MAX_PLAYERS) return;
  const div = document.createElement('div');
  div.className = 'pp-row';
  div.innerHTML = `<div class="name-cell"><input type="text" value="${value}" maxlength="30" /><span class="edit">✎</span><button class="rm" title="Quitar">✕</button></div><span class="admin">Admin.</span>`;
  div.querySelector('.rm').onclick = () => {
    if ($('player-list').children.length > 2) div.remove();
  };
  $('player-list').appendChild(div);
}

$('add-player').onclick = () => playerRow(`Jugador ${$('player-list').children.length + 1}`);
function setInstructions(open) {
  $('instructions').classList.toggle('open', open);
  $('instructions').setAttribute('aria-hidden', String(!open));
}
$('btn-instructions').onclick = () => setInstructions(!$('instructions').classList.contains('open'));
document.querySelector('.instructions-close').onclick = () => setInstructions(false);
playerRow('Jugador 1');
playerRow('Jugador 2');
$('bg').style.backgroundImage = `url('${BG}')`;

$('start').onclick = async () => {
  const players = [...$('player-list').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean);
  try {
    match = await api('/matches', { game: 'magic-island', players });
  } catch (e) {
    return alert(e.message);
  }
  $('screen-home').classList.add('hidden');
  $('screen-game').classList.remove('hidden');
  render();
};

// ---------- Game ----------
function renderCheckpoints() {
  const el = $('checkpoints');
  el.innerHTML = '';
  for (let r = 1; r <= match.roundsTotal; r++) {
    if (r > 1) {
      const link = document.createElement('div');
      link.className = 'cp-link' + (r <= match.round ? ' done' : '');
      el.appendChild(link);
    }
    const cp = document.createElement('div');
    const state = r < match.round ? 'off' : r === match.round ? 'current' : 'lit';
    cp.className = `cp ${state}`;
    cp.textContent = r;
    el.appendChild(cp);
  }
  const link = document.createElement('div');
  link.className = 'cp-link';
  el.appendChild(link);
  const trophy = document.createElement('div');
  trophy.className = 'cp trophy ' + (match.phase === 'finished' ? 'current' : 'lit');
  trophy.textContent = '🏆';
  el.appendChild(trophy);
}

function fmtX(v) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(3)}X`;
}

function render() {
  renderCheckpoints();
  $('turn-banner').textContent =
    match.phase === 'finished' ? 'PARTIDA TERMINADA' : `Turno de ${match.currentPlayer} — Round ${match.round}`;

  if (match.phase === 'round-intro') {
    $('round-title').textContent = `Round ${match.round}`;
    show('view-round-intro');
  } else if (match.phase === 'spin') {
    show('view-spin');
  } else if (match.phase === 'balance-pre' || match.phase === 'balance-post') {
    renderChallenge();
    show('view-challenge');
  } else if (match.phase === 'scoreboard') {
    renderScores();
    show('view-scoreboard');
  } else if (match.phase === 'finished') {
    renderWinner();
    show('view-winner');
  }
}

$('btn-to-spin').onclick = () => show('view-spin');

$('btn-spin').onclick = async () => {
  const panel = $('island-spin-panel');
  const button = $('btn-spin');
  if (panel.classList.contains('is-spinning')) return;
  panel.classList.add('is-spinning');
  button.disabled = true;
  await new Promise((resolve) => setTimeout(resolve, 850));
  try {
    match = await api(`/matches/${match.id}/spin`, {});
    render();
  } catch (e) {
    panel.classList.remove('is-spinning');
    button.disabled = false;
    return alert(e.message);
  }
  panel.classList.remove('is-spinning');
  button.disabled = false;
};

function renderChallenge() {
  const c = match.turn.challenge;
  const pre = match.phase === 'balance-pre';
  const es = document.documentElement.lang === 'es';
  $('challenge-title').textContent = es ? 'TU MISIÓN DE LA ISLA' : 'YOUR ISLAND MISSION';
  $('slot-card').textContent = c.slot;
  $('challenge-card').textContent = c.challenge;
  $('tab-pre').className = 'tab' + (pre ? ' active-pre' : ' completed');
  $('tab-post').className = 'tab' + (!pre ? ' active-post' : '');
  $('balance-zone').dataset.phase = pre ? 'pre' : 'post';
  $('balance-label').textContent = pre
    ? 'Ingresa tu balance antes de hacer el desafio'
    : 'Ingresa tu balance despues de hacer el desafio';
  $('btn-balance').textContent = pre
    ? (es ? 'Guardar balance previo' : 'Save balance before')
    : (es ? 'Calcular rendimiento' : 'Calculate performance');
  $('balance-input').value = '';
  $('balance-input').focus();
}

$('btn-balance').onclick = async () => {
  const phase = match.phase === 'balance-pre' ? 'pre' : 'post';
  try {
    match = await api(`/matches/${match.id}/balance`, { phase, amount: $('balance-input').value });
  } catch (e) {
    return alert(e.message);
  }
  render();
};

function renderScores() {
  $('score-rows').innerHTML = match.players.slice().sort((a,b)=>b.total-a.total)
    .map((p) => {
      const last = p.scores.length ? p.scores[p.scores.length - 1] : null;
      const cls = (v) => (v === null ? '' : v < 0 ? 'neg' : 'pos');
      return `<tr><td>${p.name}</td><td class="${cls(last)}">${last === null ? '—' : fmtX(last)}</td><td class="${cls(p.total)}">${fmtX(p.total)}</td></tr>`;
    })
    .join('');
}

function renderWinner() {
  $('winner-name').textContent = match.winner.join(' y ');
  $('final-rows').innerHTML = match.players
    .slice()
    .sort((a, b) => b.total - a.total)
    .map((p) => `<tr><td>${p.name}</td><td class="${p.total < 0 ? 'neg' : 'pos'}">${fmtX(p.total)}</td></tr>`)
    .join('');
}

$('btn-advance').onclick = async () => {
  match = await api(`/matches/${match.id}/advance`, {});
  render();
};
