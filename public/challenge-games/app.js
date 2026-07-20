const GAME = document.body.dataset.game;
const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const META = {
  'delta-pick': ['DeltaPick', 'Generá una misión exacta para Keno o Bombs y compartí el mismo desafío con tus amigos.'],
  'roulette-bingo': ['Roulette Bingo', 'Completá una tarjeta única de eventos mientras seguís los resultados de la ruleta.'],
  'bonus-duel': ['Bonus Duel', 'Dos jugadores compran el mismo bonus. El multiplicador más alto avanza.'],
  'road-to-millionaire': ['Road to Millionaire', 'Empezá con $1 y duplicá tu banca en cada mano hasta superar el millón.'],
  everest: ['Everest', 'Escalá diez niveles de Crash. Cada etapa exige sobrevivir cinco segundos más.'],
  'whole-ride': ['Whole Ride', 'Completá una ruta individual contrarreloj, marcá tu récord y escalá la leaderboard global.'],
};

document.title = `${META[GAME][0]} — Delta Bet`;
$('game-name').textContent = META[GAME][0];
$('title').textContent = META[GAME][0];
document.querySelector('.hero')?.insertAdjacentHTML('afterbegin', `<img class="game-hero-logo" src="/assets/game-catalog/${GAME}/logo.png" alt="${META[GAME][0]}">`);
$('lead').textContent = META[GAME][1];

const templates = {
  'delta-pick': `
    <div class="controls">
      <label>Juego<select id="dp-game"><option value="keno">Keno</option><option value="bombs">Bombs</option></select></label>
      <label>Dificultad<select id="difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="extreme">Extreme</option></select></label>
      <button id="generate">Generar challenge</button>
    </div><div class="result" id="result"></div>`,
  'roulette-bingo': `
    <div class="controls"><label>Formato<select id="bingo-size"><option value="4">Fast · 4</option><option value="6" selected>Classic · 6</option><option value="9">Extended · 9</option></select></label><button id="generate">Nueva tarjeta</button></div>
    <div class="status" id="status">Generá una tarjeta para comenzar.</div><div class="bingo-grid" id="bingo"></div>`,
  'bonus-duel': `
    <div class="controls"><label>Slot<input id="slot" value="Sweet Bonanza" /></label><label>Formato<select id="format"><option>1v1</option><option>Best of 3</option><option>King of the Hill</option></select></label></div>
    <div class="versus"><div class="player-box"><h2>Jugador A</h2><input id="score-a" type="number" min="0" placeholder="Multiplicador X" /></div><div class="vs">VS</div><div class="player-box"><h2>Jugador B</h2><input id="score-b" type="number" min="0" placeholder="Multiplicador X" /></div></div>
    <div class="status" id="status">Ambos jugadores compran el mismo bonus.</div><button id="compare">Comparar resultado</button>`,
  'road-to-millionaire': `<div class="main-road"><header class="main-road-hero"><img src="/assets/game-catalog/road-to-millionaire/logo.png" alt="Road to Millionaire"><div><small>SOLO BLACKJACK CHALLENGE</small><h2>One hand. One step closer.</h2><p>Win the next hand to double your challenge bankroll and unlock the next step.</p></div></header><div class="main-road-layout"><section class="main-road-journey"><div class="main-road-metrics"><div><small>CURRENT STEP</small><strong id="streak">Step 1 of 20</strong></div><div><small>CHALLENGE BANKROLL</small><strong id="bank">$1</strong></div><div><small>BEST RUN</small><strong id="best">0 / 20</strong></div></div><div class="main-road-track" id="track"></div><div class="main-road-next"><span id="road-main-number">01</span><div><small>YOUR NEXT MOVE</small><h3 id="road-main-title">Win a $1 Blackjack hand</h3><p id="status">Win to advance. Lose and the run resets to $1.</p></div><b id="road-main-target">→ $2</b></div><div class="main-road-controls"><button id="win">Hand won · advance</button><button class="secondary" id="lose">Hand lost · reset</button></div></section><aside class="main-road-side"><small>GLOBAL SOLO RUN</small><h2>Leaderboard</h2><div><span>1</span><strong>CardShark</strong><b>20 / 20</b></div><div><span>2</span><strong>RiverAce</strong><b>18 / 20</b></div><div><span>3</span><strong>BlackMoo</strong><b>16 / 20</b></div><footer><small>YOUR BEST</small><strong id="road-main-best">0 / 20</strong></footer></aside></div></div>`,
  everest: `<div class="result"><div class="metric"><small>Nivel</small><strong id="level">1 / 10</strong></div><div class="metric"><small>Objetivo</small><strong id="target">5 s</strong></div><div class="metric"><small>Récord</small><strong id="best">0</strong></div><div class="track" id="track"></div><div class="status" id="status">Sobreviví 5 segundos en Crash para desbloquear el nivel 2.</div><div class="controls"><button id="survive">Nivel superado</button><button class="secondary" id="crash">Crash · reiniciar</button></div></div>`,
  'whole-ride': `<div class="ride-setup"><div class="controls"><label>Nombre del jugador<input id="ride-player" maxlength="18" value="You" /></label><label>Dificultad<select id="ride-difficulty"><option value="normal">Normal · 6 juegos</option><option value="hard">Hard · 8 juegos</option><option value="endless">Endless · 10 juegos</option></select></label><button id="generate">Empezar carrera</button></div><div class="ride-metrics"><div class="metric"><small>Tiempo</small><strong id="ride-timer">00:00.00</strong></div><div class="metric"><small>Récord personal</small><strong id="ride-best">—</strong></div><div class="metric"><small>Ranking demo</small><strong id="ride-rank">—</strong></div></div></div><div class="status" id="status">Elegí la dificultad y empezá tu carrera contrarreloj.</div><div class="route" id="route"></div><section class="leaderboard"><div class="leaderboard-head"><div><span class="leaderboard-kicker">Global leaderboard</span><h2>Fastest Riders</h2></div><span class="demo-badge">Demo data</span></div><div class="leaderboard-list" id="leaderboard"></div></section>`,
};

