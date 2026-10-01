// neon.js — Factorial Academy front hero, particles, tilt, reveal.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PORTAL = 'https://www.factorialacademy.com/latest'; // Alternate Portal = distraction-free video portal
  const split = (t, d0) => [...t].map((c, i) => `<span class="ch" style="animation-delay:${(d0 + i * .04).toFixed(2)}s">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

  // 1) Front hero
  const dash = document.getElementById('sectionDashboard');
  if (dash && !dash.querySelector('.fa-hero')) {
    const hero = document.createElement('div');
    hero.innerHTML = `
    <div class="fa-hero"><div class="fa-bang">!</div>
      <div class="fa-eyebrow"><i></i>FACTORIAL ACADEMY · JEE</div>
      <h2 class="fa-title"><span class="ln">${split('Not won yet,', 0)}</span><span class="ln l2">${split('not done yet!', .5)}</span></h2>
      <p class="fa-sub">Every chapter multiplies the last — that's a factorial. Learn in a distraction-free portal where every playlist is always in sync with YouTube.</p>
      <div class="fa-row">
        <a class="fa-btn" href="${PORTAL}" target="_blank" rel="noopener">Open Alternate Portal <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
        <span class="fa-tag">Distraction-free learning · Auto-synced playlists</span>
      </div>
      <div class="fa-stats">
        <div class="fa-stat"><b data-n="715" data-s="+">0</b><span>Videos</span></div>
        <div class="fa-stat"><b data-n="245" data-s="h+">0</b><span>Hours of lectures</span></div>
        <div class="fa-stat"><b data-n="120" data-s="">0</b><span>5! — it only grows</span></div>
      </div></div>
    <div class="fa-ticker"><div>${'<span>Theory</span><em>×</em><span>PYQs</span><em>×</em><span>One-shots</span><em>×</em><span>QOTD</span><em>×</em><span>Leaderboard</span><em>!</em>'.repeat(8)}</div></div>`;
    while (hero.firstChild) dash.prepend(hero.lastChild);
    dash.querySelectorAll('.fa-stat b').forEach(b => {
      const n = +b.dataset.n, s = b.dataset.s; if (reduce) { b.textContent = n + s; return; }
      const t0 = performance.now() + 700;
      (function f(t) { const p = Math.min(Math.max((t - t0) / 1600, 0), 1); b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + (p === 1 ? s : ''); if (p < 1) requestAnimationFrame(f); })(performance.now());
    });
  }

  // 2) Particles (green)
  if (!reduce) {
    const c = document.createElement('canvas'); c.id = 'fxCanvas'; document.body.prepend(c);
    const x = c.getContext('2d'); let w, h, P = [];
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; P = Array.from({ length: Math.min(60, w / 24 | 0) }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: -Math.random() * .5 - .1 })); };
    size(); addEventListener('resize', size);
    (function loop() {
      x.clearRect(0, 0, w, h);
      for (const p of P) { p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h; x.fillStyle = 'rgba(0,255,106,.85)'; x.shadowBlur = 10; x.shadowColor = '#00ff6a'; x.beginPath(); x.arc(p.x, p.y, 1.5, 0, 7); x.fill(); }
      x.shadowBlur = 0;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y); if (d < 110) { x.strokeStyle = `rgba(0,255,106,${.16 * (1 - d / 110)})`; x.beginPath(); x.moveTo(P[i].x, P[i].y); x.lineTo(P[j].x, P[j].y); x.stroke(); } }
      requestAnimationFrame(loop);
    })();
  }

  // 3) Reveal + tilt (also for dynamically rendered cards)
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .06 });
  const sel = '.card,.yt-video-card,.focus-strip,.fa-ticker';
  const wire = r => r.querySelectorAll?.(sel).forEach(el => {
    if (el.dataset.fx) return; el.dataset.fx = 1; el.classList.add('rv'); io.observe(el);
    if (reduce) return;
    el.addEventListener('pointermove', e => { const b = el.getBoundingClientRect(); el.style.transform = `perspective(900px) rotateX(${-((e.clientY - b.top) / b.height - .5) * 5}deg) rotateY(${((e.clientX - b.left) / b.width - .5) * 6}deg) translateY(-3px)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  wire(document);
  new MutationObserver(m => m.forEach(r => r.addedNodes.forEach(n => n.nodeType === 1 && (wire(n), n.matches?.(sel) && wire({ querySelectorAll: () => [n] }))))).observe(document.body, { childList: true, subtree: true });
})();
