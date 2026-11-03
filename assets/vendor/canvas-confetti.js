/* Local, offline Canvas Confetti API-compatible fallback.
   When npm dependencies are installed, build scripts replace this with
   the official canvas-confetti browser distribution used by Preline. */
(function(global){'use strict';
if(typeof global.confetti==='function')return;
let canvas=document.getElementById('confetti-layer');
if(!canvas){canvas=document.createElement('canvas');canvas.id='confetti-layer';document.body.append(canvas)}
const context=canvas.getContext('2d');
let W=0,H=0,DPR=1,items=[],animation=0,previous=0;
const palette=['#a078ff','#e6d6ff','#ffffff','#4fe0a6','#ffbd59','#ff6d9b','#7ec8ff'];
function resize(){W=window.innerWidth;H=window.innerHeight;DPR=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);context.setTransform(DPR,0,0,DPR,0,0)}
function runFrame(now){if(!W||!H)resize();const dt=Math.min((now-(previous||now))/16.667,2);previous=now;context.clearRect(0,0,W,H);
 items=items.filter(p=>p.life>0&&p.y<H+50);
 for(const p of items){p.life-=dt;p.x+=(p.vx+Math.sin(p.phase)*.65)*dt;p.y+=p.vy*dt;p.vy+=.16*dt;p.vx*=.992;p.phase+=.06*dt;p.angle+=p.spin*dt;
 context.save();context.translate(p.x,p.y);context.rotate(p.angle);context.globalAlpha=Math.min(1,p.life/25);context.fillStyle=p.color;
 if(p.shape==='circle'){context.beginPath();context.arc(0,0,p.w/2,0,Math.PI*2);context.fill()}
 else{context.fillRect(-p.w/2,-p.h/2,p.w,p.h)}context.restore()}
 if(items.length){animation=requestAnimationFrame(runFrame)}else{animation=0;previous=0;context.clearRect(0,0,W,H)}}
function confetti(o={}){resize();const count=Math.min(500,Math.max(0,Math.floor(o.particleCount??50))),spread=(o.spread??70)*Math.PI/180,angle=(o.angle??90)*Math.PI/180;
 const sourceX=(o.origin?.x??.5)*W,sourceY=(o.origin?.y??.5)*H,velocity=o.startVelocity??35,gravity=o.gravity??1;
 const colors=o.colors?.length?o.colors:palette;
 for(let i=0;i<count;i++){
 const heading=angle+(Math.random()-.5)*spread;const speed=(.55+Math.random()*.8)*velocity*.24;
 items.push({x:sourceX,y:sourceY,vx:Math.cos(heading)*speed,vy:-Math.sin(heading)*speed,
 life:(o.ticks??220)*(.8+Math.random()*.35),w:4+Math.random()*5,h:6+Math.random()*9,
 color:colors[Math.floor(Math.random()*colors.length)],angle:Math.random()*Math.PI*2,spin:(Math.random()-.5)*.18,phase:Math.random()*Math.PI*2,shape:Math.random()<.13?'circle':'rect',gravity});
 }
 if(!animation)animation=requestAnimationFrame(runFrame);
 return Promise.resolve()}
confetti.reset=function(){items=[];if(animation)cancelAnimationFrame(animation);animation=0;previous=0;if(context)context.clearRect(0,0,canvas.width,canvas.height)};
confetti.create=function(){return confetti};
confetti.__localFallback=true;
global.confetti=confetti;
window.addEventListener('resize',resize);
})(window);
