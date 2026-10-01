// neon.js — particles, 3D tilt, scroll reveal, and the front-page portal CTA.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) Front-page CTA → distraction-free portal (dashboard only)
  const dash = document.getElementById('sectionDashboard');
  if (dash && !dash.querySelector('.portal-cta')) {
    const a = document.createElement('a');
    a.className = 'portal-cta';
    a.href = 'portal/';
    a.innerHTML = '<div><span class="live"><i></i>LATEST · AUTO-SYNCED WITH YOUTUBE</span><b>Enter the Distraction-Free Video Portal</b><small>Every playlist, always up to date. No comments, no recommendations, just the lecture.</small></div><span class="go">Open Portal →</span>';
    dash.prepend(a);
  }

  // 2) Particle network
  if (!reduce) {
    const c = document.createElement('canvas'); c.id = 'fxCanvas'; document.body.prepend(c);
    const x = c.getContext('2d'); let w, h, P = [];
    const cols = ['0,240,255', '176,38,255', '255,46,151'];
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; P = Array.from({ length: Math.min(70, w / 20 | 0) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, c: cols[Math.random() * 3 | 0] })); };
    size(); addEventListener('resize', size);
    (function loop() {
      x.clearRect(0, 0, w, h);
      for (const p of P) {
        p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h;
        x.fillStyle = `rgba(${p.c},.9)`; x.shadowBlur = 12; x.shadowColor = `rgb(${p.c})`;
        x.beginPath(); x.arc(p.x, p.y, 1.6, 0, 7); x.fill();
      }
      x.shadowBlur = 0;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
        if (d < 120) { x.strokeStyle = `rgba(0,240,255,${.14 * (1 - d / 120)})`; x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke(); }
      }
      requestAnimationFrame(loop);
    })();
  }

  // 3) Scroll reveal + 3D tilt (also catches dynamically-rendered cards)
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
  const sel = '.card,.yt-video-card,.focus-strip,.portal-cta';
  const wire = r => r.querySelectorAll?.(sel).forEach(el => {
    if (el.dataset.fx) return; el.dataset.fx = 1;
    el.classList.add('rv'); el.style.transitionDelay = (Math.random() * .25).toFixed(2) + 's'; io.observe(el);
    if (reduce) return;
    el.addEventListener('pointermove', e => {
      const b = el.getBoundingClientRect(), px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5;
      el.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  wire(document);
  new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => n.nodeType === 1 && (n.matches?.(sel) && wire({ querySelectorAll: () => [n] }), wire(n))))).observe(document.body, { childList: true, subtree: true });
})();
