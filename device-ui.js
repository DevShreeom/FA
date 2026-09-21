/* Device-aware presentation layer. It changes layout only; app logic/backend stays untouched. */
(() => {
  'use strict';
  const KEY = 'fa-device-preference-v1';
  const root = document.documentElement;
  const gate = document.getElementById('deviceGate');
  const drawer = document.getElementById('mobileNavDrawer');
  const optionHost = document.getElementById('mobileNavOptions');

  const applyDevice = (device) => {
    root.classList.remove('device-phone', 'device-desktop', 'device-tablet', 'device-auto');
    root.classList.add(`device-${device}`);
    try { localStorage.setItem(KEY, device); } catch (_) {}
    if (gate) {
      gate.classList.add('is-hidden');
      window.setTimeout(() => { gate.style.display = 'none'; }, 220);
    }
    window.dispatchEvent(new CustomEvent('fa:devicechange', { detail: { device } }));
  };

  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (_) {}
  if (saved && ['phone','desktop','tablet','auto'].includes(saved)) {
    applyDevice(saved);
  } else if (gate) {
    gate.style.display = 'flex';
  }

  gate?.querySelectorAll('[data-device]').forEach(btn => {
    btn.addEventListener('click', () => applyDevice(btn.dataset.device));
  });

  const getOriginalButtons = () => Array.from(document.querySelectorAll('.sidebar .nav-btn'));

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mobile-nav-open');
  };
  const openDrawer = () => {
    if (!drawer || !optionHost) return;
    buildOptions();
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mobile-nav-open');
  };

  function buildOptions() {
    if (!optionHost) return;
    optionHost.innerHTML = '';
    getOriginalButtons().forEach((original) => {
      const clone = original.cloneNode(true);
      clone.removeAttribute('id');
      clone.classList.remove('active');
      clone.classList.add('mobile-option');
      clone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        original.click();
        closeDrawer();
        window.setTimeout(syncMobileState, 30);
      });
      optionHost.appendChild(clone);
    });
    syncMobileState();
  }

  function syncMobileState() {
    const active = document.querySelector('.sidebar .nav-btn.active')?.dataset.section;
    optionHost?.querySelectorAll('.mobile-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.section === active);
    });
    document.querySelectorAll('.mobile-dock-btn[data-section]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === active);
    });
  }

  function buildMobileDock() {
    if (document.getElementById('mobileDock')) return;
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const original = getOriginalButtons();
    const dock = document.createElement('nav');
    dock.id = 'mobileDock';
    dock.className = 'mobile-dock';
    dock.setAttribute('aria-label', 'Primary navigation');

    // Keep the most-used destinations visible; every other option lives under More.
    const visible = original.filter(btn => ['dashboard','library','allvideos','notes'].includes(btn.dataset.section));
    visible.forEach((btn) => {
      const clone = btn.cloneNode(true);
      clone.removeAttribute('id');
      clone.className = 'mobile-dock-btn';
      clone.addEventListener('click', (e) => {
        e.preventDefault();
        btn.click();
        window.setTimeout(syncMobileState, 30);
      });
      dock.appendChild(clone);
    });

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'mobile-dock-btn mobile-more-btn';
    more.innerHTML = '<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></span><span>More</span>';
    more.addEventListener('click', openDrawer);
    dock.appendChild(more);
    document.body.appendChild(dock);
    syncMobileState();
  }

  buildMobileDock();
  document.getElementById('mobileNavClose')?.addEventListener('click', closeDrawer);
  drawer?.querySelector('.mobile-nav-backdrop')?.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // Rebuild/sync after the application has finished wiring its own navigation.
  window.setTimeout(() => { buildMobileDock(); syncMobileState(); }, 700);
  new MutationObserver(() => syncMobileState()).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
})();
