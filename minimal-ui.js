/* Minimal interaction layer — presentation only. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Remove any presentation layers from earlier UI builds.
  document.querySelectorAll('#motionPhysicsCanvas,.motion-atmosphere,.cine-vignette,.cine-grain,.cine-intro').forEach(el => el.remove());

  const apply = (root = document) => {
    root.querySelectorAll('.nav-btn,.widget-btn,.yt-sync-btn,.theme-toggle,.controls button,.status-btn').forEach(btn => {
      if (btn.dataset.minimalBound) return;
      btn.dataset.minimalBound = '1';
      btn.addEventListener('pointerdown', () => {
        if (!reduce) btn.style.transform = 'translateY(1px)';
      }, {passive:true});
      btn.addEventListener('pointerup', () => btn.style.transform = '');
      btn.addEventListener('pointerleave', () => btn.style.transform = '');
    });
  };

  apply();
  new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 1) apply(n);
    }));
  }).observe(document.body, {childList:true, subtree:true});
})();
