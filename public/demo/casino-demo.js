const $ = (id) => document.getElementById(id);
const pages = ['home','deltabet','keno-lobby','roulette-lobby','road-lobby','delta-game','casino-game','result','roulette-delta','roulette-casino','roulette-result','road-game','road-casino','match-moment'];
const ROULETTE_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
let picked = [];
let difficulty='medium';
const difficultyConfig={
  easy:{label:'Easy',count:3,word:'three'},
  medium:{label:'Medium',count:6,word:'six'},
  hard:{label:'Hard',count:10,word:'ten'},
};
const catalog = [
  ['gods-roulette',"God's Roulette",'PVP MATCH','/assets/gods-roulette/bg-main.png'],
  ['delta-pick-keno','DeltaPick Keno','PVP MATCH','/assets/game-catalog/delta-pick-keno/background.png'],
  ['road-to-millionaire','Road to Millionaire','SOLO RUN','/assets/game-catalog/road-to-millionaire/background.png'],
  ['magic-island','Magic Island','PVP MATCH','/assets/magic-island/bg-island.png'],
  ['vs-chat','VS Chat','STREAMER VS CHAT','/assets/vs-chat/bg-main-v2.png'],
  ['delta-pick-bombs','DeltaPick Bombs','PVP MATCH','/assets/game-catalog/delta-pick-bombs/background.png'],
  ['keno-solo-run','Keno Solo Run','SOLO RUN · DEMO','/assets/game-catalog/keno-solo-run/background.png'],
  ['bombs-solo-run','Bombs Solo Run','SOLO RUN','/assets/game-catalog/bombs-solo-run/background.png'],
  ['roulette-bingo','Roulette Bingo','PVP MATCH','/assets/game-catalog/roulette-bingo/background.png'],
  ['bonus-duel','Bonus Duel','PVP MATCH','/assets/game-catalog/bonus-duel/background.png'],
  ['everest','Everest','SOLO RUN','/assets/game-catalog/everest/background.png'],
  ['whole-ride','Whole Ride','SOLO RUN','/assets/game-catalog/whole-ride/background.png'],
];
const rouletteChallenges=[
  {key:'red',name:'Bet on red',detail:'Place a $5 bet on RED for every spin.',bar:'RED · $5',spins:3,multiplier:2,match:n=>n>0&&ROULETTE_RED.has(n)},
  {key:'black',name:'Bet on black',detail:'Place a $5 bet on BLACK for every spin.',bar:'BLACK · $5',spins:3,multiplier:2,match:n=>n>0&&!ROULETTE_RED.has(n)},
  {key:'odd',name:'Bet on odd',detail:'Place a $5 bet on ODD for every spin.',bar:'ODD · $5',spins:4,multiplier:2,match:n=>n>0&&n%2===1},
  {key:'high',name:'High numbers',detail:'Place a $5 bet on 19–36 for every spin.',bar:'19–36 · $5',spins:4,multiplier:2,match:n=>n>=19},
  {key:'dozen',name:'First dozen',detail:'Place a $5 bet on the 1st dozen (1–12).',bar:'1ST DOZEN · $5',spins:3,multiplier:3,match:n=>n>=1&&n<=12},
  {key:'seven',name:'Lucky seven',detail:'Place a $5 straight-up bet on number 7.',bar:'STRAIGHT 7 · $5',spins:3,multiplier:36,match:n=>n===7},
];
let roulettePlayers=[{name:'River912',balance:840,last:null,total:1},{name:'LunaPeak',balance:840,last:null,total:1}];
let roulettePlayerIndex=0,rouletteRound=1,rouletteChallenge=null,rouletteSpins=0,rouletteTurnStart=840,rouletteResults=[],rouletteTurnScored=false;
const startingBalance=840;
let kenoPlayers=[{name:'River912',balance:840,last:null,total:1},{name:'LunaPeak',balance:840,last:null,total:1}];
let kenoPlayerIndex=0,kenoRound=1,kenoTurnStart=840,kenoTurnScored=false;
let kenoTurnReturn=0,kenoTurnHits=0;
let kenoShots=1;
let progress=0,balance=startingBalance;
let momentMode='keno',momentFinal=false;
let roadStep=0,roadHandWon=false,roadHandPlayed=false;

