/* Factorial Academy — cinematic motion graphics layer. Presentation-only. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Decorative stage.
  const atmosphere = document.createElement('div');
  atmosphere.className = 'motion-atmosphere';
  atmosphere.innerHTML = '<div class="motion-orbit"><i class="motion-orbit-dot"></i></div><div class="motion-scanline"></div>';
  body.prepend(atmosphere);
  const wm = document.createElement('div'); wm.className='motion-wordmark'; wm.textContent='FA / MOTION SYSTEM'; body.appendChild(wm);

  // Remove only visible timer widgets. No timer logic is modified.
  const hideTimer = () => document.querySelectorAll('#pomoTimer,#pomoDisplay,.pomo-timer,.pomodoro,.pomo-widget,[id*="pomo" i][class*="timer" i]').forEach(el => el.style.display='none');
  hideTimer();

  // Cinematic particle / flow field canvas.
  const canvas = document.createElement('canvas');
  canvas.id='motionPhysicsCanvas'; body.prepend(canvas);
  const ctx=canvas.getContext('2d',{alpha:true});
  let W=0,H=0;
  const pointer={x:innerWidth*.5,y:innerHeight*.35,tx:innerWidth*.5,ty:innerHeight*.35,vx:0,vy:0};
  const particles=[];
  let accent=[208,188,255];
  function readAccent(){
    const s=document.createElement('span'); s.style.color=getComputedStyle(root).getPropertyValue('--accent'); s.style.position='fixed'; s.style.opacity='0'; body.appendChild(s);
    const m=getComputedStyle(s).color.match(/\d+(?:\.\d+)?/g); if(m) accent=m.slice(0,3).map(Number); s.remove();
  }
  function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize(); readAccent(); addEventListener('resize',resize,{passive:true});
  const count=reduce?0:Math.min(105,Math.max(58,Math.floor(W/15)));
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2, r=Math.pow(Math.random(),.72)*Math.min(W,H)*.72;
    particles.push({x:W*.72+Math.cos(a)*r,y:H*.18+Math.sin(a)*r*.58,vx:0,vy:0,seed:Math.random()*1000,size:.35+Math.random()*1.5,life:Math.random()});
  }
  addEventListener('pointermove',e=>{pointer.tx=e.clientX;pointer.ty=e.clientY;root.style.setProperty('--mx',e.clientX+'px');root.style.setProperty('--my',e.clientY+'px')},{passive:true});

  let last=performance.now();
  function draw(t){
    const dt=Math.min(32,t-last); last=t; ctx.clearRect(0,0,W,H);
    pointer.vx+=(pointer.tx-pointer.x)*.025; pointer.vy+=(pointer.ty-pointer.y)*.025; pointer.vx*=.82; pointer.vy*=.82; pointer.x+=pointer.vx; pointer.y+=pointer.vy;
    const [r,g,b]=accent;
    // sweeping flow ribbons
    ctx.globalCompositeOperation='lighter';
    for(let band=0;band<3;band++){
      ctx.beginPath();
      for(let x=-30;x<=W+30;x+=18){
        const n=Math.sin(x*.004+t*.00045+band)*35 + Math.sin(x*.009-t*.0003)*16;
        const y=H*(.20+band*.08)+n + (pointer.y-H*.35)*.025;
        if(x===-30)ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle=`rgba(${r},${g},${b},${.025-band*.005})`; ctx.lineWidth=32-band*8; ctx.filter='blur(12px)'; ctx.stroke(); ctx.filter='none';
    }
    // orbital dust with gravity + tangential force
    for(const p of particles){
      const dx=pointer.x-p.x, dy=pointer.y-p.y, d=Math.max(80,Math.hypot(dx,dy));
      const pull=.00022*Math.min(1600,d*d)/d;
      p.vx += dx/d*pull*dt; p.vy += dy/d*pull*dt;
      const swirl=.00032*dt; p.vx += -dy/d*swirl; p.vy += dx/d*swirl;
      p.vx*=.992; p.vy*=.992; p.x+=p.vx*dt; p.y+=p.vy*dt;
      if(p.x<-40||p.x>W+40||p.y<-40||p.y>H+40){p.x=W*.72+(Math.random()-.5)*W*.5;p.y=H*.22+(Math.random()-.5)*H*.35;p.vx=0;p.vy=0}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fillStyle=`rgba(${r},${g},${b},${.15+p.life*.18})`; ctx.fill();
    }
    // local constellations
    for(let i=0;i<particles.length;i+=2){const a=particles[i];for(let j=i+2;j<Math.min(i+8,particles.length);j+=2){const q=particles[j],d=Math.hypot(a.x-q.x,a.y-q.y);if(d<105){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(${r},${g},${b},${.045*(1-d/105)})`;ctx.lineWidth=.55;ctx.stroke()}}}
    ctx.globalCompositeOperation='source-over';
    if(!reduce)requestAnimationFrame(draw);
  }
  if(!reduce)requestAnimationFrame(draw);

  // Magnetic micro-interactions.
  const magnetSelector='.nav-btn,.widget-btn,.yt-sync-btn,.theme-toggle,.status-btn,.controls button';
  const tiltSelector='.card,.hero-card,.stat-box,.chapter-card,.about-card,.chapter';
  function bindMagnet(el){if(el.dataset.cm)return;el.dataset.cm=1;el.addEventListener('pointermove',e=>{if(reduce||innerWidth<760)return;const r=el.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.055}px,${y*.055}px)`;el.style.setProperty('--mx',`${e.clientX-r.left}px`);el.style.setProperty('--my',`${e.clientY-r.top}px`)});el.addEventListener('pointerleave',()=>{el.style.transform=''});}
  function bindTilt(el){if(el.dataset.ct)return;el.dataset.ct=1;el.classList.add('motion-tilt');el.addEventListener('pointermove',e=>{if(reduce||innerWidth<950)return;const r=el.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--card-x',`${(px+.5)*100}%`);el.style.setProperty('--card-y',`${(py+.5)*100}%`);el.style.transform=`perspective(1500px) rotateX(${(-py*1.8).toFixed(2)}deg) rotateY(${(px*1.8).toFixed(2)}deg) translateY(-3px)`});el.addEventListener('pointerleave',()=>el.style.transform='');}
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-visible');reveal.unobserve(e.target)}}),{threshold:.04});
  function enhance(scope=document){
    hideTimer();
    scope.querySelectorAll(magnetSelector).forEach(bindMagnet);
    scope.querySelectorAll(tiltSelector).forEach(bindTilt);
    scope.querySelectorAll('.card,.hero-card,.stat-box,.chapter-card,.about-card').forEach(el=>{if(!el.dataset.cr){el.dataset.cr=1;el.classList.add('motion-reveal');reveal.observe(el)}});
  }
  enhance();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)}))).observe(body,{childList:true,subtree:true});

  // Theme changes: keep particles in sync.
  new MutationObserver(()=>readAccent()).observe(root,{attributes:true,attributeFilter:['data-theme']});
})();
