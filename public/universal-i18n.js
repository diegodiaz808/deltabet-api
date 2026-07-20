(() => {
  if (!document.querySelector('link[data-viewport-fit]')) {
    const viewportFit = document.createElement('link');
    viewportFit.rel = 'stylesheet';
    viewportFit.href = '/viewport-fit.css';
    viewportFit.dataset.viewportFit = 'true';
    document.head.appendChild(viewportFit);
  }
  let language = new URLSearchParams(location.search).get('lang') === 'es' ? 'es' : 'en';
  const pairs = [
    ['Inicio','Home'],['Anterior','Previous'],['Siguiente','Next'],['Siguiente juego','Next game'],['Volver al primero','Back to first'],
    ['JUGADORES','PLAYERS'],['Jugador','Player'],['INFO','INFO'],['Jugar','Play'],['JUGAR','PLAY'],['Instrucciones','Instructions'],['INSTRUCCIONES','INSTRUCTIONS'],['Más juegos','More games'],['MAS JUEGOS','MORE GAMES'],['Cerrar','Close'],
    ['Agrega un jugador','Add a player'],['Mas juegos','More games'],['Admin.','Admin'],['BALANCE PREVIO','BALANCE BEFORE'],['BALANCE POSTERIOR','BALANCE AFTER'],['Balance total','Total balance'],['BALANCE TOTAL','TOTAL BALANCE'],['Enviar','Submit'],['Guardar balance previo','Save balance before'],['Calcular rendimiento','Calculate performance'],['Siguiente','Next'],['Girar','Spin'],['Tiradas','Spins'],['Jugadas','Bets'],
    ['RENDIMIENTO DEL TURNO','TURN PERFORMANCE'],['CALCULADORA DE BALANCE','BALANCE CALCULATOR'],['Usamos ambos balances para calcular tu rendimiento en este round.','We use both snapshots to calculate your performance for this round.'],['TU APUESTA','YOUR BET'],['TU MISIÓN DE LA ISLA','YOUR ISLAND MISSION'],['TU DESAFÍO','YOUR CHALLENGE'],
    ['PARTIDA TERMINADA','MATCH FINISHED'],['EL MAESTRO DE LA RULETA ES','THE ROULETTE MASTER IS'],['EL MAESTRO DE LOS SLOTS ES','THE SLOTS MASTER IS'],['Jugar de nuevo','Play again'],
    ['GENERADOR DE MISIONES','CHALLENGE GENERATOR'],['RULETA COMPETITIVA','COMPETITIVE ROULETTE'],['PVP DE SLOTS','SLOTS PVP'],['BLACKJACK PROGRESSION','BLACKJACK PROGRESSION'],['CRASH PROGRESSION','CRASH PROGRESSION'],['MULTI-GAME RUN','MULTI-GAME RUN'],
    ['Juego','Game'],['Dificultad','Difficulty'],['Generar challenge','Generate challenge'],['Generá una tarjeta para comenzar.','Generate a card to begin.'],['Nueva tarjeta','New card'],['Formato','Format'],['Slot','Slot'],['Jugador A','Player A'],['Jugador B','Player B'],['Comparar resultado','Compare result'],['Ambos jugadores compran el mismo bonus.','Both players buy the same bonus.'],
    ['Selecciones','Selections'],['Marcá cada objetivo cuando suceda en la ruleta.','Mark each objective when it occurs at the roulette table.'],['Rojo','Red'],['Negro','Black'],['Par','Even'],['Impar','Odd'],['Número 17','Number 17'],['1ª docena','1st dozen'],['2ª docena','2nd dozen'],['3ª docena','3rd dozen'],['Cero','Zero'],['Columna 1','Column 1'],['Columna 2','Column 2'],['Columna 3','Column 3'],
    ['Banca actual','Current bankroll'],['Racha','Streak'],['Mejor racha','Best streak'],['Ganó la mano','Hand won'],['Perdió · reiniciar','Lost · reset'],['Nivel','Level'],['Objetivo','Target'],['Récord','Record'],['Nivel superado','Level cleared'],['Crash · reiniciar','Crash · reset'],['Generar recorrido','Generate run'],
    ['Normal · 6 juegos','Normal · 6 games'],['Hard · 8 juegos','Hard · 8 games'],['Endless · 10 juegos','Endless · 10 games'],['Lográ un resultado verde','Land on green'],['Alcanzá 2x','Reach 2x'],['Ganá una mano','Win one hand'],['Acertá al menos un número','Hit at least one number'],['Abrí 3 celdas seguras','Open 3 safe cells'],['Activá cualquier bonus','Trigger any bonus'],['Superá 60','Roll over 60'],['Alcanzá 3x','Reach 3x'],['Completá un giro ganador','Complete a winning spin'],['Obtené un multiplicador mayor a 2x','Get a multiplier above 2x'],
    ['Nombre del jugador','Player name'],['Empezar carrera','Start ride'],['Reiniciar carrera','Restart ride'],['Correr de nuevo','Race again'],['Tiempo','Time'],['Récord personal','Personal best'],['Ranking demo','Demo rank'],['Elegí la dificultad y empezá tu carrera contrarreloj.','Choose a difficulty and start your timed ride.'],['El reloj está corriendo','The clock is running'],['Finalizando tu tiempo…','Finalizing your time…'],['Corredores más rápidos','Fastest Riders'],['Datos demo','Demo data'],
    ['Generá una misión exacta para Keno o Bombs y compartí el mismo desafío con tus amigos.','Generate an exact Keno or Bombs mission and share the same challenge with your friends.'],
    ['Completá una tarjeta única de eventos mientras seguís los resultados de la ruleta.','Complete a unique event card while tracking roulette results.'],
    ['Dos jugadores compran el mismo bonus. El multiplicador más alto avanza.','Two players buy the same bonus. The highest multiplier advances.'],
    ['Empezá con $1 y duplicá tu banca en cada mano hasta superar el millón.','Start with $1 and double your bankroll every hand until you pass one million.'],
    ['Escalá diez niveles de Crash. Cada etapa exige sobrevivir cinco segundos más.','Climb ten Crash levels. Each stage requires surviving five more seconds.'],
    ['Superá una ruta aleatoria por todo el catálogo del casino antes que tu rival.','Complete a random route through the casino catalog before your rival.'],
    ['Completá una ruta individual contrarreloj, marcá tu récord y escalá la leaderboard global.','Complete a solo timed route, set your record, and climb the global leaderboard.'],
    ['RETA A TU AMIGO PARA DESCUBRIR QUIEN ES EL MAESTRO DE LA RULETA','CHALLENGE YOUR FRIEND TO FIND THE ROULETTE MASTER'],
    ['RETA A TU AMIGO PARA DESCUBRIR QUIEN ES EL MAESTRO DE LOS SLOTS','CHALLENGE YOUR FRIEND TO FIND THE SLOTS MASTER'],
    ['GIRA PARA OBTENER LA APUESTA!','SPIN TO GET YOUR BET!'],['GIRA PARA OBTENER TU DESAFIO!','SPIN TO GET YOUR CHALLENGE!'],
    ['OBTUVISTE TU APUESTA! INGRESA TU BALANCE ANTES DE JUGAR','YOU GOT YOUR BET! ENTER YOUR BALANCE BEFORE PLAYING'],
    ['OBTUVISTE TU DESAFIO! INGRESA TU BALANCE ANTES DE JUGAR','YOU GOT YOUR CHALLENGE! ENTER YOUR BALANCE BEFORE PLAYING'],
    ['YA JUGASTE? INGRESA TU BALANCE POSTERIOR','DONE PLAYING? ENTER YOUR BALANCE AFTER PLAYING'],
    ['Ingresa tu balance antes de hacer el desafio','Enter your balance before completing the challenge'],['Ingresa tu balance despues de hacer el desafio','Enter your balance after completing the challenge'],
    ['1. Cada jugador, en su turno, gira para obtener su apuesta: una JUGADA (dónde apostar en el paño) y las TIRADAS (cuántos spins de ruleta).','1. On each turn, spin to receive a BET (where to bet on the table) and a number of SPINS.'],
    ['2. Ingresa tu balance, anda a la ruleta de tu casino y juga la jugada esa cantidad de tiradas.','2. Enter your balance, open your casino roulette and play the assigned bet for that number of spins.'],
    ['3. Al volver, ingresa tu balance posterior. Tu rendimiento del turno es la variación porcentual.','3. Return and enter your final balance. Your turn performance is the percentage change.'],
    ['4. Son 3 rounds con un turno por jugador. Gana el que acumula el mejor rendimiento — aunque todos pierdan, gana el que perdió menos.','4. There are 3 rounds with one turn per player. The best cumulative performance wins, even if everyone loses.'],
    ['1. Cada jugador, en su turno, gira para obtener su desafio: un SLOT (a qué juego ir) y un CHALLENGE (cuántos giros, con una condición que puede sumarte o restarte giros).','1. On each turn, spin to receive a SLOT and a CHALLENGE with a condition that may add or remove spins.'],
    ['2. Ingresa tu balance, anda al slot de tu casino y juga los giros que te tocaron.','2. Enter your balance, open the assigned casino slot and play your spins.'],
    ['4. Son 4 rounds con un turno por jugador — un recorrido por la isla. Gana el que acumula el mejor rendimiento, aunque todos pierdan.','4. There are 4 rounds with one turn per player. The best cumulative performance wins, even if everyone loses.'],
    ['Al clickear JUGAR estas aceptando que ni DeltaBet.xyz ni Gods Roulette se haran cargo de tus perdidas o ganancias. Si no quieres perder $, te recomendamos jugar ruletas de prueba.','By clicking PLAY, you accept that neither DeltaBet.xyz nor Gods Roulette is responsible for your wins or losses. Use demo roulette if you do not want to risk money.'],
    ['Al clickear JUGAR estas aceptando que ni DeltaBet.xyz ni Magic Island se haran cargo de tus perdidas o ganancias. Si no quieres perder $, te recomendamos jugar slots de prueba.','By clicking PLAY, you accept that neither DeltaBet.xyz nor Magic Island is responsible for your wins or losses. Use demo slots if you do not want to risk money.'],
  ];
  const esToEn = new Map(pairs);
  const enToEs = new Map(pairs.map(([es,en]) => [en,es]));

  function translateText(value) {
    const map = language === 'en' ? esToEn : enToEs;
    const trimmed = value.trim();
    if (map.has(trimmed)) return value.replace(trimmed, map.get(trimmed));
    if (language === 'en') {
      return value
        .replace(/^Turno de (.+) — Round (\d+)$/, 'Turn for $1 — Round $2')
        .replace(/^Jugador (\d+)$/, 'Player $1')
        .replace(/^(\d+) tiradas$/, '$1 spins')
        .replace(/ — riesgo bajo$/, ' — low risk').replace(/ — riesgo medio$/, ' — medium risk').replace(/ — riesgo alto$/, ' — high risk')
        .replace(/^Próxima victoria: (.+)\.$/, 'Next win: $1.')
        .replace(/^Sobreviví (\d+) segundos para avanzar\.$/, 'Survive $1 seconds to advance.')
        .replace(/^(\d+) de (\d+) etapas completadas\.$/, '$1 of $2 stages completed.')
        .replace(/^(\d+) de (\d+) objetivos completados\.$/, '$1 of $2 objectives completed.')
        .replace(/^¡BINGO! Tarjeta completada\.$/, 'BINGO! Card completed.')
        .replace(/^Generá un recorrido para comenzar\.$/, 'Generate a run to begin.')
        .replace(/^(\d+) de (\d+) etapas completadas\. El reloj sigue corriendo\.$/, '$1 of $2 stages completed. The clock is still running.')
        .replace(/^0 de (\d+) etapas completadas\. ¡El reloj está corriendo!$/, '0 of $1 stages completed. The clock is running!')
        .replace(/^¡Whole Ride completado en (.+)! Quedaste #(\d+) en la leaderboard demo\.$/, 'Whole Ride completed in $1! You ranked #$2 on the demo leaderboard.');
    }
    return value
      .replace(/^Turn for (.+) — Round (\d+)$/, 'Turno de $1 — Round $2')
      .replace(/^Player (\d+)$/, 'Jugador $1')
      .replace(/^(\d+) spins$/, '$1 tiradas')
      .replace(/ — low risk$/, ' — riesgo bajo').replace(/ — medium risk$/, ' — riesgo medio').replace(/ — high risk$/, ' — riesgo alto')
      .replace(/^Next win: (.+)\.$/, 'Próxima victoria: $1.')
      .replace(/^Survive (\d+) seconds to advance\.$/, 'Sobreviví $1 segundos para avanzar.')
      .replace(/^(\d+) of (\d+) stages completed\. The clock is still running\.$/, '$1 de $2 etapas completadas. El reloj sigue corriendo.')
      .replace(/^0 of (\d+) stages completed\. The clock is running!$/, '0 de $1 etapas completadas. ¡El reloj está corriendo!')
      .replace(/^Whole Ride completed in (.+)! You ranked #(\d+) on the demo leaderboard\.$/, '¡Whole Ride completado en $1! Quedaste #$2 en la leaderboard demo.')
      .replace(/^(\d+) of (\d+) stages completed\.$/, '$1 de $2 etapas completadas.')
      .replace(/^(\d+) of (\d+) objectives completed\.$/, '$1 de $2 objetivos completados.');
  }

  function apply(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { if (node.parentElement && !['SCRIPT','STYLE'].includes(node.parentElement.tagName)) node.nodeValue = translateText(node.nodeValue); });
    root.querySelectorAll?.('input[placeholder]').forEach(el => { if (el.placeholder === 'Multiplicador X') el.placeholder = language === 'en' ? 'Multiplier X' : 'Multiplicador X'; });
    document.documentElement.lang = language;
    document.querySelectorAll('[data-lang-choice]').forEach(btn => btn.classList.toggle('active', btn.dataset.langChoice === language));
  }

  let toggle = document.querySelector('.universal-language');
  if (!toggle) {
    toggle = document.createElement('div');
    toggle.className = 'universal-language';
    toggle.innerHTML = '<button type="button" data-lang-choice="en">EN</button><button type="button" data-lang-choice="es">ES</button>';
    (document.querySelector('.header-nav') || document.querySelector('header')).appendChild(toggle);
  }
  toggle.querySelectorAll('button').forEach(btn => btn.onclick = () => { const next = btn.dataset.langChoice; if (next === language) return; location.search = next === 'es' ? '?lang=es' : ''; });
  apply();
  new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { if (n.nodeType === 1) apply(n); else if (n.nodeType === 3) n.nodeValue = translateText(n.nodeValue); }))).observe(document.body, { childList: true, subtree: true });
  if (document.body.dataset.game && !document.querySelector('script[data-catalog-launcher]')) {
    const launcherScript = document.createElement('script');
    launcherScript.src = '/challenge-games/launcher.js';
    launcherScript.dataset.catalogLauncher = 'true';
    document.body.appendChild(launcherScript);
  }
})();
