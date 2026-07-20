(() => {
  const game = document.body.dataset.game;
  if (!game || document.querySelector('.catalog-launcher')) return;
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const soloGames = new Set(['keno-solo-run','bombs-solo-run','road-to-millionaire','everest','whole-ride']);
  const solo = soloGames.has(game);
  const names = {
    'delta-pick-keno':'DeltaPick Keno','delta-pick-bombs':'DeltaPick Bombs','keno-solo-run':'Keno Solo Run','bombs-solo-run':'Bombs Solo Run',
    'roulette-bingo':'Roulette Bingo','bonus-duel':'Bonus Duel','road-to-millionaire':'Road to Millionaire',everest:'Everest','whole-ride':'Whole Ride'
  };
  const instructions = {
    'delta-pick-keno':['Create a two-player match.','Each player receives a randomized Keno ticket every round.','Enter the casino balance before and after the challenge.','After three rounds, the best cumulative performance wins.'],
    'delta-pick-bombs':['Create a two-player match.','Each player receives a randomized Bombs challenge every round.','Enter the casino balance before and after the challenge.','After three rounds, the best cumulative performance wins.'],
    'keno-solo-run':['Choose a difficulty and start the timer.','Complete the five Keno tickets in order.','Every completed ticket adds a verified stage time.','Finish faster than the demo leaderboard to set a record.'],
    'bombs-solo-run':['Choose a difficulty and start the timer.','Complete the five Bombs challenges in order.','Every stage must be completed before the next one.','Your final time is added to the demo leaderboard.'],
    'roulette-bingo':['Create a roulette objective card.','Mark objectives only when they occur in the casino.','Complete every cell before the other players.','Casino balance performance determines the match ranking.'],
    'bonus-duel':['Both players open the same slot bonus.','Enter each verified multiplier.','The highest multiplier wins the duel.','Use Best of 3 or King of the Hill for longer matches.'],
    'road-to-millionaire':['Start with a $1 Blackjack bankroll.','Every victory doubles the current bankroll.','A loss resets the active run.','Reach $1,048,576 and compete for the best time.'],
    everest:['Start at the first Crash target.','Survive each required multiplier level.','A crash resets the active climb.','Reach the summit and compete for the best time.'],
    'whole-ride':['Generate a route through different casino games.','Complete every objective in the assigned order.','One timer follows the complete run.','The fastest verified completion enters the global leaderboard.']
  };
  const spanish = {
    play:'Jugar',instructions:'Instrucciones',more:'Más juegos',close:'Cerrar',players:'Jugadores',info:'Info',leaderboard:'Leaderboard global',time:'Tiempo',
    tagline: solo ? 'SUPERÁ EL RECORRIDO Y MARCÁ UN NUEVO RÉCORD GLOBAL' : 'DESAFIÁ A OTROS JUGADORES Y DOMINÁ LA PARTIDA',
    fixed:'Demo standalone · la integración real verifica los resultados automáticamente.'
  };
  const english = {play:'Play',instructions:'Instructions',more:'More games',close:'Close',players:'Players',info:'Info',leaderboard:'Global leaderboard',time:'Time',tagline:solo?'BEAT THE RUN AND SET A NEW GLOBAL RECORD':'CHALLENGE OTHER PLAYERS AND MASTER THE MATCH',fixed:'Standalone demo · a real integration verifies results automatically.'};
  const copy = lang === 'es' ? spanish : english;
  const logoUrl = `/assets/game-catalog/${game}/logo.png`;
  const demoBoards = {
    'keno-solo-run':[['KenoKing','01:14.62'],['LunaPick','01:21.24'],['RNGMia','01:27.98'],['Nico40','01:35.61'],['LuckyTom','01:44.38'],['SofiHits','01:53.76']],
    'bombs-solo-run':[['SafeMia','01:28.54'],['BombBoss','01:34.72'],['LunaGrid','01:42.86'],['NicoSafe','01:51.43'],['LuckyTom','01:59.78'],['SofiRun','02:08.64']],
    'road-to-millionaire':[['AceMia','03:48.21'],['BlackjackBen','04:02.16'],['Luna21','04:17.83'],['NicoAce','04:31.09'],['SofiDouble','04:46.55'],['LuckyTom','05:03.72']],
    everest:[['CrashKing','02:31.44'],['LunaPeak','02:42.18'],['RNGMia','02:56.73'],['NicoX','03:08.20'],['SofiSummit','03:19.87'],['LuckyTom','03:35.61']],
    'whole-ride':[['LunaSpin','02:04.68'],['CryptoNico','02:13.42'],['ReinaRNG','02:24.16'],['MaxBet','02:36.90'],['SofiSlots','02:48.25'],['LuckyTom','03:01.77']]
  };
  const playerRows = `<div class="launcher-row"><span><input class="launcher-player" value="Player 1" maxlength="18"><i>✎</i></span><strong>Player 1</strong></div><div class="launcher-row"><span><input class="launcher-player" value="Player 2" maxlength="18"><i>✎</i></span><strong>Player 2</strong></div>`;
  const leaderboardRows = (demoBoards[game] || []).map(([player,time],index)=>`<div class="launcher-rank"><b>${index+1}</b><span><i>${player[0]}</i><strong>${player}</strong></span><time>${time}</time></div>`).join('');
  const translatedInstructions = lang === 'es' ? [
    solo ? 'Elegí una dificultad y comenzá el cronómetro.' : 'Creá la partida y agregá los jugadores.',
    solo ? 'Completá todos los challenges en el orden asignado.' : 'Cada jugador recibe un challenge en su turno.',
    solo ? 'Cada resultado suma progreso verificado al recorrido.' : 'Ingresá el balance previo y posterior de cada round.',
    solo ? 'Tu tiempo final compite contra la leaderboard global.' : 'La mejor performance acumulada gana la partida.'
  ] : instructions[game];
  const launcher = document.createElement('section');
  launcher.className = `catalog-launcher launcher-${game}`;
  launcher.innerHTML = `<div class="launcher-inner"><img class="launcher-game-logo" src="${logoUrl}" alt="${names[game]}"><h1>${copy.tagline}</h1><div class="launcher-grid"><div class="launcher-panel"><div class="launcher-panel-head"><span>${solo?copy.leaderboard:copy.players}</span><span>${solo?copy.time:copy.info}</span></div><div class="launcher-panel-body">${solo?leaderboardRows:playerRows}</div><p class="launcher-note">${copy.fixed}</p></div><div class="launcher-menu"><button type="button" data-launch-action="play">${copy.play}</button><button type="button" data-launch-action="instructions">${copy.instructions}</button><button type="button" data-launch-action="more">${copy.more}</button></div></div><div class="launcher-instructions" aria-hidden="true"><h2>${copy.instructions}</h2>${translatedInstructions.map((line,index)=>`<p><b>${index+1}.</b> ${line}</p>`).join('')}<button type="button" data-launch-action="close">${copy.close}</button></div></div>`;
  const header = document.querySelector('.game-header');
  (header || document.body.firstChild).after(launcher);
  document.body.classList.add('launcher-active');
  const main = document.querySelector('body > main');
  if (main) main.setAttribute('aria-hidden','true');
  const panel = launcher.querySelector('.launcher-instructions');
  const toggleInstructions = (open) => { panel.classList.toggle('open',open); panel.setAttribute('aria-hidden',String(!open)); };
  launcher.querySelector('[data-launch-action="instructions"]').onclick=()=>toggleInstructions(!panel.classList.contains('open'));
  launcher.querySelector('[data-launch-action="close"]').onclick=()=>toggleInstructions(false);
  launcher.querySelector('[data-launch-action="more"]').onclick=()=>location.href='/';
  launcher.querySelector('[data-launch-action="play"]').onclick=()=>{
    const inputs=[...launcher.querySelectorAll('.launcher-player')];
    if (inputs.length && document.getElementById('p1')) document.getElementById('p1').value=inputs[0].value;
    if (inputs.length && document.getElementById('p2')) document.getElementById('p2').value=inputs[1].value;
    launcher.classList.add('leaving');
    setTimeout(()=>{ launcher.remove(); document.body.classList.remove('launcher-active'); if(main){main.removeAttribute('aria-hidden');main.classList.add('launcher-enter');} },260);
  };
})();
