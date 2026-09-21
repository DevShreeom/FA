/* FACTORIAL / CINEMATIC MOTION ENGINE
   Presentation-only. Does not touch application state, APIs, auth or data. */
(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.documentElement, body=document.body;
root.style.setProperty('--cine-mx',innerWidth*.52+'px');root.style.setProperty('--cine-my',innerHeight*.4+'px');

/* Decorative film layer */
const film=document.createElement('div');film.className='cine-vignette';body.appendChild(film);
const grain=document.createElement('div');grain.className='cine-grain';body.appendChild(grain);

/* Opening title sequence. It is purely presentational and only runs once per tab. */
const introKey='fa_cinematic_intro_v2';
let introShown=false;
try{introShown=sessionStorage.getItem(introKey)==='1'}catch(e){}
if(!reduce&&!introShown){
 const intro=document.createElement('div');intro.className='cine-intro';intro.innerHTML=`
  <div class="intro-lines"></div><div class="intro-orbit"></div>
  <div class="intro-content"><div class="intro-kicker">FACTORIAL ACADEMY / SYSTEM ONLINE</div><h1 class="intro-title">FACTORIAL</h1><div class="intro-sub">NOT WON YET · NOT DONE YET</div></div>
  <div class="intro-progress"></div>`;
 body.appendChild(intro);
 setTimeout(()=>{intro.classList.add('is-gone');try{sessionStorage.setItem(introKey,'1')}catch(e){}setTimeout(()=>intro.remove(),1100)},2200);
}

/* Stage */
const stage=document.createElement('div');stage.className='motion-atmosphere';stage.innerHTML='<div class="motion-orbit"><i class="motion-orbit-dot"></i></div><div class="motion-scanline"></div>';body.prepend(stage);

/* Physics canvas: orbital particles, attraction, velocity trails and a controlled light field. */
const canvas=document.createElement('canvas');canvas.id='motionPhysicsCanvas';body.prepend(canvas);
const ctx=canvas.getContext('2d',{alpha:true});let W=0,H=0,dpr=Math.min(devicePixelRatio||1,2);
const pointer={x:innerWidth*.52,y:innerHeight*.4,tx:innerWidth*.52,ty:innerHeight*.4,vx:0,vy:0};
const stars=[];const trails=[];
function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
resize();addEventListener('resize',resize,{passive:true});
function seed(){stars.length=0;const n=Math.min(150,Math.max(70,Math.floor(W/10)));for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=Math.pow(Math.random(),.65)*Math.min(W,H)*.78;stars.push({x:W*.72+Math.cos(a)*r,y:H*.22+Math.sin(a)*r*.55,px:0,py:0,vx:(Math.random()-.5)*.02,vy:(Math.random()-.5)*.02,s:.35+Math.random()*1.5,o:.18+Math.random()*.55,phase:Math.random()*10})}}seed();
addEventListener('pointermove',e=>{pointer.tx=e.clientX;pointer.ty=e.clientY;root.style.setProperty('--cine-mx',e.clientX+'px');root.style.setProperty('--cine-my',e.clientY+'px')},{passive:true});

