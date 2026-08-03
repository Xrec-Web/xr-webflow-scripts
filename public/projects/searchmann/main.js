// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase);

CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create("osmo", "M0,0 C0.625,0.05 0,1 1,1");
CustomEase.create("energy", "M0,0 C0.32,0.72 0,1 1,1");
CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
CustomEase.create("punch", "M0,0 C0.19,1 0.22,1 1,1");
CustomEase.create("relaxed", "M0,0 C0.7,0 0.3,1 1,1");
CustomEase.create("expo.inOut", "M0,0 C0.87,0 0.13,1 1,1");
CustomEase.create("jump", "M0,0 C0.35,1.5 0.6,1 1,1");
CustomEase.create("pop", "M0,0 C0.17,0.67 0.3,1.33 1,1");

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-example]')) initExample();
  if (document.querySelector('[data-reveal], [data-reveal-load]')) initReveal();
  if (document.querySelector('[data-fade], [data-fade-text]')) initFadeIn();
  if (document.querySelector('[data-logo-wall-cycle-init]')) initLogoWallCycle();
  if (document.body.hasAttribute('data-reveal-grid')) initGridReveal();
  if (document.querySelector('[data-grid-mask]')) initGridMask();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('[data-twostep-nav]')) initTwostepScalingNavigation();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// EXAMPLE //
function initExample() {
  // ...
}

// TEXT REVEAL //
function initReveal() {
  const FROM = { y: '1rem', opacity: 0 };
  const TO   = { y: '0rem', opacity: 1, ease: 'reveal' };

  // Scroll-triggered
  document.querySelectorAll('[data-reveal]:not([data-reveal-load])').forEach(el => {
    gsap.fromTo(el, FROM, {
      ...TO,
      duration: 0.9,
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top 85%)',
        once: true
      }
    });
  });

  // Load (hero elements — no ScrollTrigger)
  document.querySelectorAll('[data-reveal-load]').forEach((el, i) => {
    gsap.fromTo(el, FROM, {
      ...TO,
      duration: 0.9,
      delay: 0.1 + i * 0.08
    });
  });
}

// FADE IN //
// Text:     data-fade-text="char" | "word" | "line"   (defaults to "line")
// Elements: data-fade                                  (images, buttons, cards…)
// Add data-load to either to animate on page load instead of on scroll.
function initFadeIn() {
  const DURATION = 0.8;
  const STAGGER  = 0.05;   // tight overlap — next starts just after previous
  const EL_STAGGER = 0.08; // gap between consecutive data-load elements
  const LOAD_DELAY = 0.1;  // beat before the load sequence starts
  const EASE     = 'osmo';
  const BLUR     = 6;

  const FROM = { y: 10, filter: `blur(${BLUR}px)`, opacity: 0 };
  const TO   = { y: 0,  filter: 'blur(0px)', opacity: 1, ease: EASE, duration: DURATION };

  const SPLIT_MAP = {
    char: { type: 'lines, words, chars', key: 'chars' },
    word: { type: 'lines, words',        key: 'words' },
    line: { type: 'lines',               key: 'lines' }
  };

  const textEls  = gsap.utils.toArray('[data-fade-text]');
  const otherEls = gsap.utils.toArray('[data-fade]:not([data-fade-text])');

  // Hide up front so nothing flashes before fonts resolve / triggers fire
  gsap.set(textEls, { opacity: 0 });
  gsap.set(otherEls, FROM);

  // Load elements run as one sequence in DOM order, text and elements together
  const loadDelay = new Map();
  gsap.utils
    .toArray('[data-fade][data-load], [data-fade-text][data-load]')
    .forEach((el, i) => loadDelay.set(el, LOAD_DELAY + i * EL_STAGGER));

  const played = new Set();   // guards against autoSplit replaying a load animation

  document.fonts.ready.then(() => {
    // ── Text ──
    textEls.forEach(el => {
      const value = (el.getAttribute('data-fade-text') || 'line').trim().toLowerCase();
      const cfg   = SPLIT_MAP[value] || SPLIT_MAP.line;
      const onLoad = el.hasAttribute('data-load');

      SplitText.create(el, {
        type: cfg.type,
        autoSplit: true,          // re-splits on resize/font swap; reverts the returned tween
        onSplit(self) {
          gsap.set(el, { opacity: 1 });
          const targets = self[cfg.key];

          if (onLoad) {
            // A re-split after the intro has run should land at the end state
            if (played.has(el)) return gsap.set(targets, { ...TO, ease: 'none' });
            played.add(el);
            return gsap.fromTo(targets, FROM, {
              ...TO,
              stagger: STAGGER,
              delay: loadDelay.get(el)
            });
          }

          return gsap.fromTo(targets, FROM, {
            ...TO,
            stagger: STAGGER,
            scrollTrigger: {
              trigger: el,
              start: 'clamp(top 85%)',
              once: true
            }
          });
        }
      });
    });

    // ── Everything else ──
    otherEls
      .filter(el => el.hasAttribute('data-load'))
      .forEach(el => gsap.to(el, { ...TO, delay: loadDelay.get(el) }));

    // Batched so elements entering the viewport together stagger as one sequence
    ScrollTrigger.batch(otherEls.filter(el => !el.hasAttribute('data-load')), {
      start: 'top 85%',
      once: true,
      onEnter: batch => gsap.to(batch, { ...TO, stagger: STAGGER })
    });
  });
}

