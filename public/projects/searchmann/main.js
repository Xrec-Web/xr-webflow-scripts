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
  if (document.querySelector('[data-grid-reveal]')) initGridReveal();
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
function initFadeIn() {
  const DURATION = 0.8;
  const STAGGER  = 0.05;   // tight overlap — next starts just after previous
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

  // ── Text ──
  document.fonts.ready.then(() => {
    textEls.forEach(el => {
      const value = (el.getAttribute('data-fade-text') || 'line').trim().toLowerCase();
      const cfg   = SPLIT_MAP[value] || SPLIT_MAP.line;

      SplitText.create(el, {
        type: cfg.type,
        autoSplit: true,          // re-splits on resize/font swap; reverts the returned tween
        onSplit(self) {
          gsap.set(el, { opacity: 1 });
          return gsap.fromTo(self[cfg.key], FROM, {
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
  });

  // ── Everything else ──
  // Batched so elements entering the viewport together stagger as one sequence.
  ScrollTrigger.batch(otherEls, {
    start: 'top 85%',
    once: true,
    onEnter: batch => gsap.to(batch, { ...TO, stagger: STAGGER })
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
// Section: data-grid-reveal="green" | "white" | any CSS color
//          data-grid-cell="90"    — approx cell size in px
//          data-grid-radius="200" — default spotlight radius
// Ghosts:  data-ghost-cursor inside the section
//          data-radius / data-drift / data-speed per ghost
function initGridReveal() {
  const PALETTE = {
    green: 'rgba(45,168,113,.16)',
    white: 'rgba(255,255,255,.34)'
  };
  const CELL = 90, RADIUS = 200, EASE = 0.14;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-grid-reveal]').forEach(sec => {
    const value    = (sec.getAttribute('data-grid-reveal') || '').trim();
    const color    = PALETTE[value] || value || PALETTE.green;
    const cellSize = parseFloat(sec.getAttribute('data-grid-cell')) || CELL;
    const baseR    = parseFloat(sec.getAttribute('data-grid-radius')) || RADIUS;

    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';

    const layer = document.createElement('div');
    layer.className = 'reveal-grid';
    layer.style.cssText =
      'position:absolute;inset:0;display:grid;pointer-events:none;overflow:hidden;z-index:1';
    sec.appendChild(layer);

    let mx = -9999, my = -9999, tx = -9999, ty = -9999;
    let ghosts = [];

    function build() {
      const w = layer.clientWidth, h = layer.clientHeight;
      if (!w || !h) return;

      const cols = Math.max(1, Math.round(w / cellSize));
      const size = w / cols;
      const rows = Math.ceil(h / size);

      layer.style.gridTemplateColumns = `repeat(${cols}, ${size}px)`;
      layer.style.gridAutoRows = `${size}px`;
      layer.innerHTML = '';

      for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement('div');
        cell.style.cssText = `border:1px solid ${color};border-radius:10px;margin:4px`;
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
      tx += (mx - tx) * EASE;
      ty += (my - ty) * EASE;

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
    }

    sec.addEventListener('mousemove', e => {
      const b = layer.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
    });
    sec.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

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
