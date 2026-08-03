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

function initGridReveal() {
  const PALETTE = {
    green: 'rgba(45,168,113,.16)',
    white: 'rgba(255,255,255,.34)'
  };
  // Fallbacks — only used when no .grid-image-item is on the page
  const COLS = 10, RATIO = 1.15, GAP = '.5rem', CELL_RADIUS = '.3em';
  const RADIUS = 200, EASE = 0.14;
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
      'position:absolute;inset:0;display:grid;pointer-events:none;overflow:hidden;z-index:1';
    sec.appendChild(layer);

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
        layer.style.gap = gap;
        colGap = rowGap = parseFloat(getComputedStyle(layer).columnGap) || 0;

        const cols = colsAttr
          ? Math.max(1, Math.round(colsAttr))
          : cellSize
            ? Math.max(1, Math.round((w + colGap) / (cellSize + colGap)))
            : COLS;

        cellW  = (w - colGap * (cols - 1)) / cols;
        cellH  = cellW / ratio;
        radius = CELL_RADIUS;
      }

      const cols = Math.max(1, Math.ceil((w + colGap) / (cellW + colGap)));
      const rows = Math.max(1, Math.ceil((h + rowGap) / (cellH + rowGap)));

      layer.style.columnGap = `${colGap}px`;
      layer.style.rowGap = `${rowGap}px`;
      layer.style.gridTemplateColumns = `repeat(${cols}, ${cellW}px)`;
      layer.style.gridAutoRows = `${cellH}px`;
      layer.innerHTML = '';

      for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `border:1px solid ${color};border-radius:${radius}`;
        layer.appendChild(cell);
      }
      scan();
    }

    function scan() {
      const gb = layer.getBoundingClientRect();
      ghosts = Array.from(sec.querySelectorAll('[data-ghost-cursor]')).map((n, i) => {
        n.style.pointerEvents = 'none';
        const b = n.getBoundingClientRect();
        return {
          cx: b.left - gb.left + b.width / 2,
          cy: b.top - gb.top + b.height / 2,
          r:     parseFloat(n.getAttribute('data-radius')) || baseR,
          drift: parseFloat(n.getAttribute('data-drift'))  || 120,
          speed: (parseFloat(n.getAttribute('data-speed')) || 1) * 0.00035,
          seed:  i * 137.5
        };
      });
    }

    const lay = (x, y, r) =>
      `radial-gradient(circle ${r}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, #000 0%, rgba(0,0,0,.4) 55%, transparent 80%)`;

    let rafId = null;

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

      const layers = [lay(tx, ty, baseR)];
      ghosts.forEach(g => {
        const s = t * g.speed, p = g.seed, D = g.drift;
        layers.push(lay(
          g.cx + D * (Math.sin(s + p) * 0.6 + Math.sin(s * 1.7 + p * 1.3) * 0.3 + Math.sin(s * 2.9 + p * 2.1) * 0.1),
          g.cy + D * (Math.cos(s * 1.3 + p * 0.7) * 0.6 + Math.cos(s * 2.1 + p * 1.9) * 0.3 + Math.cos(s * 3.7 + p * 0.4) * 0.1),
          g.r
        ));
      });

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