// LOGO WALL CYCLE //
function initLogoWallCycle() {
  const loopDelay = 1.5;   // Loop Duration
  const duration  = 0.9;   // Animation Duration

  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach(root => {
    const list  = root.querySelector('[data-logo-wall-list]');
    const items = Array.from(list.querySelectorAll('[data-logo-wall-item]'));

    const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false';
    const originalTargets = items
      .map(item => item.querySelector('[data-logo-wall-target]'))
      .filter(Boolean);

    let visibleItems = [];
    let visibleCount = 0;
    let pool         = [];
    let pattern      = [];
    let patternIndex = 0;
    let tl;

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none';
    }

    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function setup() {
      if (tl) tl.kill();

      visibleItems = items.filter(isVisible);
      visibleCount = visibleItems.length;

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
      patternIndex = 0;

      // remove all injected targets
      items.forEach(item => {
        item.querySelectorAll('[data-logo-wall-target]').forEach(old => old.remove());
      });

      pool = originalTargets.map(n => n.cloneNode(true));

      let front, rest;
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool);
        front = shuffledAll.slice(0, visibleCount);
        rest  = shuffleArray(shuffledAll.slice(visibleCount));
      } else {
        front = pool.slice(0, visibleCount);
        rest  = shuffleArray(pool.slice(visibleCount));
      }
      pool = front.concat(rest);

      for (let i = 0; i < visibleCount; i++) {
        const parent =
          visibleItems[i].querySelector('[data-logo-wall-target-parent]') ||
          visibleItems[i];
        parent.appendChild(pool.shift());
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
      tl.call(swapNext);
      tl.play();
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length;
      if (nowCount !== visibleCount) {
        setup();
        return;
      }
      if (!pool.length) return;

      const idx = pattern[patternIndex % visibleCount];
      patternIndex++;

      const container = visibleItems[idx];
      const parent =
        container.querySelector('[data-logo-wall-target-parent]') ||
        container.querySelector('*:has(> [data-logo-wall-target])') ||
        container;
      const existing = parent.querySelectorAll('[data-logo-wall-target]');
      if (existing.length > 1) return;

      const current  = parent.querySelector('[data-logo-wall-target]');
      const incoming = pool.shift();

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
      parent.appendChild(incoming);

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: 'expo.inOut',
          onComplete: () => {
            current.remove();
            pool.push(current);
          }
        });
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: 'expo.inOut'
      });
    }

    setup();

    let inView = true;

    function resume() {
      if (inView && !document.hidden) tl.play();
    }

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter:     () => { inView = true;  resume(); },
      onLeave:     () => { inView = false; tl.pause(); },
      onEnterBack: () => { inView = true;  resume(); },
      onLeaveBack: () => { inView = false; tl.pause(); }
    });

    document.addEventListener('visibilitychange', () =>
      document.hidden ? tl.pause() : resume()
    );
  });
}

