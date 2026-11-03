(()=>{'use strict';
const $=id=>document.getElementById(id),TAU=WheelEngine.TAU,canvas=$('wheel'),ctx=canvas.getContext('2d');
const defaultNames=['WDW','FAWDWA','WDA','WADW','WWA','ADWA'];
const palette=['#d0d8ed','#9976f8','#363d51','#abb8d5','#42495e','#252a39','#d9caff','#7765c5','#aeb5cf','#514a73'];
let names=defaultNames.slice(),selected='',removeWinner=false,soundOn=true,rotation=0,spinning=false,lastSector=-1,history=[],theme='dark',lastWinner='',lastWinnerIndex=-1,winnerAlreadyRemoved=false,previousFocus=null;
const settingsKey='wheelOfNamesSettingsV2',historyKey='wheelOfNamesHistoryV2';
function readJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
const prior=readJSON(settingsKey)||readJSON('spinXZSettings');
if(prior&&Array.isArray(prior.names)){const validated=prior.names.map(v=>String(v).trim()).filter(Boolean).slice(0,1000);if(validated.length>=2){names=validated;selected=names.includes(prior.selected||prior.chosen)?(prior.selected||prior.chosen):'';removeWinner=!!(prior.removeWinner??prior.remove);soundOn=(prior.soundOn??prior.sound)!==false}}
const past=readJSON(historyKey)||readJSON('wheelWinnerHistory');if(Array.isArray(past))history=past.slice(0,1000).map(x=>typeof x==='string'?{name:x,time:null}:x).filter(x=>x&&typeof x.name==='string');
try{theme=localStorage.getItem('wheelOfNamesTheme')==='light'?'light':'dark'}catch{}
function persist(){try{localStorage.setItem(settingsKey,JSON.stringify({names,selected,removeWinner,soundOn}))}catch{}}
function persistHistory(){try{localStorage.setItem(historyKey,JSON.stringify(history))}catch{}}
function setTheme(value){theme=value;document.documentElement.dataset.theme=value;$('theme').setAttribute('aria-pressed',String(value==='light'));$('theme').setAttribute('aria-label',`Switch to ${value==='dark'?'light':'dark'} theme`);$('theme-icon').innerHTML=value==='dark'?'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';try{localStorage.setItem('wheelOfNamesTheme',value)}catch{}}
function renderHistory(){const list=$('history-list');list.replaceChildren();$('history-count').textContent=history.length;if(!history.length){let el=document.createElement('li');el.className='history-empty';el.textContent='No winners yet. Spin to get started.';list.appendChild(el);return}history.slice().reverse().forEach((entry,i)=>{const li=document.createElement('li'),rank=document.createElement('span'),name=document.createElement('span'),time=document.createElement('time');rank.className='rank';rank.textContent=String(history.length-i).padStart(2,'0');name.className='person';name.textContent=entry.name;time.textContent=entry.time?new Date(entry.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'—';li.append(rank,name,time);list.appendChild(li)})}
function draw(angle=rotation){
 const W=canvas.width,C=W/2,R=466,n=names.length,segment=TAU/n;
 ctx.clearRect(0,0,W,W);
 ctx.save();ctx.translate(C,C);ctx.rotate(angle);
 for(let i=0;i<n;i++){
  const a=-Math.PI/2+i*segment,b=a+segment,m=a+segment/2;
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,a,b);ctx.closePath();
  ctx.fillStyle=palette[i%palette.length];ctx.fill();
  ctx.lineWidth=n>80?1.5:n>40?2.5:5;
  ctx.strokeStyle='#202333';ctx.stroke();
  // For dense wheels, label a regular subset of segments to avoid heavy overlap.
  // All entries remain selectable and the actual winner is always displayed in full.
  const labelStride=n>200?Math.ceil(n/160):1;
  if(i%labelStride!==0)continue;
  // Anchor the labels near the outer rim, where the slices are widest.
  ctx.save();
  ctx.rotate(m);
  ctx.translate(R-17,0);
  const onLeft=Math.cos(m)<0;
  if(onLeft){ctx.rotate(Math.PI);ctx.textAlign='left'}
  else ctx.textAlign='right';
  ctx.fillStyle=[2,4,5,7,9].includes(i%palette.length)?'#faf9ff':'#101323';
  const fs=n>200?10:n>=160?9:n>=110?10:n>=70?11:n>=40?12:n>=25?15:Math.max(16,Math.min(36,270/n));
  ctx.font=`800 ${fs}px system-ui,sans-serif`;
  ctx.textBaseline='middle';
  // Allow full names where space permits, otherwise shorten just the wheel label.
  const maxChars=n>200?14:n>=110?18:n>=70?20:26;
  const original=names[i];
  const label=original.length>maxChars?original.slice(0,maxChars-1)+'…':original;
  ctx.fillText(label,0,0,n>=70?Math.min(160,R*.44):235);
  ctx.restore();
 }
 ctx.restore();ctx.beginPath();ctx.arc(C,C,R+7,0,TAU);ctx.lineWidth=16;ctx.strokeStyle='#faf9ff';ctx.stroke();ctx.beginPath();ctx.arc(C,C,R+19,0,TAU);ctx.lineWidth=2;ctx.strokeStyle='#7b66d1';ctx.stroke();
}
function tone(){ WheelSound.tick(); }
// Preline-style Canvas Confetti: bursts are visible in front of the dialog.
let celebrationTimers=[];
function applause(){WheelSound.play()}
function stopCelebration(){
 celebrationTimers.forEach(clearTimeout);celebrationTimers=[];
 if(typeof window.confetti==='function'&&typeof window.confetti.reset==='function')window.confetti.reset();
 document.querySelector('.winner-card')?.classList.remove('celebrating');
 WheelSound.stop();
}
function celebrate(){
 stopCelebration();
 const card=document.querySelector('.winner-card');card?.classList.add('celebrating');
 celebrationTimers.push(setTimeout(()=>card?.classList.remove('celebrating'),2200));
 applause();
 if(typeof window.confetti!=='function')return;
 const colors=['#a078ff','#c8adff','#ffffff','#ffbe56','#52e9ae','#ff70aa','#80c4ff'];
 // Confetti intentionally continues long enough to remain visible on winner modal.
 const burst=(scale=1)=>{
  const base={colors,zIndex:120,ticks:260,gravity:1.05,scalar:1.15,disableForReducedMotion:false};
  window.confetti({...base,particleCount:Math.round(100*scale),spread:80,startVelocity:46,origin:{x:.18,y:.55},angle:63});
  window.confetti({...base,particleCount:Math.round(100*scale),spread:80,startVelocity:46,origin:{x:.82,y:.55},angle:117});
  window.confetti({...base,particleCount:Math.round(90*scale),spread:112,startVelocity:36,origin:{x:.5,y:.33},angle:90});
 };
 burst(1);
 celebrationTimers.push(setTimeout(()=>burst(.65),650));
 celebrationTimers.push(setTimeout(()=>burst(.5),1550));
 celebrationTimers.push(setTimeout(()=>burst(.4),2800));
 celebrationTimers.push(setTimeout(()=>burst(.35),4300));
 celebrationTimers.push(setTimeout(()=>burst(.3),6000));
 // Additional bursts while the popup stays open, then finish naturally.
 celebrationTimers.push(setTimeout(()=>{if($('winner-overlay').classList.contains('show'))burst(.3)},8200));
}
const randomInt=WheelEngine.randomInt;
function spin(){if(spinning||names.length<2)return;stopCelebration();spinning=true;$('spin').disabled=true;$('status').textContent='SPINNING…';$('winner').textContent='—';const n=names.length,index=WheelEngine.chooseIndex(names,selected),segment=TAU/n;const fraction=.15+Math.random()*.70;const start=rotation,finish=WheelEngine.landingRotation(rotation,index,n,6+randomInt(3),fraction),duration=4900+Math.random()*1100,t0=performance.now();lastSector=-1;
function frame(now){const p=Math.min((now-t0)/duration,1),ease=1-(1-p)**4;rotation=start+(finish-start)*ease;draw();const sector=Math.floor((((rotation%TAU)+TAU)%TAU)/segment);if(sector!==lastSector){if(lastSector!==-1)tone();lastSector=sector}if(p<1){requestAnimationFrame(frame);return}rotation=finish;draw();spinning=false;$('spin').disabled=false;const winner=names[index];lastWinner=winner;$('status').textContent='THE WINNER IS';$('winner').textContent=winner;history.push({name:winner,time:Date.now()});persistHistory();renderHistory();announceWinner(winner,index);celebrate()}requestAnimationFrame(frame)}

function removeAnnouncedWinner(){
 if(winnerAlreadyRemoved||!lastWinner)return false;
 // Match the selected index first; names can otherwise have changed after removal.
 const index=names[lastWinnerIndex]===lastWinner?lastWinnerIndex:names.indexOf(lastWinner);
 if(index<0)return false;
 if(names.length<=2){toast('The wheel requires at least 2 participants.');return false}
 names.splice(index,1);winnerAlreadyRemoved=true;
 if(selected===lastWinner)selected='';
 persist();rotation=0;draw();return true;
}
function closeWinnerDialog(){
 const overlay=$('winner-overlay');if(!overlay.classList.contains('show'))return;
 if(removeWinner&&!winnerAlreadyRemoved)removeAnnouncedWinner();
 overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');
 // Confetti fades naturally, but clear audio when dismissed.
 stopCelebration();
 (previousFocus?.isConnected?previousFocus:$('spin')).focus();
}
function announceWinner(name,index){
 lastWinnerIndex=index;winnerAlreadyRemoved=false;
 previousFocus=document.activeElement;
 $('winner-announcement-name').textContent=name;
 $('winner-dialog-sub').textContent=removeWinner?'Closing this popup will remove the winner from the wheel.':'Winner recorded in history.';
 $('winner-dialog-remove').disabled=names.length<=2;
 $('winner-dialog-remove').textContent='Remove';
 $('winner-overlay').classList.add('show');$('winner-overlay').setAttribute('aria-hidden','false');
 $('winner-dialog-close').focus();
}
$('winner-dialog-close').onclick=closeWinnerDialog;
$('winner-dialog-remove').onclick=()=>{if(removeAnnouncedWinner()){closeWinnerDialog();toast('Winner removed from the wheel.')}};
$('winner-overlay').addEventListener('click',e=>{if(e.target===$('winner-overlay'))closeWinnerDialog()});

function parseEntries(){return WheelEngine.entriesFromText($('names').value)}
function updateEntryCount(){const entries=parseEntries(),total=entries.length,counter=$('entry-counter'),error=$('entry-error');$('entry-count').textContent=`${total} / 1000`;counter.classList.toggle('invalid',total<2||total>1000);counter.classList.toggle('valid',total>=2&&total<=1000);error.textContent=total>1000?`${total} names detected. Remove ${total-1000} line${total-1000===1?'':'s'} to reach the 1000-name limit.`:total<2?'Enter at least 2 names.':'';return entries}
function fillSelect(value=selected){const list=$('outcome');list.replaceChildren();const option=document.createElement('option');option.value='';option.textContent='Random (equal chance)';list.appendChild(option);const entries=parseEntries();entries.forEach(name=>{const opt=document.createElement('option');opt.value=name;opt.textContent=name;list.appendChild(opt)});list.value=entries.includes(value)?value:''}
function openSettings(){if($('winner-overlay').classList.contains('show'))return;if(spinning){toast('Finish the current spin first.');return}$('names').value=names.join('\n');$('remove').checked=removeWinner;fillSelect();updateEntryCount();$('modal').classList.add('show');$('names').focus()}
function closeSettings(){$('modal').classList.remove('show')}
let toastTimeout;function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').classList.remove('show'),2600)}
function saveSettings(){if(spinning)return;const entries=updateEntryCount();if(entries.length<2||entries.length>1000){toast(`Found ${entries.length} names; enter between 2 and 1000.`);return}if(entries.some(s=>s.length>40)){toast('Names must contain at most 40 characters.');return}if(new Set(entries.map(s=>s.toLowerCase())).size!==entries.length){toast('Names must be unique.');return}selected=entries.includes($('outcome').value)?$('outcome').value:'';names=entries;removeWinner=$('remove').checked;rotation=0;lastWinner='';$('status').textContent='READY TO SPIN';$('winner').textContent='—';persist();draw();closeSettings()}
$('theme').onclick=()=>setTheme(theme==='dark'?'light':'dark');$('spin').onclick=spin;$('reset').onclick=()=>{if(spinning)return;closeWinnerDialog();stopCelebration();rotation=0;lastWinner='';draw();$('status').textContent='AWAITING NEXT SPIN';$('winner').textContent='—';history=[];persistHistory();renderHistory();toast('Winner history cleared.')};$('sound').onclick=()=>{soundOn=!soundOn;WheelSound.setEnabled(soundOn);$('sound-label').textContent=soundOn?'SOUND: ON':'SOUND: OFF';persist()};$('sound-label').textContent=soundOn?'SOUND: ON':'SOUND: OFF';function toHistory(){$('history').scrollIntoView({behavior:'smooth',block:'center'})}$('header-history').onclick=toHistory;$('header-settings').onclick=openSettings;$('close').onclick=closeSettings;$('save').onclick=saveSettings;$('defaults').onclick=()=>{$('names').value=defaultNames.join('\n');$('remove').checked=false;fillSelect('');updateEntryCount();toast('Defaults loaded. Save to apply.')};$('names').oninput=()=>{fillSelect($('outcome').value);updateEntryCount()};$('modal').onclick=e=>{if(e.target===$('modal'))closeSettings()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('winner-overlay').classList.contains('show'))closeWinnerDialog();else closeSettings()}if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='h'){e.preventDefault();$('modal').classList.contains('show')?closeSettings():openSettings()}if(e.code==='Space'&&!e.repeat&&!$('modal').classList.contains('show')&&!$('winner-overlay').classList.contains('show')&&!['INPUT','BUTTON','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();spin()}});WheelSound.setEnabled(soundOn);setTheme(theme);renderHistory();draw();
})();
