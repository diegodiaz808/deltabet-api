const API = '/api';
const BGS = {
  home: '/assets/vs-chat/bg-main-v2.png',
  rounds: [
    '/assets/vs-chat/bg-round-1-v2.png',
    '/assets/vs-chat/bg-round-2-v2.png',
    '/assets/vs-chat/bg-round-3-v2.png',
  ],
};

let match = null;
let lang = 'en';

const COPY = {
  es: {
    tagline: 'EL STREAMER CONTRA SU CHAT — ¿QUIÉN ES EL MAESTRO DE LOS SLOTS?',
    play: 'Jugar', instructionsButton: 'Instrucciones', more: 'Más juegos', next: 'Siguiente',
    spin: 'Girar', send: 'Enviar', saveBefore: 'Guardar balance previo', calculate: 'Calcular rendimiento', challengeHeading: 'TU DESAFÍO', round: 'Round', turn: 'Turno del', finished: 'PARTIDA TERMINADA',
    streamer: 'STREAMER', chat: 'CHAT', got: '¡OBTUVISTE TU DESAFÍO! INGRESÁ TU BALANCE ANTES DE JUGAR',
    played: '¿YA JUGASTE? INGRESÁ TU BALANCE POSTERIOR', before: 'Ingresá tu balance antes de hacer el desafío',
    after: 'Ingresá tu balance después de hacer el desafío',
    players: 'JUGADORES', info: 'INFO', fixedSides: 'Siempre 2 lados: el streamer y su chat',
    pre: 'BALANCE PREVIO', post: 'BALANCE POSTERIOR', sideCol: 'Lado', balanceCol: 'Balance', totalCol: 'Balance total',
    master: 'EL MAESTRO DE LOS SLOTS ES', replay: 'Jugar de nuevo',
    instructionsTitle: 'INSTRUCCIONES', close: 'Cerrar',
    instructions: [
      '1. Se juega en vivo: el STREAMER contra su CHAT, por turnos. Cada lado tiene su propio mazo de desafíos.',
      '2. En el turno del streamer, la condición es sobre él. En el turno del chat, la condición es sobre el chat: el chat decide su destino.',
      '3. Cada turno: girá para obtener slot + desafío, ingresá el balance, jugá los giros en vivo e ingresá el balance posterior.',
      '4. Son 3 rounds. Gana el lado con mejor rendimiento acumulado, aunque ambos pierdan.',
    ],
    disclaimer: 'Al hacer clic en JUGAR aceptás que ni DeltaBet.xyz ni VS Chat se hacen cargo de tus pérdidas o ganancias. Si no querés perder dinero, te recomendamos jugar slots de prueba.',
  },
  en: {
    tagline: 'THE STREAMER VS THEIR CHAT — WHO IS THE MASTER OF SLOTS?',
    play: 'Play', instructionsButton: 'Instructions', more: 'More games', next: 'Next',
    spin: 'Spin', send: 'Submit', saveBefore: 'Save balance before', calculate: 'Calculate performance', challengeHeading: 'YOUR CHALLENGE', round: 'Round', turn: 'Turn for', finished: 'MATCH FINISHED',
    streamer: 'STREAMER', chat: 'CHAT', got: 'YOU GOT YOUR CHALLENGE! ENTER YOUR BALANCE BEFORE PLAYING',
    played: 'DONE PLAYING? ENTER YOUR BALANCE AFTER PLAYING', before: 'Enter your balance before completing the challenge',
    after: 'Enter your balance after completing the challenge',
    players: 'PLAYERS', info: 'INFO', fixedSides: 'Always 2 sides: the streamer and their chat',
    pre: 'BALANCE BEFORE', post: 'BALANCE AFTER', sideCol: 'Side', balanceCol: 'Balance', totalCol: 'Total balance',
    master: 'THE MASTER OF SLOTS IS', replay: 'Play again',
    instructionsTitle: 'INSTRUCTIONS', close: 'Close',
    instructions: [
      '1. The STREAMER plays live against their CHAT, taking turns. Each side has its own challenge deck.',
      '2. Streamer challenges depend on the streamer. Chat challenges depend on the audience: the chat decides its fate.',
      '3. Each turn: spin for a slot + challenge, enter the balance, play the spins live, then enter the final balance.',
      '4. There are 3 rounds. The side with the best cumulative performance wins, even if both sides lose.',
    ],
    disclaimer: 'By clicking PLAY, you accept that neither DeltaBet.xyz nor VS Chat is responsible for your wins or losses. Use demo slots if you do not want to risk money.',
  },
};

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

setBg(BGS.home);
function setInstructions(open) {
  $('instructions').classList.toggle('open', open);
  $('instructions').setAttribute('aria-hidden', String(!open));
  $('btn-instructions').setAttribute('aria-expanded', String(open));
}