// GRID REVEAL (cursor + drifting ghost spotlights) //
// Gate:    data-reveal-grid="true" on <body>
// Cells are measured off a live .grid-image-item and mirror its box exactly.
// Section: data-grid-reveal="green" | "white" | any CSS color
//          data-grid-match=".grid-image-item" — element to mirror
//          data-grid-radius="200"             — spotlight radius
// Fallbacks, used only when no matched element exists on the page:
//          data-grid-cols="10" / data-grid-ratio="1.15" / data-grid-gap=".5rem"
//          data-grid-cell="90" — size by cell width instead of column count
// Ghosts:  data-ghost-cursor inside the section
//          data-radius / data-drift / data-speed per ghost
// Shared cell geometry — read off a live .grid-image-item so the reveal grid
// and the image masks always match the real one. Returns null if none exists.
const GRID_MATCH = '.grid-image-item';

function measureGridCell(scope, selector = GRID_MATCH) {
  const sample = (scope && scope.querySelector(selector)) || document.querySelector(selector);
  if (!sample) return null;

  const b = sample.getBoundingClientRect();
  if (!b.width || !b.height) return null;

  const cs = getComputedStyle(sample);
  const parentCs = sample.parentElement ? getComputedStyle(sample.parentElement) : null;
  const colGap = parentCs ? parseFloat(parentCs.columnGap) || 0 : 0;

  return {
    w: b.width,
    h: b.height,
    colGap,
    rowGap: parentCs ? parseFloat(parentCs.rowGap) || colGap : colGap,
    radius: parseFloat(cs.borderTopLeftRadius) || 0,   // px, for SVG rx
    radiusCss: cs.borderRadius                          // as authored, for CSS
  };
}

// How far to shift an element's tiling so its cells land on the same lattice as
// everything else. Origin is the nearest [data-grid-origin] ancestor — or the
// element that attribute names as a selector — falling back to <body>, so the
// whole page shares one grid by default.
// Returns negative offsets: start tiling there and the grid lines up.
function gridPhase(el, stepX, stepY) {
  const holder = el.closest('[data-grid-origin]');
  const selector = holder && holder.getAttribute('data-grid-origin').trim();
  const origin = (selector && document.querySelector(selector)) || holder || document.body;

  const o = origin.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  const mod = (n, m) => (m > 0 ? ((n % m) + m) % m : 0);

  return { x: -mod(b.left - o.left, stepX), y: -mod(b.top - o.top, stepY) };
}

