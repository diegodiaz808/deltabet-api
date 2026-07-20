// Motor de torneo DeltaBet: partidas por turnos con challenge sorteado,
// snapshot de balance pre/post y scoring por rendimiento porcentual.
// Un solo motor; cada juego aporta su generador de challenges (games/*).

const crypto = require('crypto');
const { generateJugada, betLabel } = require('./roulette');
const magicIsland = require('../data/magic-island.json');
const vsChat = require('../data/vs-chat.json');

const matches = new Map();
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const GAMES = {
  'gods-roulette': {
    name: "God's Roulette",
    rounds: 3,
    generateChallenge() {
      const tier = ['safe', 'mid', 'risky'][Math.floor(Math.random() * 3)];
      const bets = generateJugada(tier);
      return {
        kind: 'roulette',
        tier,
        bets,
        labels: bets.map(betLabel),
        tiradas: [3, 4, 5][Math.floor(Math.random() * 3)],
      };
    },
  },
  'magic-island': {
    name: 'Magic Island',
    rounds: 4,
    generateChallenge() {
      return {
        kind: 'slot-challenge',
        challenge: pick(magicIsland.challenges),
        slot: pick(magicIsland.slots),
      };
    },
  },
  'vs-chat': {
    name: 'VS Chat',
    rounds: 3,
    minPlayers: 2,
    maxPlayers: 2,
    generateChallenge(m) {
      const side = m.turnIdx === 0 ? 'streamer' : 'chat';
      return {
        kind: 'slot-challenge',
        side,
        challenge: pick(vsChat[side][m.lang] || vsChat[side].es),
        slot: pick(vsChat.slots),
      };
    },
  },
};

function publicState(m) {
  return {
    id: m.id,
    game: m.game,
    gameName: GAMES[m.game].name,
    roundsTotal: m.roundsTotal,
    round: m.round,
    phase: m.phase,
    lang: m.lang,
    players: m.players.map((p) => ({ name: p.name, total: round3(p.total), scores: p.scores.map(round3) })),
    currentPlayer: m.players[m.turnIdx] ? m.players[m.turnIdx].name : null,
    turn: m.current,
  };
}

function round3(x) {
  return x === null || x === undefined ? x : Math.round(x * 1000) / 1000;
}

function createMatch({ game = 'gods-roulette', players, lang = 'es' }) {
  if (!GAMES[game]) throw httpError(400, `Juego desconocido: ${game}`);
  const min = GAMES[game].minPlayers || MIN_PLAYERS;
  const max = GAMES[game].maxPlayers || MAX_PLAYERS;
  if (!Array.isArray(players) || players.length < min) throw httpError(400, `Se necesitan al menos ${min} jugadores`);
  if (players.length > max) throw httpError(400, `Máximo ${max} jugadores`);
  const m = {
    id: crypto.randomBytes(5).toString('hex'),
    game,
    lang: lang === 'en' ? 'en' : 'es',
    roundsTotal: GAMES[game].rounds,
    round: 1,
    turnIdx: 0,
    phase: 'round-intro',
    players: players.map((name) => ({ name: String(name).slice(0, 30), total: 0, scores: [] })),
    current: null,
  };
  matches.set(m.id, m);
  return publicState(m);
}

function getMatch(id) {
  const m = matches.get(id);
  if (!m) throw httpError(404, 'Partida no encontrada');
  return m;
}

function spin(id) {
  const m = getMatch(id);
  if (m.phase !== 'round-intro' && m.phase !== 'spin') throw httpError(409, `No se puede girar en fase ${m.phase}`);
  m.current = { challenge: GAMES[m.game].generateChallenge(m), pre: null, post: null, score: null };
  m.phase = 'balance-pre';
  return publicState(m);
}

function submitBalance(id, { phase, amount }) {
  const m = getMatch(id);
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) throw httpError(400, 'Balance inválido');
  if (phase === 'pre') {
    if (m.phase !== 'balance-pre') throw httpError(409, `Fase actual: ${m.phase}`);
    if (value === 0) throw httpError(400, 'El balance previo no puede ser 0');
    m.current.pre = value;
    m.phase = 'balance-post';
  } else if (phase === 'post') {
    if (m.phase !== 'balance-post') throw httpError(409, `Fase actual: ${m.phase}`);
    m.current.post = value;
    m.current.score = (value - m.current.pre) / m.current.pre;
    const p = m.players[m.turnIdx];
    p.scores.push(m.current.score);
    p.total += m.current.score;
    m.phase = 'scoreboard';
  } else {
    throw httpError(400, 'phase debe ser pre o post');
  }
  return publicState(m);
}

function advance(id) {
  const m = getMatch(id);
  if (m.phase !== 'scoreboard') throw httpError(409, `Fase actual: ${m.phase}`);
  m.current = null;
  if (m.turnIdx < m.players.length - 1) {
    m.turnIdx += 1;
    m.phase = 'spin';
  } else if (m.round < m.roundsTotal) {
    m.round += 1;
    m.turnIdx = 0;
    m.phase = 'round-intro';
  } else {
    m.phase = 'finished';
    const best = Math.max(...m.players.map((p) => p.total));
    m.winner = m.players.filter((p) => p.total === best).map((p) => p.name);
  }
  const state = publicState(m);
  if (m.winner) state.winner = m.winner;
  return state;
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

module.exports = { createMatch, getMatch, publicState, spin, submitBalance, advance };
