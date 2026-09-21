/* Factorial Academy motion layer — intentionally isolated from app/business logic. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const body = document.body;

  const canvas = document.createElement('canvas');
  canvas.id = 'motionPhysicsCanvas';
  body.prepend(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999, active: false };
  const particles = [];
  const COUNT = reduce ? 0 : Math.min(58, Math.max(28, Math.floor(innerWidth / 28)));

  let rgb = [208,188,255];
  function refreshAccentRGB(){
    const probe = document.createElement('span');
    probe.style.color = getComputedStyle(root).getPropertyValue('--accent');
    probe.style.position='absolute'; probe.style.opacity='0'; probe.style.pointerEvents='none';
    body.appendChild(probe);
    const c = getComputedStyle(probe).color.match(/\d+(?:\.\d+)?/g);
    probe.remove();
    if(c) rgb=c.slice(0,3).map(Number);
  }
  refreshAccentRGB();
  function resize() {
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W*dpr; canvas.height = H*dpr; canvas.style.width = W+'px'; canvas.style.height = H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); addEventListener('resize', resize, {passive:true});

  for (let i=0;i<COUNT;i++) {
    particles.push({
      x: Math.random()*innerWidth, y: Math.random()*innerHeight,
      vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
      r:Math.random()*2.1+.55, mass:Math.random()*.8+.35,
      phase:Math.random()*Math.PI*2
    });
  }

  addEventListener('pointermove', e => {
    mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true;
    root.style.setProperty('--orb-x', `${e.clientX}px`);
    root.style.setProperty('--orb-y', `${e.clientY}px`);
  }, {passive:true});
  addEventListener('pointerleave', () => { mouse.active=false; }, {passive:true});

  function physics() {
    if (!ctx || reduce) return;
    ctx.clearRect(0,0,W,H);
    const [r,g,b] = rgb;
    for (const p of particles) {
      // Very light gravity toward the pointer, with damping and soft boundaries.
      if (mouse.active) {
        const dx=mouse.x-p.x, dy=mouse.y-p.y;
        const dist2=dx*dx+dy*dy+1800;
        const force=0.00085*p.mass*W*W/dist2;
        p.vx += dx*force; p.vy += dy*force;
      }
      p.vx *= .995; p.vy *= .995;
      p.vy += Math.sin(p.phase + performance.now()/2500)*0.00035;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x=W+20; if (p.x>W+20) p.x=-20;
      if (p.y < -20) p.y=H+20; if (p.y>H+20) p.y=-20;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${0.10 + p.r/28})`; ctx.fill();
    }
    // Connect nearby particles into a subtle force-field.
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++) {
      const a=particles[i], b2=particles[j], dx=a.x-b2.x, dy=a.y-b2.y, dist=Math.hypot(dx,dy);
      if(dist<115){
        ctx.strokeStyle=`rgba(${r},${g},${b},${0.035*(1-dist/115)})`;
        ctx.lineWidth=.7; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b2.x,b2.y); ctx.stroke();
      }
    }
    requestAnimationFrame(physics);
  }
  if (!reduce) requestAnimationFrame(physics);

  new MutationObserver(() => refreshAccentRGB()).observe(root,{attributes:true,attributeFilter:['data-theme']});

  // Springy magnetic controls.
  const magnetSelector = '.nav-btn, .widget-btn, .yt-sync-btn, .theme-toggle, .status-btn, .controls button';
  function magnetize(el) {
    if (el.dataset.motionBound) return;
    el.dataset.motionBound='1';
    el.addEventListener('pointermove', e => {
      if (reduce) return;
      const r=el.getBoundingClientRect(), x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
      el.style.transform=`translate(${x*.08}px,${y*.08}px) scale(1.015)`;
      el.style.setProperty('--mx', `${((e.clientX-r.left)/r.width)*100}%`);
      el.style.setProperty('--my', `${((e.clientY-r.top)/r.height)*100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform=''; });
  }
  document.querySelectorAll(magnetSelector).forEach(magnetize);

  // Tilt only substantial surfaces; dynamic DOM is handled by observer.
  const tiltSelector='.card, .hero-card, .stat-box, .chapter-card, .about-card, .chapter';
  function tilt(el) {
    if (el.dataset.motionTilt) return;
    el.dataset.motionTilt='1';
    el.addEventListener('pointermove', e => {
      if (reduce || innerWidth < 700) return;
      const r=el.getBoundingClientRect(), px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1100px) rotateX(${(-py*2.1).toFixed(2)}deg) rotateY(${(px*2.1).toFixed(2)}deg) translateY(-2px)`;
      el.style.setProperty('--shine-x', `${e.clientX-r.left-110}px`);
      el.style.setProperty('--shine-y', `${e.clientY-r.top-110}px`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform=''; });
  }
  document.querySelectorAll(tiltSelector).forEach(tilt);

  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('motion-visible'); reveal.unobserve(e.target); } });
  }, {threshold:.06});

  function enhance(scope=document) {
    scope.querySelectorAll(magnetSelector).forEach(magnetize);
    scope.querySelectorAll(tiltSelector).forEach(tilt);
    scope.querySelectorAll('.card, .hero-card, .stat-box, .chapter-card, .about-card').forEach(el => {
      if (!el.dataset.motionReveal) { el.dataset.motionReveal='1'; el.classList.add('motion-reveal'); reveal.observe(el); }
    });
  }
  enhance();
  new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => { if(n.nodeType===1) enhance(n); }))).observe(body,{childList:true,subtree:true});

  // Soft page-depth response: feels like gravity without changing layout logic.
  addEventListener('scroll', () => {
    if (reduce) return;
    const y=scrollY;
    root.style.setProperty('--scroll-depth', y);
  }, {passive:true});
})();
