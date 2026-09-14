// Interactive copy of the in-game radial menu. Module names, descriptions, order and defaults
// mirror the client's ModuleRegistry; geometry mirrors WheelGeometry (design units).
(function () {
  'use strict';
  const root = document.getElementById('demo');
  if (!root) return;

  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 9x9 category icons, same bitmaps as CategoryIcons.java.
  const ICONS = [
    ['.........', '#########', '#.......#', '#.......#', '#.......#', '#########', '....#....', '..#####..', '.........'],
    ['.....##..', '....##...', '...##....', '..######.', '.....##..', '....##...', '...##....', '..##.....', '.........'],
    ['.........', '...###...', '.##...##.', '#...#...#', '#..###..#', '#...#...#', '.##...##.', '...###...', '.........'],
    ['.........', '.##...##.', '.##...##.', '.........', '.........', '.##...##.', '.##...##.', '.........', '.........'],
    ['....#....', '....#....', '...###...', '#########', '...###...', '....#....', '....#....', '.........', '.........'],
    ['.........', '#########', '#.......#', '#########', '#.......#', '#..###..#', '#.......#', '#########', '.........'],
  ];

  const CATS = [
    { name: 'CLIENT', rows: ['client_hud', 'crosshair', 'fps_counter', 'ping_display', 'coordinates', 'armor_hud', 'interface'] },
    { name: 'FPS BOOST', rows: ['performance_profile', 'mod_sodium', 'mod_lithium', 'mod_ferritecore', 'mod_entityculling', 'mod_immediatelyfast', 'animation_optimization', 'inactive_fps', 'particle_limiter', 'performance_advisor'] },
    { name: 'RENDER', rows: ['fullbright', 'freelook', 'zoom', 'fov_settings', 'render_distance', 'entity_distance', 'weather_effects', 'potion_hud'] },
    { name: 'MISC', rows: ['screenshot_utility', 'clock', 'server_info', 'notifications', 'chat_settings', 'session_timer'] },
    { name: 'QOL', rows: ['keystrokes', 'toggle_sprint', 'freelook', 'waypoints', 'zoom', 'cps_counter', 'coordinates'] },
    { name: 'STORAGE', rows: ['screenshots', 'config_profiles', 'mod_profiles', 'resource_packs', 'shader_packs', 'container_preview', 'container_search', 'item_counter'] },
  ];

  // [name, description, kind, enabled, has settings, status]  kind: t = toggle, a = opens a screen, p = preset
  const NEXT_LAUNCH = ' Changes apply on next launch.';
  const MODULES = {
    client_hud: ['Client HUD', 'Show or hide all Snowball Client HUD elements', 't', true, false],
    crosshair: ['Custom Crosshair', 'Change the crosshair shape and colour', 't', false, true],
    fps_counter: ['FPS Counter', 'Shows frames per second', 't', true, true],
    ping_display: ['Ping Counter', 'Shows your latency to the server', 't', false, true],
    coordinates: ['Coordinates', 'Shows your position', 't', false, true],
    armor_hud: ['Armor HUD', 'Shows worn armour and durability', 't', false, true],
    interface: ['Menu & Accessibility', 'Scale, contrast, opacity and animation of the menu', 'a'],
    performance_profile: ['Performance Profile', 'Balanced, FPS Boost, Maximum FPS or Visual Quality presets', 'p'],
    mod_sodium: ['Sodium', 'Modern rendering engine for much higher FPS.' + NEXT_LAUNCH, 't', false, false, 'NOT INSTALLED'],
    mod_lithium: ['Lithium', 'Faster game logic and ticking.' + NEXT_LAUNCH, 't', false, false, 'NOT INSTALLED'],
    mod_ferritecore: ['FerriteCore', 'Lower memory usage.' + NEXT_LAUNCH, 't', false, false, 'NOT INSTALLED'],
    mod_entityculling: ['Entity Culling', 'Skips rendering hidden entities.' + NEXT_LAUNCH, 't', false, false, 'NOT INSTALLED'],
    mod_immediatelyfast: ['ImmediatelyFast', 'Faster HUD and text rendering.' + NEXT_LAUNCH, 't', false, false, 'NOT INSTALLED'],
    animation_optimization: ['Animation Optimization', 'Update animated textures less often', 't', false, true],
    inactive_fps: ['Background FPS Limit', 'Lower FPS when the game is not focused', 't', true, true],
    particle_limiter: ['Particle Limiter', 'Reduce particle count for smoother frame times', 't', false, true],
    performance_advisor: ['Performance Advisor', 'Checks optimisation mods for conflicts', 't', true, true],
    fullbright: ['Fullbright', 'Makes dark areas easier to see', 't', false, true],
    freelook: ['Freelook', 'Hold to look around without turning', 't', false, true],
    zoom: ['Zoom', 'Hold the key to zoom the camera', 't', true, true],
    fov_settings: ['FOV Settings', 'Custom field of view and dynamic FOV', 't', false, true],
    render_distance: ['Render Distance', 'Quickly change how far terrain is drawn', 't', false, true],
    entity_distance: ['Entity Distance', 'Stop drawing far-away entities', 't', false, true],
    weather_effects: ['Weather Effects', 'Hide rain and snow particles', 't', false, false],
    potion_hud: ['Potion HUD', 'Shows active effects and their timers', 't', false, true],
    screenshot_utility: ['Screenshot Utility', 'Quick actions after taking a screenshot', 't', true, true],
    clock: ['Time Display', 'Shows the real-world time', 't', false, true],
    server_info: ['Server Information', 'Server address and player count', 't', false, true],
    notifications: ['Notifications', 'Pop-up cards for client events', 't', true, true],
    chat_settings: ['Chat Settings', 'Timestamps and chat display options', 't', false, true],
    session_timer: ['Session Timer', 'Time spent in the current world', 't', false, true],
    keystrokes: ['Keystrokes', 'Shows movement keys and mouse buttons', 't', true, true],
    toggle_sprint: ['Toggle Sprint', 'Sprint without holding the key', 't', false, true],
    waypoints: ['Waypoints', 'Mark locations and see them on screen', 't', true, true],
    cps_counter: ['CPS Counter', 'Shows clicks per second', 't', false, true],
    screenshots: ['Screenshots', 'Browse, open and delete your screenshots', 'a'],
    config_profiles: ['Config Profiles', 'Save and load module setups', 'a'],
    mod_profiles: ['Mod Profiles', 'Enable, disable and group installed mods', 'a'],
    resource_packs: ['Resource Packs', 'Open the resource pack selector', 'a'],
    shader_packs: ['Shader Packs', 'Open Iris shader settings, or the shaderpacks folder', 'a', false, false, 'NO IRIS'],
    container_preview: ['Container Preview', 'Item grid in shulker box tooltips', 't', true, true],
    container_search: ['Container Search', 'Find items in chests and inventories', 't', true, true],
    item_counter: ['Item Counter', 'Total count of the held item in your inventory', 't', false, true],
  };
  const PROFILES = ['CUSTOM', 'BALANCED', 'FPS BOOST', 'MAXIMUM FPS', 'VISUAL QUALITY'];

  const on = {};
  for (const id in MODULES) on[id] = !!MODULES[id][3];
  let profile = 0;
  let current = 0;
  let angle = -30;
  let shown = -30;
  let animating = false;

  // ---------- helpers ----------
  const make = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const span = (cls, text) => {
    const s = document.createElement('span');
    s.className = cls;
    if (text) s.textContent = text;
    return s;
  };
  const f = (n) => n.toFixed(2);
  const rad = (d) => (d * Math.PI) / 180;
  const pt = (r, a) => f(r * Math.sin(a)) + ',' + f(-r * Math.cos(a));
  const sector = (r0, r1, a0, a1, gap) => {
    const d0 = Math.asin(gap / 2 / r0);
    const d1 = Math.asin(gap / 2 / r1);
    return `M${pt(r1, a0 + d1)}A${r1},${r1} 0 0 1 ${pt(r1, a1 - d1)}L${pt(r0, a1 - d0)}A${r0},${r0} 0 0 0 ${pt(r0, a0 + d0)}Z`;
  };
  const arc = (r, a0, a1) => `M${pt(r, a0)}A${r},${r} 0 0 1 ${pt(r, a1)}`;
  const pixels = (rows, parent) => {
    rows.forEach((line, y) => {
      let start = -1;
      for (let x = 0; x <= line.length; x++) {
        const lit = x < line.length && line[x] === '#';
        if (lit && start < 0) start = x;
        if (!lit && start >= 0) {
          make('rect', { x: start, y, width: x - start, height: 1 }, parent);
          start = -1;
        }
      }
    });
  };

  // ---------- wheel ----------
  const svg = root.querySelector('.wheel');
  const defs = make('defs', {}, svg);
  const selGrad = make('radialGradient', { id: 'wSel', cx: 0, cy: 0, r: 89, gradientUnits: 'userSpaceOnUse' }, defs);
  make('stop', { offset: '0.49', 'stop-color': '#3d7aa8' }, selGrad);
  make('stop', { offset: '1', 'stop-color': '#a3d8fb' }, selGrad);
  const hubGrad = make('radialGradient', { id: 'wHub', cx: 0, cy: -10, r: 46, gradientUnits: 'userSpaceOnUse' }, defs);
  make('stop', { offset: '0', 'stop-color': '#263b4d' }, hubGrad);
  make('stop', { offset: '1', 'stop-color': '#0a1016' }, hubGrad);
  const glow = make('filter', { id: 'wGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  make('feGaussianBlur', { stdDeviation: 3.2 }, glow);

  for (const r of [106, 112, 118]) make('circle', { r, class: 'w-ring' }, svg);
  make('circle', { r: 100, class: 'w-rim' }, svg);
  make('circle', { r: 93, class: 'w-base' }, svg);

  const segs = CATS.map((c, i) => {
    const mid = i * 60 - 30;
    const p = make('path', {
      d: sector(44, 89, rad(mid - 30), rad(mid + 30), 2.5),
      class: 'w-seg',
      tabindex: 0,
      role: 'button',
      'aria-label': c.name + ' category',
    }, svg);
    p.addEventListener('click', () => select(i));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(i);
      }
    });
    return p;
  });
  for (let k = 0; k < 6; k++) {
    const a = rad(k * 60);
    make('circle', { cx: f(96.5 * Math.sin(a)), cy: f(-96.5 * Math.cos(a)), r: 0.9, class: 'w-dot' }, svg);
  }

  const selG = make('g', { class: 'w-sel' }, svg);
  make('path', { d: arc(101, rad(-28), rad(28)), class: 'w-sel-glow', filter: 'url(#wGlow)' }, selG);
  make('path', { d: arc(96.5, rad(-29), rad(29)), class: 'w-sel-rim' }, selG);
  make('path', { d: sector(44, 89, rad(-30), rad(30), 2.5), class: 'w-sel-fill' }, selG);
  make('path', { d: arc(88.4, rad(-28.6), rad(28.6)), class: 'w-sel-edge' }, selG);
  selG.setAttribute('transform', `rotate(${angle})`);

  make('circle', { r: 44, class: 'w-hubring' }, svg);
  make('circle', { r: 39, class: 'w-hub' }, svg);
  make('image', { href: 'assets/logo.png', x: -14, y: -21, width: 28, height: 28, class: 'w-logo' }, svg);
  const hubText = make('text', { x: 0, y: 19, class: 'w-hubtext' }, svg);

  const labels = CATS.map((c, i) => {
    const a = rad(i * 60 - 30);
    const g = make('g', { class: 'w-label', transform: `translate(${f(67 * Math.sin(a))} ${f(-67 * Math.cos(a))})` }, svg);
    pixels(ICONS[i], make('g', { transform: 'translate(-4.05 -13.55) scale(0.9)', 'shape-rendering': 'crispEdges' }, g));
    make('text', { x: 0, y: 2.5 }, g).textContent = c.name;
    return g;
  });

  // ---------- panel ----------
  const panel = root.querySelector('.panel');
  const tip = root.querySelector('.demo-tip');

  function setTip(label, text) {
    tip.textContent = '';
    const b = document.createElement('b');
    b.textContent = label;
    tip.append(b, text);
  }
  const defaultTip = () => setTip('TIP', 'Hover a module to see what it does');

  function toggleCount() {
    const rows = CATS[current].rows.filter((id) => MODULES[id][2] === 't');
    return rows.filter((id) => on[id]).length + ' / ' + rows.length;
  }

  function syncRow(b) {
    const id = b.dataset.id;
    if (MODULES[id][2] !== 't') return;
    b.classList.toggle('on', on[id]);
    b.setAttribute('aria-checked', String(on[id]));
  }

  function rowEl(id) {
    const m = MODULES[id];
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'p-row';
    b.dataset.id = id;
    b.appendChild(span('p-name', m[0]));
    if (m[2] === 'p') b.appendChild(span('p-status', PROFILES[profile]));
    else if (m[5]) b.appendChild(span('p-status', m[5]));
    if (m[4]) b.appendChild(span('p-dots'));
    if (m[2] === 't') {
      b.setAttribute('role', 'switch');
      b.appendChild(span('p-switch'));
    } else {
      b.appendChild(span('p-chev'));
    }
    syncRow(b);
    b.addEventListener('click', (e) => activate(id, b, !!e.target.closest('.p-dots')));
    b.addEventListener('mouseenter', () => setTip(m[0], m[1]));
    b.addEventListener('focus', () => setTip(m[0], m[1]));
    return b;
  }

  function renderPanel() {
    const cat = CATS[current];
    panel.textContent = '';
    const head = document.createElement('div');
    head.className = 'p-head';
    const icon = make('svg', { viewBox: '0 0 9 9', class: 'p-icon', 'shape-rendering': 'crispEdges', 'aria-hidden': 'true' });
    pixels(ICONS[current], icon);
    head.append(icon, span('p-title', cat.name), span('p-count', toggleCount()));
    const list = document.createElement('div');
    list.className = 'p-rows';
    if (!reduce) list.classList.add('swap');
    cat.rows.forEach((id) => list.appendChild(rowEl(id)));
    panel.append(head, list);
    panel.setAttribute('aria-label', cat.name + ' modules');
  }

  // Eases the highlight toward the selected segment, like the client's ~210 ms delta-time animation.
  function animateSel() {
    if (reduce) {
      shown = angle;
      selG.setAttribute('transform', `rotate(${f(shown)})`);
      return;
    }
    if (animating) return;
    animating = true;
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      shown += (angle - shown) * (1 - Math.exp(-14 * dt));
      if (Math.abs(angle - shown) < 0.05) shown = angle;
      selG.setAttribute('transform', `rotate(${f(shown)})`);
      if (shown !== angle) requestAnimationFrame(step);
      else animating = false;
    };
    requestAnimationFrame(step);
  }

  function select(i) {
    if (i === current && panel.firstChild) return;
    const target = i * 60 - 30;
    angle += ((((target - angle) % 360) + 540) % 360) - 180;
    animateSel();
    current = i;
    labels.forEach((l, k) => l.classList.toggle('sel', k === i));
    segs.forEach((s, k) => s.setAttribute('aria-pressed', String(k === i)));
    hubText.textContent = CATS[i].name;
    renderPanel();
  }

  function activate(id, b, settings) {
    const m = MODULES[id];
    if (settings) {
      setTip(m[0], 'In game this opens its settings');
      return;
    }
    if (m[2] === 't') {
      on[id] = !on[id];
      syncRow(b);
      panel.querySelector('.p-count').textContent = toggleCount();
      applyEffects();
      notify(m[0], on[id] ? 'Enabled' : 'Disabled');
      if (id === 'zoom' && on[id]) setTip(m[0], 'Hold C to try it');
      else if (id === 'fullbright' || id === 'client_hud') setTip(m[0], m[1]);
    } else if (m[2] === 'p') {
      profile = (profile + 1) % PROFILES.length;
      b.querySelector('.p-status').textContent = PROFILES[profile];
      notify(m[0], PROFILES[profile]);
    } else {
      setTip(m[0], 'In game this opens ' + m[0]);
    }
  }

  // ---------- HUD preview ----------
  const hudEls = Array.from(root.querySelectorAll('[data-hud]'));
  const val = (name) => root.querySelector(`[data-v="${name}"]`);
  const keyEl = (name) => root.querySelector(`[data-key="${name}"]`);
  const toast = root.querySelector('.hud-toast');
  let toastTimer = 0;

  function applyEffects() {
    hudEls.forEach((el) => {
      el.hidden = !(on.client_hud && on[el.dataset.hud]);
    });
    root.classList.toggle('fullbright', on.fullbright);
    if (!on.zoom) root.classList.remove('zooming');
  }

  function notify(title, text) {
    if (!on.notifications) return;
    toast.querySelector('b').textContent = title;
    toast.querySelector('span').textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
  }

  let visible = false;
  const clicks = { lmb: [], rmb: [] };
  const started = Date.now();
  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    if (!visible) return;
    const now = Date.now();
    for (const k in clicks) clicks[k] = clicks[k].filter((t) => now - t < 1000);
    val('lcps').textContent = clicks.lmb.length;
    val('rcps').textContent = clicks.rmb.length;
    val('cps').textContent = clicks.lmb.length;
  }
  function slowTick() {
    if (!visible) return;
    val('fps').textContent = 138 + Math.floor(Math.random() * 28);
    val('ping').textContent = 18 + Math.floor(Math.random() * 6);
    const d = new Date();
    val('clock').textContent = pad(d.getHours()) + ':' + pad(d.getMinutes());
    const s = Math.floor((Date.now() - started) / 1000);
    val('session').textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  setInterval(tick, 100);
  setInterval(slowTick, 500);

  const KEYS = { KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd', Space: 'space' };
  const typing = (e) => e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]');

  window.addEventListener('keydown', (e) => {
    if (!visible || typing(e)) return;
    if (KEYS[e.code]) keyEl(KEYS[e.code]).classList.add('down');
    if (e.code === 'KeyC' && on.zoom && root.classList.contains('open')) root.classList.add('zooming');
    if (e.code === 'ShiftRight') {
      root.classList.toggle('open');
      setTip('RIGHT SHIFT', root.classList.contains('open') ? 'Menu opened' : 'Menu closed - press Right Shift to open it again');
    }
  });
  window.addEventListener('keyup', (e) => {
    if (KEYS[e.code]) keyEl(KEYS[e.code]).classList.remove('down');
    if (e.code === 'KeyC') root.classList.remove('zooming');
  });
  window.addEventListener('blur', () => {
    root.querySelectorAll('.hud-key.down').forEach((k) => k.classList.remove('down'));
    root.classList.remove('zooming');
  });

  root.addEventListener('mousedown', (e) => {
    const k = e.button === 0 ? 'lmb' : e.button === 2 ? 'rmb' : null;
    if (!k) return;
    clicks[k].push(Date.now());
    keyEl(k).classList.add('down');
    tick();
  });
  window.addEventListener('mouseup', () => {
    keyEl('lmb').classList.remove('down');
    keyEl('rmb').classList.remove('down');
  });
  root.addEventListener('contextmenu', (e) => e.preventDefault());

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const inPanel = panel.contains(document.activeElement);
      select((current + (e.key === 'ArrowRight' ? 1 : 5)) % 6);
      if (inPanel) panel.querySelector('.p-row').focus();
      else segs[current].focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const rows = Array.from(panel.querySelectorAll('.p-row'));
      let i = rows.indexOf(document.activeElement);
      i = e.key === 'ArrowDown' ? Math.min(rows.length - 1, i + 1) : Math.max(0, i - 1);
      e.preventDefault();
      rows[i].focus();
    }
  });
  panel.addEventListener('mouseleave', defaultTip);

  // ---------- start ----------
  select(0);
  applyEffects();
  defaultTip();
  slowTick();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) {
          root.classList.add('open');
          slowTick();
        }
      });
    }, { threshold: 0.25 }).observe(root);
  } else {
    visible = true;
    root.classList.add('open');
  }
})();