$('app').innerHTML = templates[GAME];

function initDeltaPick() {
  $('generate').onclick = () => {
    const difficulty = $('difficulty').value;
    const mode = $('dp-game').value;
    const amounts = mode === 'keno' ? { easy: 3, medium: 5, hard: 8, extreme: 10 } : { easy: 2, medium: 4, hard: 6, extreme: 9 };
    const count = amounts[difficulty];
    const values = shuffle(Array.from({ length: mode === 'keno' ? 40 : 25 }, (_, i) => i + 1)).slice(0, count);
    const cells = Array.from({ length: mode === 'keno' ? 40 : 25 }, (_, i) => `<div class="cell ${values.includes(i + 1) ? 'selected' : ''}">${mode === 'keno' ? i + 1 : `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`}</div>`).join('');
    $('result').innerHTML = `<h2>${mode === 'keno' ? 'Ticket Keno' : 'Mapa Bombs'}</h2><div class="metric"><small>${mode === 'keno' ? 'Pick size' : 'Bombs'}</small><strong>${mode === 'keno' ? count : 5}</strong></div><div class="metric"><small>Selecciones</small><strong>${count}</strong></div><div class="board ${mode === 'keno' ? 'keno-board' : 'bomb-board'}">${cells}</div>`;
  };
  $('generate').click();
}

