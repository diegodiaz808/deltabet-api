const API = '/api';
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BGS = {
  home: '/assets/gods-roulette/bg-main.png',
  rounds: ['/assets/gods-roulette/bg-round-1.png', '/assets/gods-roulette/bg-round-2.png', '/assets/gods-roulette/bg-round-3.png'],
};

let match = null;

const $ = (id) => document.getElementById(id);
const show = (id) => {
  ['view-round-intro', 'view-spin', 'view-challenge', 'view-scoreboard', 'view-winner'].forEach((v) =>
    $(v).classList.toggle('hidden', v !== id)
  );
};

function setBg(url) {
  $('bg').style.backgroundImage = `url('${url}')`;
}

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
  if ($('player-list').children.length >= 4) return;
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
setBg(BGS.home);

$('start').onclick = async () => {
  const players = [...$('player-list').querySelectorAll('input')].map((i) => i.value.trim()).filter(Boolean);
  try {
    match = await api('/matches', { game: 'gods-roulette', players });
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
}

function fmtX(v) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(3)}X`;
}

function render() {
  setBg(match.phase === 'finished' ? BGS.home : BGS.rounds[match.round - 1]);
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
  match = await api(`/matches/${match.id}/spin`, {});
  render();
};

function renderChallenge() {
  const c = match.turn.challenge;
  const pre = match.phase === 'balance-pre';
  const es = document.documentElement.lang === 'es';
  $('challenge-title').textContent = es ? 'TU APUESTA' : 'YOUR BET';
  $('board').innerHTML = boardSVG(c.bets);
  $('bets-text').textContent = `${c.labels.join(' · ')} — riesgo ${{ safe: 'bajo', mid: 'medio', risky: 'alto' }[c.tier]}`;
  $('tiradas-card').innerHTML = `<span>${c.tiradas} tiradas</span>`;
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

// ---------- Paño de ruleta (SVG por código) ----------
const W = 44, H = 38, GX = 38, GY = 6;

function cellOf(n) {
  const col = Math.ceil(n / 3) - 1;
  const row = 2 - ((n - 1) % 3);
  return { x: GX + col * W, y: GY + row * H };
}

function ctr(n) {
  if (n === 0) return { x: GX / 2 + 3, y: GY + 1.5 * H };
  const c = cellOf(n);
  return { x: c.x + W / 2, y: c.y + H / 2 };
}

function chipPos(b) {
  if (b.type === 'straight') return ctr(b.nums[0]);
  if (b.type === 'split') {
    const a = ctr(b.nums[0]), c = ctr(b.nums[1]);
    return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  }
  if (b.type === 'corner') {
    const a = ctr(b.nums[0]), c = ctr(b.nums[3]);
    return { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  }
  if (b.type === 'street') {
    const c = cellOf(b.nums[0]);
    return { x: c.x + W / 2, y: GY + 3 * H };
  }
  if (b.type === 'dozen') return { x: GX + (b.dozen - 1) * 4 * W + 2 * W, y: GY + 3 * H + 18 };
  const idx = { low: 0, even: 1, red: 2, black: 3, odd: 4, high: 5 }[b.outside];
  return { x: GX + idx * 2 * W + W, y: GY + 3 * H + 52 };
}

function boardSVG(bets) {
  let s = '<svg viewBox="0 0 574 214" style="min-width:560px;display:block" role="img" aria-label="Paño de ruleta con la jugada">';
  s += `<rect x="2" y="${GY}" width="${GX - 4}" height="${3 * H}" rx="4" fill="#1a7a4f"/>`;
  s += `<text x="${GX / 2 + 1}" y="${GY + 1.5 * H + 5}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">0</text>`;
  for (let n = 1; n <= 36; n++) {
    const c = cellOf(n);
    s += `<rect x="${c.x + 1}" y="${c.y + 1}" width="${W - 2}" height="${H - 2}" rx="4" fill="${RED.has(n) ? '#e02020' : '#0d0d0d'}" stroke="#2b2b2b" stroke-width="1"/>`;
    s += `<text x="${c.x + W / 2}" y="${c.y + H / 2 + 5}" text-anchor="middle" fill="#fff" font-size="14" font-weight="800">${n}</text>`;
  }
  const dz = ['1ª docena', '2ª docena', '3ª docena'];
  for (let d = 0; d < 3; d++) {
    const x = GX + d * 4 * W;
    s += `<rect x="${x + 1}" y="${GY + 3 * H + 3}" width="${4 * W - 2}" height="30" rx="4" fill="#1c1c1c" stroke="#2b2b2b"/>`;
    s += `<text x="${x + 2 * W}" y="${GY + 3 * H + 23}" text-anchor="middle" fill="#ddd" font-size="12" font-weight="700">${dz[d]}</text>`;
  }
  const out = [['low', '1–18'], ['even', 'PAR'], ['red', 'ROJO'], ['black', 'NEGRO'], ['odd', 'IMPAR'], ['high', '19–36']];
  for (let i = 0; i < 6; i++) {
    const x = GX + i * 2 * W;
    const fill = out[i][0] === 'red' ? '#e02020' : out[i][0] === 'black' ? '#0d0d0d' : '#1c1c1c';
    s += `<rect x="${x + 1}" y="${GY + 3 * H + 37}" width="${2 * W - 2}" height="30" rx="4" fill="${fill}" stroke="#2b2b2b"/>`;
    s += `<text x="${x + W}" y="${GY + 3 * H + 57}" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">${out[i][1]}</text>`;
  }
  for (const b of bets) {
    const p = chipPos(b);
    s += `<circle cx="${p.x}" cy="${p.y}" r="9" fill="#2fbf2f" stroke="#e8ffe8" stroke-width="2"/>`;
    s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" fill="#0a3d0a" font-size="11" font-weight="800">♣</text>`;
  }
  return s + '</svg>';
}