let last=performance.now();
function frame(now){
 const dt=Math.min(32,now-last);last=now;ctx.clearRect(0,0,W,H);
 pointer.vx+=(pointer.tx-pointer.x)*.022;pointer.vy+=(pointer.ty-pointer.y)*.022;pointer.vx*=.84;pointer.vy*=.84;pointer.x+=pointer.vx;pointer.y+=pointer.vy;
 let ac=getComputedStyle(root).getPropertyValue('--accent').trim()||'#bca6ff';
 /* Deep light halo */
 const halo=ctx.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,Math.min(W,H)*.45);halo.addColorStop(0,'rgba(255,255,255,.045)');halo.addColorStop(.18,'rgba(190,165,255,.022)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
 /* Long cinematic orbital arcs */
 ctx.save();ctx.translate(W*.72,H*.22);ctx.rotate(-.22);ctx.globalAlpha=.22;
 for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(0,0,Math.min(W,H)*(.24+i*.085),Math.min(W,H)*(.075+i*.028),0,0,Math.PI*2);ctx.strokeStyle=i===2?ac:'rgba(255,255,255,.11)';ctx.lineWidth=i===2?1.2:.5;ctx.stroke()}ctx.restore();
 /* Gravity field */
 for(const p of stars){p.px=p.x;p.py=p.y;const dx=pointer.x-p.x,dy=pointer.y-p.y,d=Math.max(75,Math.hypot(dx,dy));const force=Math.min(.00034,14/(d*d))*dt;p.vx+=dx/d*force;p.vy+=dy/d*force;/* angular momentum */p.vx+=(-dy/d)*.00011*dt;p.vy+=(dx/d)*.00011*dt;p.vx*=.993;p.vy*=.993;p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.x<-80||p.x>W+80||p.y<-80||p.y>H+80){const a=Math.random()*Math.PI*2,r=Math.min(W,H)*(.5+.25*Math.random());p.x=W*.72+Math.cos(a)*r;p.y=H*.22+Math.sin(a)*r*.55;p.vx=0;p.vy=0}
  const alpha=p.o*(.45+.55*Math.sin(now*.001+p.phase)**2);ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,Math.PI*2);ctx.fillStyle=p.s>1.2?'rgba(255,255,255,'+alpha+')':'rgba(205,188,255,'+alpha*.65+')';ctx.fill();
  if(Math.hypot(p.x-p.px,p.y-p.py)>1.5){ctx.beginPath();ctx.moveTo(p.px,p.py);ctx.lineTo(p.x,p.y);ctx.strokeStyle='rgba(210,195,255,.11)';ctx.lineWidth=.5;ctx.stroke()}
 }
 /* Connect only close particles, like a restrained constellation */
 for(let i=0;i<stars.length;i+=2){for(let j=i+1;j<Math.min(stars.length,i+9);j++){const a=stars[i],b=stars[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<125){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(210,195,255,'+(.045*(1-d/125))+')';ctx.lineWidth=.45;ctx.stroke()}}}
 /* Pointer trail */
 trails.push({x:pointer.x,y:pointer.y,a:1});if(trails.length>20)trails.shift();for(let i=1;i<trails.length;i++){const a=trails[i-1],b=trails[i];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(235,225,255,'+(i/trails.length*.08)+')';ctx.lineWidth=i/trails.length*2;ctx.stroke();a.a*=.9}
 if(!reduce)requestAnimationFrame(frame)
}
if(!reduce)requestAnimationFrame(frame);

/* Physical magnetic controls */
const magnet='.nav-btn,.widget-btn,.yt-sync-btn,.theme-toggle,.status-btn,.controls button';
const tilt='.card,.hero-card,.stat-box,.chapter-card,.about-card,.chapter,.elevated-qotd,.elevated-update';
function magnetize(el){if(el.dataset.cineMag)return;el.dataset.cineMag='1';el.addEventListener('pointermove',e=>{if(reduce||innerWidth<760)return;const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate3d(${x*.045}px,${y*.045}px,0)`});el.addEventListener('pointerleave',()=>el.style.transform='')}
function tiltify(el){if(el.dataset.cineTilt)return;el.dataset.cineTilt='1';el.addEventListener('pointermove',e=>{if(reduce||innerWidth<900)return;const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.setProperty('--card-x',(x/r.width*100+50)+'%');el.style.setProperty('--card-y',(y/r.height*100+50)+'%');el.style.transform=`perspective(1400px) rotateX(${(-y/r.height*2.2).toFixed(2)}deg) rotateY(${(x/r.width*2.2).toFixed(2)}deg) translateY(-4px)`});el.addEventListener('pointerleave',()=>el.style.transform='')}
function hideTimer(){document.querySelectorAll('#pomoTimer,#pomoDisplay,.pomo-timer,.pomodoro,.pomo-widget,[id*="pomo" i][class*="timer" i]').forEach(x=>x.style.display='none')}
function enhance(scope=document){hideTimer();scope.querySelectorAll(magnet).forEach(magnetize);scope.querySelectorAll(tilt).forEach(tiltify)}
enhance();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>n.nodeType===1&&enhance(n)))).observe(body,{childList:true,subtree:true});

/* Section changes get a short film-cut instead of an instant swap. */
const shell=document.getElementById('appShell');
if(shell){new MutationObserver(()=>{shell.classList.remove('cine-cut');void shell.offsetWidth;shell.classList.add('cine-cut')}).observe(shell,{subtree:true,childList:true})}
})();