function initCompetitiveGame(mode) {
  const isBingo = mode === 'bingo';
  const objectives = ['RED','BLACK','EVEN','ODD','NUMBER 17','1ST DOZEN','2ND DOZEN','3RD DOZEN','ZERO','COLUMN 1','COLUMN 2','COLUMN 3','19–36','1–18','STREET','CORNER','SPLIT'];
  const slots = ['Sweet Bonanza','Gates of Olympus','Sugar Rush','Wanted Dead or a Wild','Big Bass Bonanza'];
  $('app').innerHTML = `<div class="pvp-shell"><div class="pvp-setup"><label>Player 1<input id="pvp-p1" value="Player 1" maxlength="18"></label><label>Player 2<input id="pvp-p2" value="Player 2" maxlength="18"></label><label>${isBingo?'Card size':'Bonus format'}<select id="pvp-format">${isBingo?'<option value="4">Fast · 4</option><option value="6" selected>Classic · 6</option><option value="9">Extended · 9</option>':'<option value="1">Single bonus</option><option value="3" selected>Best of 3</option><option value="5">Best of 5</option>'}</select></label><button id="pvp-start">Start match</button></div><div class="status" id="pvp-status">Add two players and start the match.</div><div id="pvp-match" class="hidden"><div class="pvp-hud"><div class="metric"><small>Round</small><strong id="pvp-round">1 / 3</strong></div><div class="metric"><small>Turn</small><strong id="pvp-turn">—</strong></div><div class="metric"><small>Stage</small><strong id="pvp-progress">1 / 6</strong></div></div><section class="pvp-challenge" id="pvp-challenge"></section><section class="pvp-balance" data-phase="before"><div class="pvp-balance-head"><span>TURN PERFORMANCE</span><h2>Balance check</h2><p>Save the casino balance before playing. The final balance unlocks after the challenge.</p></div><div class="pvp-balance-steps"><div class="pvp-step is-active" data-pvp-step="before"><b>1</b>Balance before</div><i></i><div class="pvp-step is-locked" data-pvp-step="after"><b>2</b>Balance after</div></div><label class="pvp-balance-input is-active" data-pvp-input="before"><small>Balance before</small><span>$ <input id="pvp-pre" type="number" min="0.01" step="0.01" placeholder="0.00"></span></label><label class="pvp-balance-input is-locked" data-pvp-input="after"><small>Balance after</small><span>$ <input id="pvp-post" type="number" min="0" step="0.01" placeholder="0.00" disabled></span></label><button id="pvp-save" class="pvp-primary">Save balance before <span>→</span></button></section><section class="pvp-results hidden"><div class="pvp-result-score"><span>Turn result</span><strong id="pvp-score">—</strong></div><h2>Match leaderboard</h2><div id="pvp-board"></div><button id="pvp-next" class="pvp-primary">Play next player turn</button></section></div></div>`;
  let players=[],turnIndex=0,round=1,finished=false;
  const safe=(value)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const renderBoard=()=>{const ranked=players.map((p,index)=>({...p,playerIndex:index})).sort((a,b)=>b.total-a.total);$('pvp-board').innerHTML=`<div class="pvp-leaderboard"><div class="pvp-leaderboard-head"><span>Rank</span><span>Player</span><span>Last turn</span><span>Total performance</span></div>${ranked.map((p,rank)=>`<div class="pvp-leaderboard-row ${rank===0?'is-leader':''} ${!finished&&p.playerIndex===turnIndex?'is-current':''}"><span class="pvp-rank">${rank===0?'★':rank+1}</span><span class="pvp-player"><i>${safe(p.name).slice(0,1).toUpperCase()}</i><strong>${safe(p.name)}</strong>${p.playerIndex===turnIndex?'<small>CURRENT</small>':''}</span><strong class="pvp-last ${p.last>=0?'score-pos':'score-neg'}">${p.scores.length?(p.last>=0?'+':'')+p.last.toFixed(2)+'%':'—'}</strong><strong class="pvp-total ${p.total>=0?'score-pos':'score-neg'}">${p.total>=0?'+':''}${p.total.toFixed(2)}%</strong></div>`).join('')}</div>`;};
  const makeChallenge=()=>{if(isBingo){const amount=Number($('pvp-format').value);return `<div class="pvp-challenge-head"><span>ROULETTE CARD</span><h2>Complete your ${amount}-objective card</h2><p>Play roulette until every assigned event has occurred.</p></div><div class="bingo-grid">${shuffle(objectives).slice(0,amount).map((x,i)=>`<div class="bingo-cell"><small>${String(i+1).padStart(2,'0')}</small>${x}</div>`).join('')}</div>`;}const bonuses=Number($('pvp-format').value);const slot=pick(slots);return `<div class="pvp-challenge-head"><span>SAME BONUS · SAME SLOT</span><h2>${slot}</h2><p>Buy and play ${bonuses} bonus${bonuses===1?'':'es'}. Your casino balance performance determines the turn score.</p></div><div class="duel-card"><div><small>ASSIGNED SLOT</small><strong>${slot}</strong></div><b>VS</b><div><small>FORMAT</small><strong>${bonuses===1?'Single bonus':`Best of ${bonuses}`}</strong></div></div>`;};
  const setPhase=(phase)=>{document.querySelector('.pvp-balance').dataset.phase=phase;document.querySelector('[data-pvp-step="before"]').className=`pvp-step ${phase==='before'?'is-active':'is-done'}`;document.querySelector('[data-pvp-step="after"]').className=`pvp-step ${phase==='after'?'is-active':'is-locked'}`;document.querySelector('[data-pvp-input="before"]').className=`pvp-balance-input ${phase==='before'?'is-active':'is-done'}`;document.querySelector('[data-pvp-input="after"]').className=`pvp-balance-input ${phase==='after'?'is-active':'is-locked'}`;$('pvp-pre').disabled=phase!=='before';$('pvp-post').disabled=phase!=='after';$('pvp-save').innerHTML=`${phase==='before'?'Save balance before':'Save balance after & score'} <span>→</span>`;};
  const startTurn=()=>{$('pvp-match').classList.remove('result-stage');document.querySelector('.pvp-results').classList.add('hidden');document.querySelector('.pvp-challenge').classList.remove('hidden');document.querySelector('.pvp-balance').classList.remove('hidden');$('pvp-round').textContent=`${round} / 3`;$('pvp-turn').textContent=players[turnIndex].name;$('pvp-progress').textContent=`${(round-1)*2+turnIndex+1} / 6`;$('pvp-challenge').innerHTML=makeChallenge();$('pvp-pre').value='';$('pvp-post').value='';setPhase('before');$('pvp-status').textContent='Enter and save your casino balance before playing.';renderBoard();};
  const showResults=()=>{const p=players[turnIndex];document.querySelector('.pvp-challenge').classList.add('hidden');document.querySelector('.pvp-balance').classList.add('hidden');$('pvp-match').classList.add('result-stage');document.querySelector('.pvp-results').classList.remove('hidden');$('pvp-score').textContent=`${p.last>=0?'+':''}${p.last.toFixed(2)}%`;$('pvp-score').className=p.last>=0?'score-pos':'score-neg';$('pvp-status').textContent=`Turn complete · ${p.name}: ${p.last>=0?'+':''}${p.last.toFixed(2)}%`;$('pvp-next').textContent=turnIndex===0?'Play next player turn':round<3?'Start next round':'Finish match';renderBoard();};
  $('pvp-start').onclick=()=>{players=[$('pvp-p1').value.trim()||'Player 1',$('pvp-p2').value.trim()||'Player 2'].map(name=>({name,scores:[],last:0,total:0}));turnIndex=0;round=1;finished=false;document.body.classList.add('game-running','generic-pvp-running');document.querySelector('.pvp-setup').classList.add('hidden');$('pvp-match').classList.remove('hidden');startTurn();};
  $('pvp-save').onclick=()=>{const phase=document.querySelector('.pvp-balance').dataset.phase;const pre=Number($('pvp-pre').value);if(phase==='before'){if(!(pre>0)){$('pvp-status').textContent='Enter a valid balance greater than zero.';return;}setPhase('after');$('pvp-status').textContent='Balance saved. Complete the challenge in the casino, then enter the final balance.';$('pvp-post').focus();return;}const post=Number($('pvp-post').value);if(!(pre>0)||post<0||!Number.isFinite(post)){$('pvp-status').textContent='Enter a valid final balance.';return;}const p=players[turnIndex];p.last=((post-pre)/pre)*100;p.scores.push(p.last);p.total+=p.last;showResults();};
  $('pvp-next').onclick=()=>{if(turnIndex===0){turnIndex=1;startTurn();return;}if(round<3){round++;turnIndex=0;startTurn();return;}finished=true;const winner=[...players].sort((a,b)=>b.total-a.total)[0];$('pvp-status').textContent=`Match finished · Winner: ${winner.name}`;$('pvp-score').textContent=`${winner.name} · ${winner.total>=0?'+':''}${winner.total.toFixed(2)}%`;$('pvp-next').textContent='Play again';$('pvp-next').onclick=()=>location.reload();renderBoard();};
}