$('btn-instructions').setAttribute('aria-controls', 'instructions');
$('btn-instructions').setAttribute('aria-expanded', 'false');
$('btn-instructions').onclick = () => setInstructions(!$('instructions').classList.contains('open'));
$('instructions-close').onclick = () => setInstructions(false);

function setLanguage(nextLang) {
  lang = nextLang;
  document.documentElement.lang = lang;
  $('lang-es').classList.toggle('active', lang === 'es');
  $('lang-en').classList.toggle('active', lang === 'en');
  $('home-tagline').textContent = COPY[lang].tagline;
  $('start').textContent = COPY[lang].play;
  $('btn-instructions').textContent = COPY[lang].instructionsButton;
  $('more-games').textContent = COPY[lang].more;
  $('btn-to-spin').textContent = COPY[lang].next;
  $('btn-spin').textContent = COPY[lang].spin;
  $('btn-balance').textContent = COPY[lang].send;
  $('btn-advance').textContent = COPY[lang].next;
  const head = document.querySelectorAll('.pp-head span');
  head[0].textContent = COPY[lang].players;
  head[1].textContent = COPY[lang].info;
  document.querySelector('.pp-foot').textContent = COPY[lang].fixedSides;
  $('tab-pre').textContent = COPY[lang].pre;
  $('tab-post').textContent = COPY[lang].post;
  const scoreHeads = document.querySelectorAll('#view-scoreboard th');
  scoreHeads[0].textContent = COPY[lang].sideCol;
  scoreHeads[1].textContent = COPY[lang].balanceCol;
  scoreHeads[2].textContent = COPY[lang].totalCol;
  const finalHeads = document.querySelectorAll('#view-winner th');
  finalHeads[0].textContent = COPY[lang].sideCol;
  finalHeads[1].textContent = COPY[lang].totalCol;
  document.querySelector('#view-winner .tagline').textContent = COPY[lang].master;
  document.querySelector('#view-winner button').textContent = COPY[lang].replay;
  $('instructions-title').textContent = COPY[lang].instructionsTitle;
  COPY[lang].instructions.forEach((line, i) => { $(`instruction-${i + 1}`).textContent = line; });
  $('instructions-close').textContent = COPY[lang].close;
  $('disclaimer').textContent = COPY[lang].disclaimer;
}

$('lang-es').onclick = () => setLanguage('es');
$('lang-en').onclick = () => setLanguage('en');
setLanguage('en');

$('start').onclick = async () => {
  const players = [$('streamer-name').value.trim() || 'Streamer', $('chat-name').value.trim() || 'Chat'];
  try {
    match = await api('/matches', { game: 'vs-chat', players, lang });
  } catch (e) {
    return alert(e.message);
  }
  $('screen-home').classList.add('hidden');
  $('screen-game').classList.remove('hidden');
  render();
};

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

function sideOfCurrent() {
  return match.players[0].name === match.currentPlayer ? 'streamer' : 'chat';
}

function render() {
  setBg(match.phase === 'finished' ? BGS.home : BGS.rounds[match.round - 1]);
  renderCheckpoints();
  const side = sideOfCurrent() === 'streamer' ? COPY[lang].streamer : COPY[lang].chat;
  $('turn-banner').textContent =
    match.phase === 'finished' ? COPY[lang].finished : `${COPY[lang].turn} ${side}: ${match.currentPlayer} — ${COPY[lang].round} ${match.round}`;

  if (match.phase === 'round-intro') {
    $('round-title').textContent = `${COPY[lang].round} ${match.round}`;
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
  $('challenge-title').textContent = COPY[lang].challengeHeading;
  $('slot-card').textContent = c.slot;
  $('challenge-card').textContent = c.challenge;
  $('challenge-card').className = `challenge-card turn-${c.side}`;
  $('tab-pre').className = 'tab' + (pre ? ' active-pre' : ' completed');
  $('tab-post').className = 'tab' + (!pre ? ' active-post' : '');
  $('balance-zone').dataset.phase = pre ? 'pre' : 'post';
  $('balance-label').textContent = pre
    ? COPY[lang].before
    : COPY[lang].after;
  $('btn-balance').textContent = pre ? COPY[lang].saveBefore : COPY[lang].calculate;
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
  $('score-rows').innerHTML = match.players.map((p,playerIndex)=>({ ...p, playerIndex })).sort((a,b)=>b.total-a.total)
    .map((p) => {
      const last = p.scores.length ? p.scores[p.scores.length - 1] : null;
      const cls = (v) => (v === null ? '' : v < 0 ? 'neg' : 'pos');
      const sideCls = p.playerIndex === 0 ? 'side-streamer' : 'side-chat';
      return `<tr><td class="${sideCls}">${p.name}</td><td class="${cls(last)}">${last === null ? '—' : fmtX(last)}</td><td class="${cls(p.total)}">${fmtX(p.total)}</td></tr>`;
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