function initGridReveal() {
  const PALETTE = {
    green: 'rgba(45,168,113,.16)',
    white: 'rgba(255,255,255,.34)'
  };
  // Fallbacks — only used when no .grid-image-item is on the page
  const COLS = 10, RATIO = 1.15, GAP = '.5rem', CELL_RADIUS = '.3em';
  const RADIUS = 200, EASE = 0.14;
  // Ghost defaults: wider pools of light, roaming further and faster than the cursor
  const GHOST_SCALE = 1.8, GHOST_DRIFT = 280, GHOST_SPEED = 0.0007;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // One pointer, tracked in viewport space. Each section converts to its own
  // local coords every frame, so the light stays continuous across boundaries
  // instead of easing out to a sentinel on mouseleave.
  let pointerX = -9999, pointerY = -9999, hasPointer = false;
  document.addEventListener('pointermove', e => {
    pointerX = e.clientX;
    pointerY = e.clientY;
    hasPointer = true;
  }, { passive: true });

  document.querySelectorAll('[data-grid-reveal]').forEach(sec => {
    const value    = (sec.getAttribute('data-grid-reveal') || '').trim();
    const color    = PALETTE[value] || value || PALETTE.green;
    const baseR    = parseFloat(sec.getAttribute('data-grid-radius')) || RADIUS;
    const ratio    = parseFloat(sec.getAttribute('data-grid-ratio')) || RATIO;
    const gap      = sec.getAttribute('data-grid-gap') || GAP;
    const colsAttr = parseFloat(sec.getAttribute('data-grid-cols'));
    const cellSize = parseFloat(sec.getAttribute('data-grid-cell'));
    const matchSel = sec.getAttribute('data-grid-match') || GRID_MATCH;

    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'reveal-grid';
    layer.style.cssText =
      'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:1';
    sec.appendChild(layer);

    // Inner grid can sit at a negative offset to phase-align with the page
    // lattice; the layer clips whatever hangs outside the section.
    const inner = document.createElement('div');
    inner.style.cssText = 'position:absolute;display:grid';
    layer.appendChild(inner);

    let tx = 0, ty = 0, primed = false;
    let ghosts = [];

    function build() {
      const w = layer.clientWidth, h = layer.clientHeight;
      if (!w || !h) return;

      const m = measureGridCell(sec, matchSel);
      let cellW, cellH, colGap, rowGap, radius;

      if (m) {
        // Mirror the real item: fixed px box, same gaps, same corners
        cellW = m.w; cellH = m.h;
        colGap = m.colGap; rowGap = m.rowGap;
        radius = m.radiusCss;
      } else {
        inner.style.gap = gap;
        colGap = rowGap = parseFloat(getComputedStyle(inner).columnGap) || 0;

        const cols = colsAttr
          ? Math.max(1, Math.round(colsAttr))
          : cellSize
            ? Math.max(1, Math.round((w + colGap) / (cellSize + colGap)))
            : COLS;

        cellW  = (w - colGap * (cols - 1)) / cols;
        cellH  = cellW / ratio;
        radius = CELL_RADIUS;
      }

      // Phase-align to the shared lattice, then cover the shortfall
      const stepX = cellW + colGap, stepY = cellH + rowGap;
      const phase = gridPhase(layer, stepX, stepY);

      const cols = Math.max(1, Math.ceil((w - phase.x + colGap) / stepX));
      const rows = Math.max(1, Math.ceil((h - phase.y + rowGap) / stepY));

      inner.style.left = `${phase.x}px`;
      inner.style.top = `${phase.y}px`;
      inner.style.columnGap = `${colGap}px`;
      inner.style.rowGap = `${rowGap}px`;
      inner.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
      inner.style.gridAutoRows = `${cellH}px`;
      inner.innerHTML = '';

      for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `border:1px solid ${color};border-radius:${radius}`;
        inner.appendChild(cell);
      }
      scan();
    }

    // Deterministic pseudo-random from a seed, so a rebuild on resize doesn't
    // teleport the ghosts the way Math.random() would
    function hash(seed, n) {
      const x = Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453;
      return x - Math.floor(x);
    }

    // Three sine terms per axis, each with its own frequency and phase, so the
    // path is a wandering figure rather than a tidy ellipse. Independent x/y
    // frequencies mean every ghost drifts in its own direction.
    function motion(seed) {
      const TAU = Math.PI * 2;
      const terms = [];
      let total = 0;

      for (let k = 0; k < 3; k++) {
        const amp = 1 / (k + 1.4);
        total += amp;
        terms.push({
          amp,
          fx: 0.5 + hash(seed, k * 4)     * 1.8,
          fy: 0.5 + hash(seed, k * 4 + 1) * 1.8,
          px: hash(seed, k * 4 + 2) * TAU,
          py: hash(seed, k * 4 + 3) * TAU
        });
      }

      terms.forEach(t => { t.amp /= total; });   // keep the wander inside `drift`
      return terms;
    }

    function scan() {
      const gb = layer.getBoundingClientRect();
      ghosts = Array.from(sec.querySelectorAll('[data-ghost-cursor]')).map((n, i) => {
        n.style.pointerEvents = 'none';
        const b = n.getBoundingClientRect();
        const seed = i * 137.5 + 1;
        return {
          cx: b.left - gb.left + b.width / 2,
          cy: b.top - gb.top + b.height / 2,
          r:     parseFloat(n.getAttribute('data-radius')) || baseR * GHOST_SCALE,
          drift: parseFloat(n.getAttribute('data-drift'))  || GHOST_DRIFT,
          speed: (parseFloat(n.getAttribute('data-speed')) || 1) * GHOST_SPEED,
          terms: motion(seed)
        };
      });
    }

    const lay = (x, y, r) =>
      `radial-gradient(circle ${r}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, #000 0%, rgba(0,0,0,.4) 55%, transparent 80%)`;

    let rafId = null;
    let cursorR = 0;

    function loop(now) {
      const t = reducedMotion ? 0 : now;

      // Pointer in this section's local space — valid (and off-canvas) even
      // when the cursor is over a neighbouring section.
      const b = layer.getBoundingClientRect();
      const mx = hasPointer ? pointerX - b.left : -9999;
      const my = hasPointer ? pointerY - b.top  : -9999;

      if (primed) {
        tx += (mx - tx) * EASE;
        ty += (my - ty) * EASE;
      } else {
        tx = mx; ty = my; primed = true;   // snap on first frame, never sweep in
      }

      // Only the section actually under the cursor lights up, so neighbours
      // don't each render half a circle at a shared boundary. Eased so it
      // shrinks away rather than popping.
      const inside = hasPointer &&
        pointerX >= b.left && pointerX <= b.right &&
        pointerY >= b.top  && pointerY <= b.bottom;
      cursorR += ((inside ? baseR : 0) - cursorR) * EASE;

      const layers = [];
      if (cursorR > 1) layers.push(lay(tx, ty, cursorR));
      ghosts.forEach(g => {
        const s = t * g.speed;
        let dx = 0, dy = 0;

        g.terms.forEach(term => {
          dx += term.amp * Math.sin(s * term.fx + term.px);
          dy += term.amp * Math.sin(s * term.fy + term.py);
        });

        layers.push(lay(g.cx + g.drift * dx, g.cy + g.drift * dy, g.r));
      });

      // An empty list would clear the mask and expose the whole grid
      if (!layers.length) layers.push('linear-gradient(transparent, transparent)');

      const mask = layers.join(',');
      layer.style.webkitMaskImage = mask;
      layer.style.maskImage = mask;
      layer.style.webkitMaskComposite = 'source-over';
      layer.style.maskComposite = 'add';

      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (rafId === null) rafId = requestAnimationFrame(loop);
    }

    function stop() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      primed = false;   // re-entering the viewport snaps rather than sweeps
    }

    if (window.ResizeObserver) {
      new ResizeObserver(build).observe(sec);
    } else {
      let to;
      window.addEventListener('resize', () => {
        clearTimeout(to);
        to = setTimeout(build, 150);
      });
    }

    build();

    // Only burn frames while the section is on screen
    new IntersectionObserver(([entry]) => entry.isIntersecting ? start() : stop())
      .observe(sec);
  });
}