function randomTicket(count){
  const numbers=new Set();
  while(numbers.size<count)numbers.add(1+Math.floor(Math.random()*40));
  return [...numbers].sort((a,b)=>a-b);
}

function prepareKenoMatch(){
  const names=[...document.querySelectorAll('.keno-player-row input')].map(input=>input.value.trim()).filter(Boolean);
  kenoPlayers=(names.length>=2?names:['River912','LunaPeak']).map(name=>({name,balance:840,last:null,total:1}));
  kenoPlayerIndex=0;kenoRound=1;
  prepareKenoTurn();
}

function prepareKenoTurn(){
  const config=difficultyConfig[difficulty];
  picked=randomTicket(config.count);
  kenoShots=1+Math.floor(Math.random()*4);
  progress=0;
  const player=kenoPlayers[kenoPlayerIndex];
  balance=player.balance;
  kenoTurnStart=player.balance;
  kenoTurnScored=false;
  $('assigned-numbers').innerHTML=picked.map(number=>`<b>${number}</b>`).join('');
  $('keno-required-shots').textContent=kenoShots;
  $('bar-numbers').textContent=picked.join(' · ');
  $('delta-kicker').textContent=`DELTAPICK KENO · ${config.label.toUpperCase()} CHALLENGE`;
  $('keno-turn-title').textContent=`${player.name}'s turn`;
  $('delta-run-copy').textContent=`Round ${kenoRound} of 5 · Play the assigned ${config.word}-number selection for ${kenoShots} ${kenoShots===1?'shot':'shots'} inside Moobet Keno.`;
  $('keno-current-player').textContent=player.name;
  $('keno-current-round').textContent=`${kenoRound} / 5`;
  $('keno-starting-balance').textContent=money(player.balance);
  document.querySelectorAll('.keno-lobby-difficulty [data-difficulty]').forEach(button=>button.classList.toggle('active',button.dataset.difficulty===difficulty));
  $('delta-status').textContent='Ready';
  $('play-ticket').disabled=false;
  $('play-ticket').classList.remove('is-complete');
  $('play-ticket').textContent=`Start game · shot 1 of ${kenoShots}`;
  $('challenge-notification').classList.add('hidden');
  renderKeno();
  updateKenoCasino();
}

