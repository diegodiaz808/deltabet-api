// Generador de jugadas de ruleta: cada jugada es una lista de apuestas (datos, no imagen).
// Tipos: straight (pleno), split (caballo), street (calle), corner (cuadro),
// dozen (docena), outside (rojo/negro/par/impar/1-18/19-36).

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const ri = (arr) => arr[Math.floor(Math.random() * arr.length)];

function distinctNumbers(count, max) {
  const s = new Set();
  while (s.size < count) s.add(1 + Math.floor(Math.random() * max));
  return [...s];
}

function mkSplit() {
  const n = 1 + Math.floor(Math.random() * 33);
  if (Math.random() < 0.5 && n % 3 !== 0) return { type: 'split', nums: [n, n + 1] };
  return { type: 'split', nums: [n, Math.min(n + 3, 36)] };
}

function mkCorner() {
  const col = Math.floor(Math.random() * 11);
  const row = Math.floor(Math.random() * 2);
  const a = col * 3 + (3 - row) - 2;
  return { type: 'corner', nums: [a, a + 1, a + 3, a + 4].sort((x, y) => x - y) };
}

function mkStreet() {
  const c = Math.floor(Math.random() * 12);
  return { type: 'street', nums: [c * 3 + 1, c * 3 + 2, c * 3 + 3] };
}

function generateJugada(tier) {
  if (tier === 'safe') {
    return [
      { type: 'dozen', dozen: 1 + Math.floor(Math.random() * 3) },
      { type: 'outside', outside: ri(['red', 'black']) },
      { type: 'outside', outside: ri(['even', 'odd', 'low', 'high']) },
    ];
  }
  if (tier === 'risky') {
    const bets = distinctNumbers(4, 36).map((n) => ({ type: 'straight', nums: [n] }));
    bets.push(mkSplit(), mkCorner());
    return bets;
  }
  return [mkStreet(), mkCorner(), mkSplit(), { type: 'dozen', dozen: 1 + Math.floor(Math.random() * 3) }];
}

function betLabel(b) {
  if (b.type === 'straight') return `Pleno al ${b.nums[0]}`;
  if (b.type === 'split') return `Caballo ${b.nums[0]}–${b.nums[1]}`;
  if (b.type === 'corner') return `Cuadro ${b.nums.join('-')}`;
  if (b.type === 'street') return `Calle ${b.nums.join('-')}`;
  if (b.type === 'dozen') return `${b.dozen}ª docena`;
  return { low: '1–18', even: 'Par', red: 'Rojo', black: 'Negro', odd: 'Impar', high: '19–36' }[b.outside];
}

module.exports = { generateJugada, betLabel, RED };