// GRID MASK (image revealed through real grid cells) //
// Put data-grid-mask on the grid container (e.g. .grid-image). Its cells are
// measured and used as a mask on the image sitting behind them, so the image
// shows only inside the cell shapes — alignment is exact by construction.
//   data-grid-mask="<selector>"   — which children are cells (default .grid-image-item)
//   data-grid-mask-target         — the element to mask (default: the container's img)
function initGridMask() {
  document.querySelectorAll('[data-grid-mask]').forEach(container => {
    const cellSel = (container.getAttribute('data-grid-mask') || '').trim() || GRID_MATCH;

    const target =
      container.querySelector('[data-grid-mask-target]') ||
      container.querySelector('img') ||
      (container.parentElement && container.parentElement.querySelector('[data-grid-mask-target], img'));

    if (!target) return;

    function apply() {
      const tb = target.getBoundingClientRect();
      if (!tb.width || !tb.height) return;

      let cells = Array.from(container.querySelectorAll(cellSel));
      if (!cells.length) cells = Array.from(container.children);
      cells = cells.filter(el => el !== target && !el.contains(target));
      if (!cells.length) return;

      // Cell boxes in the target's own coordinate space
      let rects = '';
      cells.forEach(cell => {
        const b = cell.getBoundingClientRect();
        if (!b.width || !b.height) return;
        const r = parseFloat(getComputedStyle(cell).borderTopLeftRadius) || 0;
        rects += `<rect x="${(b.left - tb.left).toFixed(1)}" y="${(b.top - tb.top).toFixed(1)}" ` +
                 `width="${b.width.toFixed(1)}" height="${b.height.toFixed(1)}" ` +
                 `rx="${r.toFixed(1)}" fill="#fff"/>`;
      });

      if (!rects) return;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tb.width}" height="${tb.height}" ` +
                  `viewBox="0 0 ${tb.width} ${tb.height}">${rects}</svg>`;
      const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      target.style.webkitMaskImage = url;
      target.style.maskImage = url;
      target.style.webkitMaskRepeat = target.style.maskRepeat = 'no-repeat';
      target.style.webkitMaskSize = target.style.maskSize = '100% 100%';
      target.style.webkitMaskPosition = target.style.maskPosition = '0 0';
    }

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(apply);
      ro.observe(container);
      ro.observe(target);
    } else {
      let to;
      window.addEventListener('resize', () => {
        clearTimeout(to);
        to = setTimeout(apply, 150);
      });
    }

    // Cells may reflow after fonts/images settle
    apply();
    if (target.tagName === 'IMG' && !target.complete) {
      target.addEventListener('load', apply, { once: true });
    }
  });
}