function showPage(name){
  pages.forEach(page=>$("page-"+page).classList.toggle('hidden',page!==name));
  document.querySelectorAll('[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===name));
}

function money(value){return `$${value.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;}
function setWalletBalance(value){$('wallet-balance-value').textContent=money(value);}

function renderCatalog(){
  const interactive=new Set(['delta-pick-keno','gods-roulette','road-to-millionaire']);
  $('delta-catalog').innerHTML=catalog.map(([slug,name,type,bg])=>`<article class="catalog-game ${interactive.has(slug)?'is-demo':''}" data-game="${slug}"><div class="catalog-game-art" style="background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.38)),url('${bg}')"></div><div class="catalog-game-copy"><small>${type}</small><strong>${name}</strong><span>${interactive.has(slug)?'INTERACTIVE DEMO':'CATALOG PREVIEW'}</span></div></article>`).join('');
  document.querySelector('[data-game="delta-pick-keno"]').onclick=()=>showPage('keno-lobby');
  document.querySelector('[data-game="gods-roulette"]').onclick=()=>showPage('roulette-lobby');
  document.querySelector('[data-game="road-to-millionaire"]').onclick=()=>showPage('road-lobby');
}

function roadMoney(step){return 2**step;}
function compactRoadMoney(value){return value>=1000000?`$${(value/1000000).toFixed(2)}M`:value>=1000?`$${(value/1000).toFixed(value>=10000?0:1)}K`:`$${value}`;}

function renderRoad(){
  const current=roadMoney(roadStep),next=roadMoney(Math.min(20,roadStep+1));
  $('road-step-label').textContent=roadStep>=20?'Journey complete':`Step ${roadStep+1} of 20`;
  $('road-bankroll').textContent=compactRoadMoney(current);
  $('road-next-target').textContent=roadStep>=20?'$1.05M':compactRoadMoney(next);
  $('road-step-number').textContent=String(Math.min(20,roadStep+1)).padStart(2,'0');
  $('road-next-title').textContent=roadStep>=20?'Millionaire status unlocked':`Win a ${compactRoadMoney(current)} Blackjack hand`;
  $('road-next-copy').textContent=roadStep>=20?'Your verified run is complete and ready for the global leaderboard.':'One verified hand at a time. Win to advance; lose and the run resets to $1.';
  document.querySelector('.road-next-card>b').textContent=roadStep>=20?'🏆':`→ ${compactRoadMoney(next)}`;
  $('road-track').innerHTML=Array.from({length:20},(_,index)=>`<i class="${index<roadStep?'complete':index===roadStep?'active':''}">${index+1}</i>`).join('');
  $('road-rank-progress').textContent=`${roadStep} / 20`;
  $('open-road-blackjack').textContent=roadStep>=20?'Start a new run ↻':'Open Moobet Blackjack →';
}

function openRoadCasino(){
  if(roadStep>=20){roadStep=0;renderRoad();return;}
  roadHandPlayed=false;roadHandWon=false;
  $('road-dealer-cards').innerHTML='<i>?</i><i>?</i>';$('road-player-cards').innerHTML='<i>?</i><i>?</i>';
  $('road-hand-status').textContent='PLACE YOUR CHALLENGE BET';
  $('road-casino-stake').textContent=compactRoadMoney(roadMoney(roadStep));
  $('road-bar-step').textContent=`${roadStep+1} / 20`;$('road-bar-bet').textContent=compactRoadMoney(roadMoney(roadStep));$('road-bar-target').textContent=compactRoadMoney(roadMoney(roadStep+1));$('road-bar-status').textContent='READY';
  document.querySelector('.road-game-bar .dock-progress').style.setProperty('--dock-progress',roadStep/20);
  $('road-notification').classList.add('hidden');$('play-road-hand').disabled=false;$('play-road-hand').textContent='Deal verified hand';showPage('road-casino');
}

function card(){const values=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];return values[Math.floor(Math.random()*values.length)];}
function playRoadHand(){
  if(roadHandPlayed)return;roadHandPlayed=true;roadHandWon=Math.random()<.78;
  $('road-dealer-cards').innerHTML=`<i>${card()}</i><i>${card()}</i>`;$('road-player-cards').innerHTML=`<i>${card()}</i><i>${card()}</i>`;
  $('road-hand-status').textContent=roadHandWon?'HAND WON · STEP VERIFIED':'HAND LOST · RUN RESET';
  $('road-bar-status').textContent=roadHandWon?'WON':'RESET';$('play-road-hand').disabled=true;
  $('road-notification-kicker').textContent='HAND VERIFIED';$('road-notification-title').textContent=roadHandWon?'Step complete':'Run reset';$('road-notification-copy').textContent=roadHandWon?'Return to DeltaBet to unlock the next step.':'Return to DeltaBet and begin again from $1.';
  setTimeout(()=>$('road-notification').classList.remove('hidden'),500);
}

function finishRoadHand(){roadStep=roadHandWon?Math.min(20,roadStep+1):0;renderRoad();showPage('road-game');}

function prepareRouletteMatch(){
  const names=[...document.querySelectorAll('.roulette-integrated-lobby .integrated-player-row input')].map(input=>input.value.trim()).filter(Boolean);
  roulettePlayers=(names.length>=2?names:['River912','LunaPeak']).map(name=>({name,balance:840,last:null,total:1}));
  roulettePlayerIndex=0;rouletteRound=1;
  prepareRouletteTurn();
}

function prepareRouletteTurn(){
  rouletteChallenge=rouletteChallenges[Math.floor(Math.random()*rouletteChallenges.length)];
  rouletteSpins=0;rouletteResults=[];rouletteTurnScored=false;
  const player=roulettePlayers[roulettePlayerIndex];
  rouletteTurnStart=player.balance;
  $('roulette-turn-title').textContent=`${player.name}'s turn`;
  $('roulette-turn-subtitle').textContent=`Round ${rouletteRound} of 5 · Complete the assigned bet inside Moobet Roulette.`;
  $('roulette-bet-name').textContent=rouletteChallenge.name;
  $('roulette-bet-detail').textContent=rouletteChallenge.detail;
  $('roulette-required-spins').textContent=rouletteChallenge.spins;
  $('roulette-player').textContent=player.name;
  $('roulette-round').textContent=`${rouletteRound} / 5`;
  $('roulette-starting-balance').textContent=money(player.balance);
  $('roulette-status').textContent='Ready';
  $('roulette-notification').classList.add('hidden');
  $('spin-roulette').disabled=false;
  setWalletBalance(player.balance);
  renderRouletteChallengeBoard();
}

function rouletteColor(number){return number===0?'green':ROULETTE_RED.has(number)?'red':'black';}

function rouletteChallengeCellTarget(number){
  if(!rouletteChallenge)return false;
  if(rouletteChallenge.key==='seven')return number===7;
  return false;
}

function renderRouletteChallengeBoard(){
  let cells=`<div class="roulette-challenge-cell green" style="grid-column:1;grid-row:1/4">0</div>`;
  for(let number=1;number<=36;number++){
    const column=Math.ceil(number/3)+1;
    const row=3-((number-1)%3);
    cells+=`<div class="roulette-challenge-cell ${rouletteColor(number)} ${rouletteChallenge.match(number)?'covered':''} ${rouletteChallengeCellTarget(number)?'target':''}" style="grid-column:${column};grid-row:${row}">${number}</div>`;
  }
  const outside=[['low','1–18'],['even','EVEN'],['red','RED'],['black','BLACK'],['odd','ODD'],['high','19–36']];
  cells+=`<div class="roulette-challenge-outside" style="grid-row:4">${outside.map(([key,label])=>`<span class="${rouletteChallenge.key===key?'target':''}">${label}${rouletteChallenge.key===key?'<i>$5 · BET HERE</i>':''}</span>`).join('')}</div>`;
  if(rouletteChallenge.key==='dozen')cells+=`<div class="roulette-dozen-indicator"><i>$5</i><strong>BET ON 1ST DOZEN</strong><span>Numbers 1–12</span></div>`;
  $('roulette-challenge-board').innerHTML=cells;
}

function renderRouletteBoard(){
  let cells=`<div class="roulette-number green" style="grid-column:1;grid-row:1/4">0</div>`;
  for(let number=1;number<=36;number++){
    const column=Math.ceil(number/3)+1;
    const row=3-((number-1)%3);
    cells+=`<div class="roulette-number ${rouletteColor(number)}" style="grid-column:${column};grid-row:${row}">${number}</div>`;
  }
  $('roulette-board').innerHTML=cells;
}

function updateRouletteCasino(){
  const player=roulettePlayers[roulettePlayerIndex];
  $('roulette-bar-player').textContent=player.name;
  $('roulette-bar-bet').textContent=rouletteChallenge.bar;
  $('roulette-bar-spins').textContent=`${rouletteSpins} / ${rouletteChallenge.spins}`;
  document.querySelector('.roulette-game-bar .dock-progress').style.setProperty('--dock-progress',rouletteSpins/rouletteChallenge.spins);
  $('roulette-bar-round').textContent=`${rouletteRound} / 5`;
  $('roulette-bar-balance').textContent=money(player.balance);
  $('roulette-last-results').innerHTML=rouletteResults.length?rouletteResults.map(number=>`<span class="${rouletteColor(number)}">${number}</span>`).join(''):'<em>Spin to reveal the first result</em>';
  setWalletBalance(player.balance);
}

function startRouletteCasino(){
  rouletteSpins=0;rouletteResults=[];rouletteTurnScored=false;
  rouletteTurnStart=roulettePlayers[roulettePlayerIndex].balance;
  $('roulette-result-number').textContent='?';
  $('roulette-status').textContent='In progress';
  $('roulette-notification').classList.add('hidden');
  $('spin-roulette').disabled=false;
  renderRouletteBoard();updateRouletteCasino();showPage('roulette-casino');
}

function spinRoulette(){
  if(rouletteSpins>=rouletteChallenge.spins)return;
  const result=Math.floor(Math.random()*37);
  const player=roulettePlayers[roulettePlayerIndex];
  player.balance=Math.round((player.balance-5+(rouletteChallenge.match(result)?5*rouletteChallenge.multiplier:0))*100)/100;
  rouletteResults.unshift(result);rouletteSpins++;
  $('roulette-result-number').textContent=result;
  const wheel=document.querySelector('.roulette-wheel');wheel.classList.remove('is-spinning');void wheel.offsetWidth;wheel.classList.add('is-spinning');
  updateRouletteCasino();
  if(rouletteSpins===rouletteChallenge.spins&&!rouletteTurnScored){
    rouletteTurnScored=true;
    const performance=player.balance/rouletteTurnStart;
    player.last=performance;player.total*=performance;
    $('roulette-status').textContent='Verified';
    $('spin-roulette').disabled=true;
    setTimeout(()=>$('roulette-notification').classList.remove('hidden'),500);
  }
}

function showRouletteResult(){
  const player=roulettePlayers[roulettePlayerIndex];
  $('roulette-result-player').textContent=`${player.name.toUpperCase()} · ROUND ${rouletteRound}`;
  $('roulette-performance').textContent=formatMultiplier(player.last||1);
  $('roulette-performance').style.color=(player.last||1)>=1?'#64db91':'#ff646d';
  $('roulette-result-balances').textContent=`${money(rouletteTurnStart)} → ${money(player.balance)}`;
  const endOfRound=roulettePlayerIndex===roulettePlayers.length-1;
  const finalTurn=rouletteRound===5&&endOfRound;
  $('next-roulette-turn').innerHTML=finalTurn?'Reveal the winner <b>★</b>':endOfRound?`View round ${rouletteRound} standings <b>→</b>`:`Start ${roulettePlayers[roulettePlayerIndex+1].name}'s turn <b>→</b>`;
  showPage('roulette-result');
}

function nextRouletteTurn(){
  if(roulettePlayerIndex===roulettePlayers.length-1){showMatchMoment('roulette',rouletteRound===5);return;}
  roulettePlayerIndex++;
  prepareRouletteTurn();showPage('roulette-delta');
}

function renderKeno(){
  $('keno-board').innerHTML=Array.from({length:40},(_,i)=>`<div class="keno-number ${picked.includes(i+1)?'picked':''}" data-number="${i+1}">${i+1}</div>`).join('');
}

function updateKenoCasino(){
  const player=kenoPlayers[kenoPlayerIndex];
  $('bar-progress').textContent=`${progress} / ${kenoShots}`;
  document.querySelector('.keno-game-bar .dock-progress').style.setProperty('--dock-progress',progress/kenoShots);
  $('keno-bar-player').textContent=player.name;
  $('bar-round').textContent=`${kenoRound} / 5`;
  $('bar-balance').textContent=money(balance);
  $('play-ticket').textContent=progress<kenoShots?`Start game · shot ${progress+1} of ${kenoShots}`:'All shots verified';
  setWalletBalance(balance);
}

function startRun(){
  progress=0;balance=kenoPlayers[kenoPlayerIndex].balance;kenoTurnStart=balance;kenoTurnScored=false;kenoTurnReturn=0;kenoTurnHits=0;$('challenge-notification').classList.add('hidden');$('play-ticket').classList.remove('is-complete');$('keno-shot-math').classList.add('hidden');$('keno-board-result').classList.add('hidden');$('delta-status').textContent='In progress';renderKeno();updateKenoCasino();showPage('casino-game');
}

function playTicket(){
  if(progress>=kenoShots){
    if(kenoTurnScored)showKenoResult();
    return;
  }
  $('play-ticket').disabled=true;
  const drawn=new Set();while(drawn.size<10)drawn.add(1+Math.floor(Math.random()*40));
  const hits=picked.filter(number=>drawn.has(number));
  const drawOrder=[...drawn];
  const numberNodes=[...document.querySelectorAll('.keno-number')];
  numberNodes.forEach(node=>{node.classList.remove('drawn','hit');node.style.removeProperty('--reveal-order');});
  void $('keno-board').offsetWidth;
  numberNodes.forEach(node=>{
    const number=Number(node.dataset.number);
    const revealIndex=drawOrder.indexOf(number);
    node.classList.toggle('drawn',revealIndex>=0);
    node.classList.toggle('hit',hits.includes(number));
    node.style.setProperty('--reveal-order',Math.max(0,revealIndex));
  });
  const payoutTables={
    3:[0,0,1,8],
    6:[0,0,.5,1.5,5,15,50],
    10:[0,0,0,.5,1,2,5,12,30,80,200],
  };
  const payoutMultipliers=payoutTables[picked.length];
  const shotNumber=progress+1;
  const payout=Math.round(5*payoutMultipliers[hits.length]*100)/100;
  balance=Math.round((balance-5+payout)*100)/100;progress++;
  const shotMultiplier=payout/5;
  const turnMultiplier=balance/kenoTurnStart;
  kenoTurnReturn+=payout;kenoTurnHits+=hits.length;
  $('keno-math-shot').textContent=`${shotNumber} / ${kenoShots}`;
  $('keno-math-hits').textContent=`${hits.length} / ${picked.length}`;
  $('keno-math-return').textContent=money(payout);
  $('keno-math-payout').textContent=`${shotMultiplier.toFixed(2)}X`;
  $('keno-math-payout').className=shotMultiplier>1?'win':shotMultiplier===1?'push':'loss';
  $('keno-math-turn').textContent=`${turnMultiplier.toFixed(3)}X`;
  $('keno-math-turn').className=turnMultiplier>1?'win':turnMultiplier===1?'push':'loss';
  $('keno-shot-math').classList.remove('hidden');
  const shotState=shotMultiplier>1?'profit':shotMultiplier>0?'partial':'miss';
  $('keno-board-result').className=`keno-board-result ${shotState}`;
  $('keno-board-result-label').textContent=shotState==='profit'?'WIN':shotState==='partial'?'PARTIAL RETURN':'NO RETURN';
  $('keno-board-result-x').textContent=`${shotMultiplier.toFixed(2)}X`;
  $('keno-board-result-money').textContent=`${money(payout)} RETURN`;
  updateKenoCasino();
  if(progress<kenoShots)setTimeout(()=>{$('play-ticket').disabled=false;},900);
  if(progress===kenoShots&&!kenoTurnScored){
    kenoTurnScored=true;
    const player=kenoPlayers[kenoPlayerIndex];
    player.balance=balance;
    player.last=balance/kenoTurnStart;
    player.total*=player.last;
    $('delta-status').textContent='Verified';
    $('challenge-notification').classList.add('hidden');
    $('play-ticket').textContent='View verified turn →';
    $('play-ticket').classList.add('is-complete');
    $('play-ticket').disabled=false;
  }
}

function formatMultiplier(value){return `${value.toFixed(3)}X`;}

function showKenoResult(){
  const player=kenoPlayers[kenoPlayerIndex];
  $('keno-result-player').textContent=`${player.name.toUpperCase()} · ROUND ${kenoRound}`;
  $('keno-multiplier').textContent=formatMultiplier(player.last||1);
  const totalStake=kenoShots*5;
  const outcome=kenoTurnReturn>totalStake?'profit':kenoTurnReturn>0?'partial':'miss';
  $('keno-multiplier').style.color=outcome==='profit'?'#64db91':outcome==='partial'?'#f2bd49':'#ff646d';
  $('keno-result-balances').textContent=`${money(kenoTurnStart)} → ${money(player.balance)}`;
  $('keno-result-outcome').textContent=outcome==='profit'?`${money(kenoTurnReturn-totalStake)} NET WIN · ${kenoTurnHits} HITS`:outcome==='partial'?`${money(kenoTurnReturn)} PARTIAL RETURN · ${kenoTurnHits} HITS`:`NO PAYOUT · ${kenoTurnHits} HITS`;
  $('keno-result-outcome').className=outcome;
  const endOfRound=kenoPlayerIndex===kenoPlayers.length-1;
  const finalTurn=kenoRound===5&&endOfRound;
  $('next-keno-turn').innerHTML=finalTurn?'Reveal the winner <b>★</b>':endOfRound?`View round ${kenoRound} standings <b>→</b>`:`Start ${kenoPlayers[kenoPlayerIndex+1].name}'s turn <b>→</b>`;
  showPage('result');
}

function nextKenoTurn(){
  if(kenoPlayerIndex===kenoPlayers.length-1){showMatchMoment('keno',kenoRound===5);return;}
  kenoPlayerIndex++;
  prepareKenoTurn();showPage('delta-game');
}

function showMatchMoment(mode,isFinal){
  momentMode=mode;momentFinal=isFinal;
  const isRoulette=mode==='roulette';
  const players=isRoulette?roulettePlayers:kenoPlayers;
  const round=isRoulette?rouletteRound:kenoRound;
  const ranked=players.slice().sort((a,b)=>b.total-a.total);
  const panel=$('match-moment');
  panel.classList.toggle('roulette',isRoulette);panel.classList.toggle('final',isFinal);
  $('moment-kicker').textContent=isFinal?'MATCH COMPLETE · VERIFIED RESULT':`ROUND ${round} COMPLETE`;
  $('moment-trophy').textContent=isFinal?'🏆':'◆';
  $('moment-title').textContent=isFinal?`${ranked[0].name} wins!`:`${ranked[0].name} takes the lead`;
  $('moment-copy').textContent=isFinal?`${ranked[0].name} finishes the five-round match on top. Final standings are locked.`:`Every turn is verified. The leaderboard is locked for round ${round} and the next challenge is ready.`;
  $('moment-standings').innerHTML=ranked.map((player,index)=>`<div class="moment-standing"><span>${index+1}</span><strong>${player.name}</strong><b>${formatMultiplier(player.total)}</b></div>`).join('');
  $('continue-match').innerHTML=isFinal?'Play another match <b>↻</b>':`Start round ${round+1} <b>→</b>`;
  showPage('match-moment');
}

function continueMatch(){
  if(momentMode==='roulette'){
    if(momentFinal){prepareRouletteMatch();showPage('roulette-delta');return;}
    roulettePlayerIndex=0;rouletteRound++;prepareRouletteTurn();showPage('roulette-delta');return;
  }
  if(momentFinal){prepareKenoMatch();showPage('delta-game');return;}
  kenoPlayerIndex=0;kenoRound++;prepareKenoTurn();showPage('delta-game');
}

document.querySelectorAll('[data-page]').forEach(button=>button.onclick=()=>showPage(button.dataset.page));
document.querySelectorAll('[data-casino]').forEach(button=>button.onclick=()=>showPage('casino-game'));
document.querySelectorAll('.keno-lobby-difficulty [data-difficulty]').forEach(button=>button.onclick=()=>{difficulty=button.dataset.difficulty;document.querySelectorAll('.keno-lobby-difficulty [data-difficulty]').forEach(option=>option.classList.toggle('active',option.dataset.difficulty===difficulty));});
$('start-keno-demo').onclick=()=>{prepareKenoMatch();showPage('delta-game');};
$('start-roulette-demo').onclick=()=>{prepareRouletteMatch();showPage('roulette-delta');};
$('keno-lobby-instructions').onclick=()=>{prepareKenoMatch();showPage('delta-game');};
$('roulette-lobby-instructions').onclick=()=>{prepareRouletteMatch();showPage('roulette-delta');};
$('add-roulette-player').onclick=()=>{
  const players=document.querySelectorAll('.roulette-integrated-lobby .integrated-player-row');
  if(players.length>=3)return;
  const row=document.createElement('div');row.className='integrated-player-row';row.innerHTML=`<input value="Player ${players.length+1}" maxlength="18"><span>Challenger</span>`;
  $('add-roulette-player').before(row);
};
$('add-keno-player').onclick=()=>{
  const players=document.querySelectorAll('.keno-player-row');
  if(players.length>=3)return;
  const row=document.createElement('div');row.className='integrated-player-row keno-player-row';row.innerHTML=`<input value="Player ${players.length+1}" maxlength="18"><span>Challenger</span>`;
  $('add-keno-player').before(row);
};
$('open-casino-game').onclick=startRun;
$('open-casino-roulette').onclick=startRouletteCasino;
$('spin-roulette').onclick=spinRoulette;
$('roulette-notification').onclick=showRouletteResult;
$('next-roulette-turn').onclick=nextRouletteTurn;
$('play-ticket').onclick=playTicket;
$('challenge-notification').onclick=showKenoResult;
$('next-keno-turn').onclick=nextKenoTurn;
$('continue-match').onclick=continueMatch;
$('start-road-demo').onclick=()=>{renderRoad();showPage('road-game');};
$('open-road-blackjack').onclick=openRoadCasino;
$('play-road-hand').onclick=playRoadHand;
$('road-notification').onclick=finishRoadHand;
renderCatalog();prepareKenoMatch();showPage('home');
