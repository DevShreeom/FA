/* Premium motion layer — visual only; no application/backend state is changed. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;

  // Cursor spotlight.
  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      root.style.setProperty('--pointer-x', `${e.clientX}px`);
      root.style.setProperty('--pointer-y', `${e.clientY}px`);
    }, {passive:true});
  }

  // Subtle gravitational field: low-energy particles, deliberately restrained.
  const canvas = document.createElement('canvas');
  canvas.id = 'motionPhysicsCanvas';
  body.prepend(canvas);
  const ctx = canvas.getContext('2d', {alpha:true});
  let W=0,H=0,dpr=1;
  const mouse={x:-9999,y:-9999,active:false};
  const particles=[];
  const count=reduce?0:Math.min(36,Math.max(18,Math.floor(innerWidth/42)));
  let accent=[150,120,255];
  function refreshAccent(){
    const el=document.createElement('span');el.style.color=getComputedStyle(root).getPropertyValue('--accent');el.style.position='fixed';el.style.opacity='0';body.appendChild(el);
    const m=getComputedStyle(el).color.match(/\d+(?:\.\d+)?/g);if(m)accent=m.slice(0,3).map(Number);el.remove();
  }
  function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  resize();refreshAccent();addEventListener('resize',resize,{passive:true});
  for(let i=0;i<count;i++)particles.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.12,vy:(Math.random()-.5)*.12,r:.5+Math.random()*1.15});
  addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true},{passive:true});
  addEventListener('pointerleave',()=>mouse.active=false,{passive:true});
  function frame(t){
    ctx.clearRect(0,0,W,H);const [r,g,b]=accent;
    for(const p of particles){
      if(mouse.active){const dx=mouse.x-p.x,dy=mouse.y-p.y,d=Math.max(180,Math.hypot(dx,dy));const f=.00008*Math.min(1200,d*d)/d;p.vx+=dx/d*f;p.vy+=dy/d*f}
      p.vx*=.997;p.vy*=.997;p.x+=p.vx;p.y+=p.vy;
      if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;if(p.y<-10)p.y=H+10;if(p.y>H+10)p.y=-10;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(${r},${g},${b},.16)`;ctx.fill();
    }
    for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
      const a=particles[i],q=particles[j],d=Math.hypot(a.x-q.x,a.y-q.y);if(d<105){ctx.strokeStyle=`rgba(${r},${g},${b},${.018*(1-d/105)})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
    }
    requestAnimationFrame(frame);
  }
  if(!reduce)requestAnimationFrame(frame);

  const magnetSelector='.nav-btn,.widget-btn,.yt-sync-btn,.theme-toggle,.status-btn,.controls button';
  const tiltSelector='.card,.hero-card,.stat-box,.chapter-card,.about-card,.chapter';
  function magnet(el){if(el.dataset.motionMagnet)return;el.dataset.motionMagnet='1';el.addEventListener('pointermove',e=>{if(reduce||innerWidth<760)return;const r=el.getBoundingClientRect();const x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.045}px,${y*.045}px)`;el.style.setProperty('--mx',`${e.clientX-r.left}px`);el.style.setProperty('--my',`${e.clientY-r.top}px`)});el.addEventListener('pointerleave',()=>el.style.transform='')}
  function tilt(el){if(el.dataset.motionTilt)return;el.dataset.motionTilt='1';el.addEventListener('pointermove',e=>{if(reduce||innerWidth<900)return;const r=el.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1400px) rotateX(${(-py*1.2).toFixed(2)}deg) rotateY(${(px*1.2).toFixed(2)}deg) translateY(-2px)`});el.addEventListener('pointerleave',()=>el.style.transform='')}
  const reveal=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-visible');reveal.unobserve(e.target)}}),{threshold:.05});
  function enhance(scope=document){scope.querySelectorAll(magnetSelector).forEach(magnet);scope.querySelectorAll(tiltSelector).forEach(tilt);scope.querySelectorAll('.card,.hero-card,.stat-box,.chapter-card,.about-card').forEach(el=>{if(!el.dataset.motionReveal){el.dataset.motionReveal='1';el.classList.add('motion-reveal');reveal.observe(el)}})}
  enhance();
  new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)}))).observe(body,{childList:true,subtree:true});
})();