// FORM VALIDATION //
// Form:   data-form-validate
// Field:  data-validate wrapper around each input/textarea
//         min / max attributes drive length rules, type="email" the format rule
// Submit: data-submit wrapper around the real input[type="submit"]
// Classes applied to the wrapper: is--filled, is--success, is--error
function initBasicFormValidation() {
  const MIN_FILL_SECONDS = 5;   // anything faster is treated as a bot

  document.querySelectorAll('[data-form-validate]').forEach(form => {
    const fields = form.querySelectorAll('[data-validate] input, [data-validate] textarea');
    const submitButtonDiv = form.querySelector('[data-submit]');
    const submitInput = submitButtonDiv && submitButtonDiv.querySelector('input[type="submit"]');

    if (!submitButtonDiv || !submitInput) return;   // markup incomplete — leave the form alone

    const formLoadTime = Date.now();
    const liveFields = new WeakSet();   // guards against stacking input listeners

    function validateField(field) {
      const parent = field.closest('[data-validate]');
      const minLength = field.getAttribute('min');
      const maxLength = field.getAttribute('max');
      const type = field.getAttribute('type');
      const value = field.value.trim();
      let isValid = true;

      parent.classList.toggle('is--filled', value !== '');

      if (field.required && value === '') isValid = false;
      if (minLength && field.value.length < +minLength) isValid = false;
      if (maxLength && field.value.length > +maxLength) isValid = false;
      if (type === 'email' && !/\S+@\S+\.\S+/.test(field.value)) isValid = false;

      parent.classList.toggle('is--success', isValid);
      parent.classList.toggle('is--error', !isValid);

      return isValid;
    }

    function startLiveValidation(field) {
      if (liveFields.has(field)) return;
      liveFields.add(field);
      field.addEventListener('input', () => validateField(field));
    }

    function validateAll() {
      let allValid = true;
      let firstInvalid = null;

      fields.forEach(field => {
        const valid = validateField(field);
        if (!valid) {
          allValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
        startLiveValidation(field);
      });

      if (firstInvalid) firstInvalid.focus();
      return allValid;
    }

    const isSpam = () => (Date.now() - formLoadTime) / 1000 < MIN_FILL_SECONDS;

    function trySubmit() {
      if (!validateAll()) return;
      if (isSpam()) {
        alert('Form submitted too quickly. Please try again.');
        return;
      }
      submitInput.click();
    }

    submitButtonDiv.addEventListener('click', trySubmit);

    form.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        trySubmit();
      }
    });
  });
}

// TWO-STEP SCALING NAVIGATION //
// Nav:     data-twostep-nav on the nav element
//          data-nav-status on the element the CSS keys off ("active" / "not-active")
// Buttons: data-nav-toggle="toggle" | "close"
function initTwostepScalingNavigation() {
  const navElement = document.querySelector('[data-twostep-nav]');
  const navStatusEl = document.querySelector('[data-nav-status]');

  if (!navElement || !navStatusEl) return;

  const setNavStatus = status => navStatusEl.setAttribute('data-nav-status', status);
  const isActive = () => navStatusEl.getAttribute('data-nav-status') === 'active';

  const openNav = () => {
    setNavStatus('active');
    lenis.stop();      // lock the page behind the overlay
  };

  const closeNav = () => {
    setNavStatus('not-active');
    lenis.start();
  };

  const toggleNav = () => (isActive() ? closeNav() : openNav());

  document.querySelectorAll('[data-nav-toggle="toggle"]').forEach(btn => {
    btn.addEventListener('click', toggleNav);
  });

  document.querySelectorAll('[data-nav-toggle="close"]').forEach(btn => {
    btn.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isActive()) closeNav();
  });
}