// GRID MASK (chop a full-bleed image into the page's squares) //
// Put data-grid-mask on the image's container. The image shows only inside the
// cell shapes; the page background shows through the gaps.
//   data-grid-match=".grid-image-item" — mirror a live element, if one exists
//   data-grid-mask-align="left|center" — how partial columns are distributed
//   data-grid-rows="3"                 — exact row count, sets container height
//   data-grid-rows-fit                 — with rows, keep the height, stretch cells
// Standalone (no element to mirror), all optional:
//   data-grid-cols="10" / data-grid-ratio="1.15" / data-grid-gap=".5rem"
//   data-grid-cell="90"        — size by cell width instead of column count
//   data-grid-cell-radius=".3em"
function initGridMask() {
  const COLS = 10, RATIO = 1.15, GAP = '.5rem', CELL_RADIUS = '.3em';

  // Resolve any CSS length (rem, em, %, px) against the element's own context
  function toPx(value, el) {
    if (value === null || value === '') return null;
    // <img> can't hold children, so measure in its parent — same font context
    const host = el.parentElement || document.body;
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;height:0;width:${value}`;
    probe.style.font = getComputedStyle(el).font;
    host.appendChild(probe);
    const px = probe.getBoundingClientRect().width;
    probe.remove();
    return px;
  }

  document.querySelectorAll('[data-grid-mask]').forEach(box => {
    const matchSel = box.getAttribute('data-grid-match') || GRID_MATCH;
    const align    = (box.getAttribute('data-grid-mask-align') || 'left').trim();
    const colsAttr = parseFloat(box.getAttribute('data-grid-cols'));
    const rowsAttr = parseFloat(box.getAttribute('data-grid-rows'));
    const fitRows  = box.hasAttribute('data-grid-rows-fit');
    const cellSize = parseFloat(box.getAttribute('data-grid-cell'));
    const ratio    = parseFloat(box.getAttribute('data-grid-ratio')) || RATIO;

    // Derive cell geometry from the box itself when nothing on the page matches
    function fallback(w) {
      const gap = toPx(box.getAttribute('data-grid-gap') || GAP, box) || 0;
      const cols = colsAttr
        ? Math.max(1, Math.round(colsAttr))
        : cellSize
          ? Math.max(1, Math.round((w + gap) / (cellSize + gap)))
          : COLS;

      const cellW = (w - gap * (cols - 1)) / cols;
      return {
        w: cellW,
        h: cellW / ratio,
        colGap: gap,
        rowGap: gap,
        radius: toPx(box.getAttribute('data-grid-cell-radius') || CELL_RADIUS, box) || 0
      };
    }

    function apply() {
      const w = box.clientWidth;
      if (!w) return;

      const m = measureGridCell(box, matchSel) || fallback(w);

      // data-grid-rows pins the row count so no row is ever clipped.
      // Default: set the container height to fit them at their true aspect.
      // data-grid-rows-fit: keep the container height, stretch cells instead.
      if (rowsAttr) {
        if (fitRows) {
          m.h = (box.clientHeight - m.rowGap * (rowsAttr - 1)) / rowsAttr;
        } else {
          const target = rowsAttr * m.h + m.rowGap * (rowsAttr - 1);
          if (Math.abs(box.clientHeight - target) > 0.5) box.style.height = `${target}px`;
        }
      }

      const h = box.clientHeight;
      if (!h || m.h <= 0) return;

      const stepX = m.w + m.colGap;
      const stepY = m.h + m.rowGap;

      const cols = Math.max(1, Math.ceil((w + m.colGap) / stepX));
      const rows = rowsAttr
        ? Math.max(1, Math.round(rowsAttr))
        : Math.max(1, Math.ceil((h + m.rowGap) / stepY));

      // Centring splits the leftover width evenly instead of clipping the last column
      const offsetX = align === 'center' ? -((cols * stepX - m.colGap) - w) / 2 : 0;

      let rects = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * stepX;
          const y = r * stepY;
          rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" ` +
                   `width="${m.w.toFixed(1)}" height="${m.h.toFixed(1)}" ` +
                   `rx="${m.radius.toFixed(1)}" fill="#fff"/>`;
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
                  `viewBox="0 0 ${w} ${h}">${rects}</svg>`;
      const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      box.style.webkitMaskImage = url;
      box.style.maskImage = url;
      box.style.webkitMaskRepeat = box.style.maskRepeat = 'no-repeat';
      box.style.webkitMaskSize = box.style.maskSize = '100% 100%';
    }

    if (window.ResizeObserver) {
      new ResizeObserver(apply).observe(box);
    } else {
      let to;
      window.addEventListener('resize', () => {
        clearTimeout(to);
        to = setTimeout(apply, 150);
      });
      apply();
    }
  });
}