function initBingo() { initCompetitiveGame('bingo'); }
function initDuel() { initCompetitiveGame('duel'); }

function makeTrack(count, current, label) { return Array.from({ length: count }, (_, i) => `<div class="step ${i < current ? 'done' : i === current ? 'current' : ''}">${label(i)}</div>`).join(''); }

function initMillionaire() {
  let streak = 0, best = 0;
  const shortMoney = (value) => value >= 1000000 ? `$${(value / 1000000).toFixed(2)}M` : value >= 1000 ? `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : `$${value}`;
  const render = (message) => {
    const current = Math.pow(2, streak), next = Math.pow(2, Math.min(20, streak + 1));
    $('bank').textContent = shortMoney(current); $('streak').textContent = streak === 20 ? 'Journey complete' : `Step ${streak + 1} of 20`; $('best').textContent = `${best} / 20`; $('road-main-best').textContent = `${best} / 20`;
    $('track').innerHTML = Array.from({ length: 20 }, (_, i) => `<i class="${i < streak ? 'complete' : i === streak ? 'active' : ''}">${i + 1}</i>`).join('');
    $('road-main-number').textContent = String(Math.min(20, streak + 1)).padStart(2, '0'); $('road-main-title').textContent = streak === 20 ? 'Millionaire status unlocked' : `Win a ${shortMoney(current)} Blackjack hand`; $('road-main-target').textContent = streak === 20 ? '🏆' : `→ ${shortMoney(next)}`;
    $('status').textContent = message || (streak === 20 ? 'Run complete. Your result is ready for the global leaderboard.' : 'One hand at a time. Win to advance; lose and the run resets to $1.');
    $('win').textContent = streak === 20 ? 'Start a new run' : 'Hand won · advance';
  };
  $('win').onclick = () => { if (streak === 20) { streak = 0; render(); return; } streak++; best = Math.max(best, streak); render(streak === 20 ? 'You made it. Twenty consecutive wins and millionaire status unlocked.' : `Step ${streak} verified. The next hand is ready.`); };
  $('lose').onclick = () => { streak = 0; render('Run reset. Take a breath and start again from $1.'); }; render();
}

function initEverest() {
  let level = 1, best = 0;
  const render = (message) => { $('level').textContent = `${level} / 10`; $('target').textContent = `${level * 5} s`; $('best').textContent = best; $('track').innerHTML = makeTrack(10, level - 1, i => `${(i + 1) * 5}s`); $('status').textContent = message || (level > 10 ? '¡Cumbre alcanzada!' : `Sobreviví ${level * 5} segundos para avanzar.`); };
  $('survive').onclick = () => { best = Math.max(best, level); if (level <= 10) level++; render(); };
  $('crash').onclick = () => { level = 1; render('Caíste de la montaña. La escalada vuelve al nivel 1.'); }; render();
}

function initRide() {
  const games = [['Roulette','Lográ un resultado verde'],['Crash','Alcanzá 2x'],['Blackjack','Ganá una mano'],['Keno','Acertá al menos un número'],['Bombs','Abrí 3 celdas seguras'],['Slots','Activá cualquier bonus'],['Dice','Superá 60'],['Limbo','Alcanzá 3x'],['Wheel','Completá un giro ganador'],['Plinko','Obtené un multiplicador mayor a 2x']];
  const demoBoards = {
    normal: [['LunaSpin',124680],['CryptoNico',133420],['ReinaRNG',144160],['MaxBet',156900],['SofiSlots',168250],['LuckyTom',181770]],
    hard: [['LunaSpin',192540],['ReinaRNG',206180],['MaxBet',219760],['CryptoNico',235310],['LuckyTom',248920],['SofiSlots',271440]],
    endless: [['ReinaRNG',262850],['LunaSpin',279460],['CryptoNico',296120],['SofiSlots',315780],['MaxBet',337640],['LuckyTom',361290]],
  };
  const stageRanges = { normal: [19000, 27000], hard: [21000, 29000], endless: [23000, 32000] };
  let running = false, startedAt = 0, simulatedMs = 0, frame = 0, amount = 0, stageTimes = [], currentDifficulty = 'normal', finalEntry = null;
  const formatTime = (ms) => { const total = Math.max(0, Math.round(ms / 10)); const minutes = Math.floor(total / 6000); const seconds = Math.floor((total % 6000) / 100); const hundredths = total % 100; return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(hundredths).padStart(2,'0')}`; };
  const bestKey = (difficulty) => `deltabet-whole-ride-best-${difficulty}`;
  const getBest = (difficulty) => { try { return Number(localStorage.getItem(bestKey(difficulty))) || 0; } catch { return 0; } };
  const setBest = (difficulty, value) => { try { localStorage.setItem(bestKey(difficulty), String(value)); } catch {} };
  const elapsed = () => simulatedMs + (running ? performance.now() - startedAt : 0);
  const paintTimer = () => { $('ride-timer').textContent = formatTime(elapsed()); if (running) frame = requestAnimationFrame(paintTimer); };
  const renderBoard = () => {
    const entries = demoBoards[currentDifficulty].map(([name,time]) => ({ name, time, demo: true }));
    if (finalEntry) entries.push(finalEntry);
    entries.sort((a,b) => a.time - b.time);
    $('leaderboard').innerHTML = entries.map((entry,index) => `<div class="leaderboard-row ${entry.demo ? '' : 'is-player'}"><span class="leaderboard-rank">${index + 1}</span><span class="leaderboard-player"><i>${entry.name.slice(0,1).toUpperCase()}</i><strong>${entry.name}</strong>${entry.demo ? '' : '<small>YOU</small>'}</span><time>${formatTime(entry.time)}</time></div>`).join('');
    if (finalEntry) $('ride-rank').textContent = `#${entries.indexOf(finalEntry) + 1}`;
  };
  const showBest = () => { const best = getBest(currentDifficulty); $('ride-best').textContent = best ? formatTime(best) : '—'; };
  const previewRoute = () => {
    currentDifficulty = $('ride-difficulty').value;
    amount = { normal: 6, hard: 8, endless: 10 }[currentDifficulty];
    const route = shuffle(games).slice(0, amount);
    const [min,max] = stageRanges[currentDifficulty];
    stageTimes = route.map(() => Math.round((min + Math.random() * (max - min)) / 10) * 10);
    $('route').innerHTML = route.map(([game, objective], i) => `<button class="route-item locked" data-step="${i}" disabled><span class="route-copy"><strong>${i + 1}. ${game}</strong><span>${objective}</span></span><em>+${formatTime(stageTimes[i]).slice(0,5)}</em></button>`).join('');
    finalEntry = null; $('ride-rank').textContent = '—'; showBest(); renderBoard();
  };
  const finish = () => {
    simulatedMs = elapsed(); running = false; cancelAnimationFrame(frame); $('ride-timer').textContent = formatTime(simulatedMs);
    const playerName = $('ride-player').value.trim() || 'You';
    finalEntry = { name: playerName, time: simulatedMs, demo: false };
    const best = getBest(currentDifficulty); if (!best || simulatedMs < best) setBest(currentDifficulty, simulatedMs); showBest(); renderBoard();
    $('status').textContent = `¡Whole Ride completado en ${formatTime(simulatedMs)}! Quedaste #${$('ride-rank').textContent.replace('#','')} en la leaderboard demo.`;
    $('generate').textContent = 'Correr de nuevo';
  };
  const start = () => {
    cancelAnimationFrame(frame); running = false; simulatedMs = 0; $('ride-timer').textContent = '00:00.00'; previewRoute();
    document.querySelectorAll('.route-item').forEach((item, index) => { item.disabled = false; item.classList.remove('locked'); item.onclick = () => { if (!running || index !== document.querySelectorAll('.route-item.done').length) return; simulatedMs = elapsed() + stageTimes[index]; startedAt = performance.now(); item.classList.add('done'); item.disabled = true; const done = document.querySelectorAll('.route-item.done').length; $('status').textContent = done === amount ? 'Finalizando tu tiempo…' : `${done} de ${amount} etapas completadas. El reloj sigue corriendo.`; if (done === amount) finish(); }; });
    running = true; startedAt = performance.now(); $('status').textContent = `0 de ${amount} etapas completadas. ¡El reloj está corriendo!`; $('generate').textContent = 'Reiniciar carrera'; paintTimer();
  };
  $('ride-difficulty').onchange = () => { const restartMessage = document.documentElement.lang === 'es' ? '¿Reiniciar la carrera con otra dificultad?' : 'Restart the ride with a different difficulty?'; if (running && !confirm(restartMessage)) { $('ride-difficulty').value = currentDifficulty; return; } cancelAnimationFrame(frame); running = false; simulatedMs = 0; $('ride-timer').textContent = '00:00.00'; $('status').textContent = 'Elegí la dificultad y empezá tu carrera contrarreloj.'; $('generate').textContent = 'Empezar carrera'; previewRoute(); };
  $('generate').onclick = start; previewRoute();
}

({ 'delta-pick': initDeltaPick, 'roulette-bingo': initBingo, 'bonus-duel': initDuel, 'road-to-millionaire': initMillionaire, everest: initEverest, 'whole-ride': initRide })[GAME]();
