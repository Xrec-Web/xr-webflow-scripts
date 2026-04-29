// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── PLUGINS ─────────────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer, CustomEase, ScrambleTextPlugin);

CustomEase.create('reveal',   'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('osmo',     'M0,0 C0.625,0.05 0,1 1,1');
CustomEase.create('energy',   'M0,0 C0.32,0.72 0,1 1,1');
CustomEase.create('smooth',   'M0,0 C0.38,0.005 0.215,1 1,1');
CustomEase.create('punch',    'M0,0 C0.19,1 0.22,1 1,1');
CustomEase.create('relaxed',  'M0,0 C0.7,0 0.3,1 1,1');
CustomEase.create('expo.inOut','M0,0 C0.87,0 0.13,1 1,1');
CustomEase.create('jump',     'M0,0 C0.35,1.5 0.6,1 1,1');
CustomEase.create('pop',      'M0,0 C0.17,0.67 0.3,1.33 1,1');


// ─── BARBA SETUP ─────────────────────────────────────────────────────────────

history.scrollRestoration = 'manual';

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== 'undefined';
const hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';

const rmMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.('change', e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);


// ─── INIT REGISTRIES ─────────────────────────────────────────────────────────

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;

  // Runs once on first load only
  if (document.querySelector('[data-cursor]')) initScrambleTextCursor();
}

function initSuperform(container) {
  if (!container.querySelector('[sf-form-block]')) return;
  document.querySelectorAll('script[src*="superform"]').forEach(s => s.remove());
  delete window.SuperformAPI;
  delete window.Superform;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@deltaclan/superform@2/dist/superform.js';
  document.head.appendChild(script);
}

function initPageFunctions(container) {
  nextPage = container || document;
  const q = (s) => !!nextPage.matches?.(s) || !!nextPage.querySelector(s);

  if (q('[data-accordion-css-init]'))    initAccordionCSS();
  if (q('[data-form-validate]'))         initBasicFormValidation();
  if (q('.img:not(.no-para)'))           initImageScrollEffect();
  if (q('[data-current-year]'))          initDynamicCurrentYear();
  if (q('[data-team-member]'))           initTeamInteractions();
  if (q('.faq_toggle_inner'))            initFAQToggle();
  if (q('[data-button-animate-chars]'))  initButtonCharacterStagger();
  if (q('[data-link-animate-chars]'))    initLinkCharacterStagger();
  if (q('[data-sequence-wrap]'))         initImageSequenceScroll();
  if (q('[hero-wrap]'))                   initHeroWrapReveal();
  if (q('[data-split]'))                 initSplitTextReveal();
  if (q('[data-reveal]'))                initReveal();
  if (q('[serv-list]'))                  initServList();
  if (q('[data-globe]'))                 initDefenceGlobe(nextPage);
  if (q('[data-swiper-group]'))          initSwiperSlider();
}

function destroyPageFunctions(container) {
  destroyDefenceGlobes(container);
}


// ─── PAGE TRANSITIONS ────────────────────────────────────────────────────────

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();
  tl.call(() => resetPage(next), null, 0);
  return tl;
}

function runPageLeaveAnimation(current) {
  const tl = gsap.timeline({ onComplete: () => { destroyPageFunctions(current); current.remove(); } });

  if (reducedMotion) return tl.set(current, { autoAlpha: 0 });

  tl.to(current, { autoAlpha: 0, ease: 'power1.in', duration: 0.5 }, 0);
  return tl;
}

function runPageEnterAnimation(next) {
  const tl = gsap.timeline();

  if (reducedMotion) {
    tl.set(next, { autoAlpha: 1 });
    tl.add('pageReady');
    tl.call(resetPage, [next], 'pageReady');
    return new Promise(resolve => tl.call(resolve, null, 'pageReady'));
  }

  tl.add('startEnter', 0);

  tl.fromTo(next, { autoAlpha: 0 }, {
    autoAlpha: 1,
    ease: 'power1.inOut',
    duration: 0.75,
  }, 'startEnter');

  tl.fromTo(next.querySelector('h1'), { yPercent: 25, autoAlpha: 0 }, {
    yPercent: 0,
    autoAlpha: 1,
    ease: 'expo.out',
    duration: 1,
  }, '< 0.3');

  tl.add('pageReady');
  tl.call(resetPage, [next], 'pageReady');

  return new Promise(resolve => tl.call(resolve, null, 'pageReady'));
}

// Pick-location leave: graphic expands + page fades, fires once as the leave transition
function runPickLocationLeaveAnimation(current) {
  const graphic = current.querySelector('[trigger-graphic]');
  const fadeEl  = current.querySelector('[fade-out]');

  const tl = gsap.timeline({ onComplete: () => { destroyPageFunctions(current); current.remove(); } });

  if (reducedMotion) return tl.set(current, { autoAlpha: 0 });

  if (graphic) {
    tl.to(graphic, { width: '225%', duration: 1, ease: 'osmo' }, 0);
    tl.to(graphic, { opacity: 0,    duration: 0.5, ease: 'osmo' }, 0);
  }
  if (fadeEl) {
    tl.to(fadeEl, { opacity: 0, filter: 'blur(10px)', duration: 0.5, ease: 'osmo' }, 0);
  }

  return tl;
}


// ─── BARBA HOOKS ─────────────────────────────────────────────────────────────

barba.hooks.beforeEnter(data => {
  gsap.set(data.next.container, { position: 'fixed', top: 0, left: 0, right: 0 });
  if (lenis) lenis.stop();
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if (hasScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter(data => {
  initPageFunctions(data.next.container);
  initSuperform(data.next.container);
  if (lenis) { lenis.resize(); lenis.start(); }
  if (hasScrollTrigger) ScrollTrigger.refresh();
});

barba.init({
  debug: false,
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: 'pick-location',
      custom: ({ trigger }) => trigger?.hasAttribute?.('trigger-animation'),
      sync: true,
      async once(data) {
        initOnceFunctions();
        return runPageOnceAnimation(data.next.container);
      },
      async leave(data) {
        return runPickLocationLeaveAnimation(data.current.container);
      },
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
    {
      name: 'default',
      sync: true,
      async once(data) {
        initOnceFunctions();
        return runPageOnceAnimation(data.next.container);
      },
      async leave(data) {
        return runPageLeaveAnimation(data.current.container);
      },
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      },
    },
  ],
});


// ─── HELPERS ─────────────────────────────────────────────────────────────────

const themeConfig = {
  light: { nav: 'dark',  transition: 'light' },
  dark:  { nav: 'light', transition: 'dark'  },
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || 'light';
  const config = themeConfig[pageTheme] || themeConfig.light;
  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) transitionEl.dataset.themeTransition = config.transition;
  const nav = document.querySelector('[data-theme-nav]');
  if (nav) nav.dataset.themeNav = config.nav;
}

function initLenis() {
  if (lenis || !hasLenis) return;
  lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
  if (hasScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: 'position,top,left,right' });
  if (lenis) { lenis.resize(); lenis.start(); }
}

function initBarbaNavUpdate(data) {
  const tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  const nextNodes    = tpl.content.querySelectorAll('[data-barba-update]');
  const currentNodes = document.querySelectorAll('nav [data-barba-update]');
  currentNodes.forEach((curr, i) => {
    const next = nextNodes[i];
    if (!next) return;
    const newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) curr.setAttribute('aria-current', newStatus);
    else curr.removeAttribute('aria-current');
    curr.setAttribute('class', next.getAttribute('class') || '');
  });
}

const DEFENCE_GLOBE_WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const DEFENCE_GLOBE_DEFAULT_LOCATIONS = [
  { name: 'Darwin',        lat: -12.4634, lng: 130.8456 },
  { name: 'Tindal',        lat: -14.5211, lng: 132.3783 },
  { name: 'Alice Springs', lat: -23.6980, lng: 133.8807 },
  { name: 'Woomera',       lat: -31.1999, lng: 136.8250 },
  { name: 'Exmouth',       lat: -21.9323, lng: 114.1278 },
  { name: 'Geraldton',     lat: -28.7744, lng: 114.6089 },
  { name: 'Wagga Wagga',   lat: -35.1082, lng: 147.3598 },
  { name: 'Broome',        lat: -17.9614, lng: 122.2359 },
];
const DEFENCE_GLOBE_DEFAULT_COLOR = '#547EA3';
const DEFENCE_GLOBE_AUSTRALIA_CENTER = { lat: -25.0, lng: 133.0 };

let defenceGlobeModulesPromise = null;

function initDefenceGlobe(container) {
  initDefenceGlobes(container).catch((err) => {
    console.error('[DefenceGlobe] init failed:', err);
  });
}

function getDefenceGlobeElements(scope = document) {
  const elements = [];
  if (scope instanceof Element && scope.matches('[data-globe]')) elements.push(scope);
  if (scope?.querySelectorAll) elements.push(...scope.querySelectorAll('[data-globe]'));
  return elements;
}

function destroyDefenceGlobes(scope = document) {
  getDefenceGlobeElements(scope).forEach((container) => {
    container._defenceGlobeObserver?.disconnect?.();
    delete container._defenceGlobeObserver;
    container._defenceGlobe?.destroy?.();
    delete container._defenceGlobe;
  });
}

async function loadDefenceGlobeModules() {
  if (!defenceGlobeModulesPromise) {
    defenceGlobeModulesPromise = Promise.all([
      import('https://esm.sh/three@0.160.0'),
      import('https://esm.sh/topojson-client@3'),
    ]).then(([THREE, topojsonMod]) => ({
      THREE,
      topojsonMod,
    }));
  }

  return defenceGlobeModulesPromise;
}

function hexToRgbNorm(hex) {
  const clean  = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8)  & 255) / 255,
    b: ( bigint        & 255) / 255,
    hex: bigint,
  };
}

function lightenHex(hexInt, amount = 0.3) {
  const r = Math.min(255, ((hexInt >> 16) & 255) + 255 * amount);
  const g = Math.min(255, ((hexInt >> 8)  & 255) + 255 * amount);
  const b = Math.min(255, ( hexInt        & 255) + 255 * amount);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

function createLngLatToVec3(THREE, lng, lat, radius) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
  );
}

async function initDefenceGlobes(scope = document, options = {}) {
  const { lazy = true, rootMargin = '200px', ...globeOptions } = options;

  getDefenceGlobeElements(scope).forEach((container) => {
    if (container.hasAttribute('data-globe-initialised')) return;

    if (!lazy || typeof IntersectionObserver === 'undefined') {
      initDefenceGlobeInstance(container, globeOptions).catch((err) => {
        console.error('[DefenceGlobe] init failed:', err);
      });
      return;
    }

    if (container._defenceGlobeObserver) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        obs.disconnect();
        delete container._defenceGlobeObserver;
        initDefenceGlobeInstance(entry.target, globeOptions).catch((err) => {
          console.error('[DefenceGlobe] init failed:', err);
        });
      });
    }, { rootMargin });

    container._defenceGlobeObserver = observer;
    observer.observe(container);
  });
}

async function initDefenceGlobeInstance(container, options = {}) {
  if (container.hasAttribute('data-globe-initialised')) return container._defenceGlobe;
  container.setAttribute('data-globe-initialised', 'true');

  const { THREE, topojsonMod } = await loadDefenceGlobeModules();
  const accentHex = options.color || container.dataset.globeColor || DEFENCE_GLOBE_DEFAULT_COLOR;
  let locations   = options.locations || DEFENCE_GLOBE_DEFAULT_LOCATIONS;

  if (container.dataset.globeLocations) {
    try { locations = JSON.parse(container.dataset.globeLocations); }
    catch { console.warn('[DefenceGlobe] Invalid data-globe-locations JSON, using defaults.'); }
  }

  const zoomAttr = options.zoom || container.dataset.globeZoom || 'auto';
  const accent   = hexToRgbNorm(accentHex);
  const ACCENT_HEX   = accent.hex;
  const ACCENT_LIGHT = lightenHex(ACCENT_HEX, 0.3);
  const ACCENT_RGB   = { r: accent.r, g: accent.g, b: accent.b };

  container.style.setProperty('--dg-accent', accentHex);
  const rgbStr = `${Math.round(accent.r * 255)}, ${Math.round(accent.g * 255)}, ${Math.round(accent.b * 255)}`;
  container.style.setProperty('--dg-rule', `rgba(${rgbStr}, 0.35)`);

  const canvas     = Object.assign(document.createElement('canvas'), { className: 'dg-canvas' });
  const vignette   = Object.assign(document.createElement('div'), { className: 'dg-vignette' });
  const labelLayer = Object.assign(document.createElement('div'), { className: 'dg-pin-labels' });
  container.append(canvas, vignette, labelLayer);

  const topology = await fetch(DEFENCE_GLOBE_WORLD_ATLAS_URL).then((r) => r.json()).catch(() => null);
  const getSize = () => ({ w: container.clientWidth || 1, h: container.clientHeight || 1 });
  const size    = getSize();
  const scene   = new THREE.Scene();
  const camera  = new THREE.PerspectiveCamera(35, size.w / size.h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size.w, size.h, false);

  const GLOBE_RADIUS = 1.6;
  const globeGroup   = new THREE.Group();
  scene.add(globeGroup);

  globeGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96),
    new THREE.MeshBasicMaterial({ color: 0x081624 })
  ));

  const gratMat = new THREE.LineBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.22 });
  for (let lat = -60; lat <= 60; lat += 15) {
    const pts = [];
    for (let lng = -180; lng <= 180; lng += 2) pts.push(createLngLatToVec3(THREE, lng, lat, GLOBE_RADIUS * 1.001));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }
  for (let lng = -180; lng < 180; lng += 15) {
    const pts = [];
    for (let lat = -85; lat <= 85; lat += 2) pts.push(createLngLatToVec3(THREE, lng, lat, GLOBE_RADIUS * 1.001));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }

  if (topology) {
    try {
      const countriesGeo = topojsonMod.feature(topology, topology.objects.countries);
      const lineMat      = new THREE.LineBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.95 });
      const r            = GLOBE_RADIUS * 1.003;

      countriesGeo.features.forEach(({ geometry: geom }) => {
        if (!geom) return;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
        polys.forEach((poly) => poly.forEach((ring) => {
          const points = [];
          for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i];
            const [lng2, lat2] = ring[i + 1];
            const steps = Math.max(2, Math.ceil(Math.hypot(lng2 - lng1, lat2 - lat1)));
            for (let s = 0; s < steps; s++) {
              const t = s / steps;
              points.push(createLngLatToVec3(THREE, lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t, r));
            }
          }
          const [lngEnd, latEnd] = ring[ring.length - 1];
          points.push(createLngLatToVec3(THREE, lngEnd, latEnd, r));
          globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat));
        }));
      });
    } catch (err) {
      console.warn('[DefenceGlobe] Country boundaries parse failed:', err);
    }
  }

  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.06, 64, 64),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b) } },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vPositionNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uColor; varying vec3 vNormal; varying vec3 vPositionNormal;
        void main() {
          float intensity = pow(1.0 + dot(vNormal, vPositionNormal), 3.5);
          gl_FragColor = vec4(uColor, 1.0) * intensity * 0.5;
        }`,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    })
  ));

  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r     = 80 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xaaccee, size: 0.4, transparent: true, opacity: 0.6, sizeAttenuation: true,
  }));
  scene.add(stars);

  const markers = [];
  locations.forEach((loc) => {
    const pos    = createLngLatToVec3(THREE, loc.lng, loc.lat, GLOBE_RADIUS * 1.004);
    const normal = pos.clone().normalize();

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 16, 16),
      new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT })
    );
    dot.position.copy(pos);
    globeGroup.add(dot);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.014, 0.018, 32),
      new THREE.MeshBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    halo.position.copy(pos).add(normal.clone().multiplyScalar(0.001));
    halo.lookAt(normal.clone().multiplyScalar(2));
    globeGroup.add(halo);

    const pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.014, 0.016, 48),
      new THREE.MeshBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    pulse.position.copy(pos).add(normal.clone().multiplyScalar(0.002));
    pulse.lookAt(normal.clone().multiplyScalar(2));
    globeGroup.add(pulse);

    markers.push({ data: loc, worldPos: pos.clone(), normal, halo, pulse, dot, phase: Math.random() * Math.PI * 2 });
  });

  function createArc(start, end, heightFactor = 0.2) {
    const distance    = start.distanceTo(end);
    const mid         = start.clone().add(end).multiplyScalar(0.5);
    const chordMidLen = mid.length();
    mid.normalize().multiplyScalar(chordMidLen + distance * heightFactor);
    const curve  = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(64);
    const geo    = new THREE.BufferGeometry().setFromPoints(points);
    const colors = [];
    for (let i = 0; i <= 64; i++) {
      const fade = Math.sin((i / 64) * Math.PI);
      colors.push(ACCENT_RGB.r * fade, ACCENT_RGB.g * fade, ACCENT_RGB.b * fade);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return {
      line: new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.6 })),
      points,
    };
  }

  const connections = [];
  const seen = new Set();
  markers.forEach((m, i) => {
    markers
      .map((other, j) => ({ j, d: i === j ? Infinity : m.worldPos.distanceTo(other.worldPos) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          connections.push([i, j]);
        }
      });
  });

  const arcs = connections.map(([a, b]) => {
    const arc = createArc(markers[a].worldPos, markers[b].worldPos);
    globeGroup.add(arc.line);
    return arc;
  });

  const pulseParticles = arcs.map((arc) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 12, 12),
      new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT, transparent: true, opacity: 1 })
    );
    globeGroup.add(mesh);
    return { mesh, points: arc.points, progress: Math.random(), speed: 0.003 + Math.random() * 0.003 };
  });

  const labelEls = markers.map((m) => {
    const el = Object.assign(document.createElement('div'), { className: 'dg-pin-label', textContent: m.data.name });
    labelLayer.appendChild(el);
    return el;
  });

  let centreLat = DEFENCE_GLOBE_AUSTRALIA_CENTER.lat;
  let centreLng = DEFENCE_GLOBE_AUSTRALIA_CENTER.lng;
  if (locations.length > 0) {
    centreLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    centreLng = locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length;
  }
  const centreVec = createLngLatToVec3(THREE, centreLng, centreLat, 1).normalize();
  const CAM_DISTANCE = zoomAttr === 'auto' ? 4.2 : Math.max(3.2, Math.min(6, parseFloat(zoomAttr)));
  camera.position.copy(centreVec.clone().multiplyScalar(CAM_DISTANCE));
  camera.lookAt(0, 0, 0);

  let currentW = size.w;
  let currentH = size.h;
  const resizeObserver = new ResizeObserver(() => {
    const { w, h } = getSize();
    if (w === currentW && h === currentH) return;
    currentW = w;
    currentH = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });
  resizeObserver.observe(container);

  const clock = new THREE.Clock();
  let rafId = null;

  function updatePinLabels() {
    const tempVec = new THREE.Vector3();
    const { w, h } = getSize();
    markers.forEach((marker, i) => {
      tempVec.copy(marker.worldPos).applyMatrix4(globeGroup.matrixWorld);
      const facing = -tempVec.clone().sub(camera.position).normalize().dot(tempVec.clone().normalize());
      tempVec.project(camera);
      const el = labelEls[i];
      if (facing > 0.1 && tempVec.z < 1) {
        el.style.left    = `${(tempVec.x * 0.5 + 0.5) * w}px`;
        el.style.top     = `${(-tempVec.y * 0.5 + 0.5) * h}px`;
        el.style.opacity = Math.min(1, (facing - 0.1) * 4);
      } else {
        el.style.opacity = 0;
      }
    });
  }

  function animate() {
    const t = clock.getElapsedTime();

    markers.forEach((marker) => {
      const phase = (t * 0.7 + marker.phase / 4) % 1;
      marker.pulse.scale.setScalar(1 + phase * 0.8);
      marker.pulse.material.opacity = 0.7 * (1 - phase);
    });

    pulseParticles.forEach((particle) => {
      particle.progress += particle.speed;
      if (particle.progress > 1) particle.progress = 0;
      const idx     = Math.floor(particle.progress * (particle.points.length - 1));
      const nextIdx = Math.min(idx + 1, particle.points.length - 1);
      const localT  = (particle.progress * (particle.points.length - 1)) - idx;
      particle.mesh.position.lerpVectors(particle.points[idx], particle.points[nextIdx], localT);
      const fade = Math.sin(particle.progress * Math.PI);
      particle.mesh.material.opacity = fade;
      particle.mesh.scale.setScalar(0.8 + fade * 0.5);
    });

    stars.material.opacity = 0.55 + Math.sin(t * 0.5) * 0.08;
    updatePinLabels();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  const instance = {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.dispose();
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        if (obj.material) {
          Array.isArray(obj.material) ? obj.material.forEach((material) => material.dispose()) : obj.material.dispose();
        }
      });
      container.innerHTML = '';
      container.removeAttribute('data-globe-initialised');
    },
  };

  container._defenceGlobe = instance;
  return instance;
}


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// ACCORDION CSS //
function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// BASIC FORM VALIDATION //
function initBasicFormValidation() {
  const forms = document.querySelectorAll('[data-form-validate]');

  forms.forEach((form) => {
    const fields = form.querySelectorAll('[data-validate] input, [data-validate] textarea');
    const submitButtonDiv = form.querySelector('[data-submit]');
    const submitInput = submitButtonDiv.querySelector('input[type="submit"]');
    const formLoadTime = new Date().getTime();

    const validateField = (field) => {
      const parent = field.closest('[data-validate]');
      const minLength = field.getAttribute('min');
      const maxLength = field.getAttribute('max');
      const type = field.getAttribute('type');
      let isValid = true;

      if (field.value.trim() !== '') {
        parent.classList.add('is--filled');
      } else {
        parent.classList.remove('is--filled');
      }

      if (minLength && field.value.length < minLength) isValid = false;
      if (maxLength && field.value.length > maxLength) isValid = false;
      if (type === 'email' && !/\S+@\S+\.\S+/.test(field.value)) isValid = false;

      if (isValid) {
        parent.classList.remove('is--error');
        parent.classList.add('is--success');
      } else {
        parent.classList.remove('is--success');
        parent.classList.add('is--error');
      }

      return isValid;
    };

    const startLiveValidation = (field) => {
      field.addEventListener('input', () => validateField(field));
    };

    const validateAndStartLiveValidationForAll = () => {
      let allValid = true;
      let firstInvalidField = null;

      fields.forEach((field) => {
        const valid = validateField(field);
        if (!valid && !firstInvalidField) firstInvalidField = field;
        if (!valid) allValid = false;
        startLiveValidation(field);
      });

      if (firstInvalidField) firstInvalidField.focus();
      return allValid;
    };

    const isSpam = () => {
      const timeDifference = (new Date().getTime() - formLoadTime) / 1000;
      return timeDifference < 5;
    };

    submitButtonDiv.addEventListener('click', () => {
      if (validateAndStartLiveValidationForAll()) {
        if (isSpam()) { alert('Form submitted too quickly. Please try again.'); return; }
        submitInput.click();
      }
    });

    form.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        if (validateAndStartLiveValidationForAll()) {
          if (isSpam()) { alert('Form submitted too quickly. Please try again.'); return; }
          submitInput.click();
        }
      }
    });
  });
}

// IMAGE SCROLL EFFECT //
function initImageScrollEffect() {
  gsap.utils.toArray('.img:not(.no-para)').forEach((img) => {
    const isLoad = img.hasAttribute('data-load');

    gsap.fromTo(
      img,
      { autoAlpha: 0, scale: 1.05 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        ease: 'reveal',
        ...(isLoad ? {} : {
          scrollTrigger: {
            trigger: img,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        })
      }
    );

    gsap.to(img, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

// TEAM INTERACTIONS //
function initTeamInteractions() {
  const members        = document.querySelectorAll('[data-team-member]');
  const preview        = document.querySelector('[data-team-preview]');
  const previewImgEl   = preview?.querySelector('[data-team-preview-img]');
  const previewImg     = previewImgEl?.tagName === 'IMG' ? previewImgEl : previewImgEl?.querySelector('img');
  const previewName    = preview?.querySelector('[data-team-preview-name]');
  const previewRole    = preview?.querySelector('[data-team-preview-role]');

  const panelBg        = document.querySelector('[data-team-bg]');
  const panel          = document.querySelector('[data-team-panel]');
  const panelInner     = panel?.querySelector('[data-team-panel-inner]');
  const panelImg       = panel?.querySelector('[data-team-panel-img]');
  const panelName      = panel?.querySelector('[data-team-panel-name]');
  const panelRole      = panel?.querySelector('[data-team-panel-role]');
  const panelBioHead   = panel?.querySelector('[data-team-panel-bio-title]');
  const panelBioBody   = panel?.querySelector('[data-team-panel-bio-body]');
  const panelClose     = panel?.querySelector('[data-team-panel-close]');

  let hoverActive = null;
  let panelTl     = null;
  let isOpen      = false;

  // ── HOVER ──────────────────────────────────────────────────────────────────

  if (preview) {
    members.forEach(member => {
      member.addEventListener('mouseenter', () => {
        if (member === hoverActive) return;
        hoverActive = member;

        const { name, role } = member.dataset;
        const imgSrc = member.querySelector('img')?.src || '';
        const targets = [previewImgEl, previewName, previewRole].filter(Boolean);

        gsap.timeline()
          .to(targets, { scale: 0.92, opacity: 0, duration: 0.22, ease: 'osmo' })
          .call(() => {
            if (previewImg) { previewImg.srcset = ''; previewImg.src = imgSrc; }
            if (previewName) previewName.textContent = name || '';
            if (previewRole) previewRole.textContent = role || '';
          }, [], '-=0.04')
          .to(targets, { scale: 1, opacity: 1, duration: 0.4, ease: 'osmo' });
      });
    });
  }

  // ── OPEN ───────────────────────────────────────────────────────────────────

  if (panel) {
    members.forEach(member => {
      member.addEventListener('click', () => {
        const { name, role, bioHeading, bio } = member.dataset;
        if (panelImg)     panelImg.src             = member.querySelector('img')?.src || '';
        if (panelName)    panelName.textContent     = name       || '';
        if (panelRole)    panelRole.textContent     = role       || '';
        if (panelBioHead) panelBioHead.textContent  = bioHeading || '';
        if (panelBioBody) panelBioBody.textContent  = bio        || '';

        openPanel();
      });
    });

    function openPanel() {
      if (isOpen) return;
      isOpen = true;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.classList.add('panel-open');
      lenis.stop();

      const innerEls = [panelImg, panelName, panelRole, panelBioHead, panelBioBody].filter(Boolean);

      panelTl = gsap.timeline({ onReverseComplete: () => gsap.set(panel, { display: 'none' }) })
        .set(panel, { display: 'flex' });

      if (panelBg)         panelTl.fromTo(panelBg,    { opacity: 0 },                          { opacity: 1,  duration: 0.7, ease: 'smooth' }, 0);
      if (panelInner)      panelTl.fromTo(panelInner,  { xPercent: 100 },                       { xPercent: 0, duration: 0.9, ease: 'smooth' }, 0);
      if (innerEls.length) panelTl.fromTo(innerEls,    { opacity: 0, y: 20, filter: 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'smooth', stagger: 0.09 }, 0.25);
    }

    // ── CLOSE ────────────────────────────────────────────────────────────────

    function closePanel() {
      if (!isOpen) return;
      isOpen = false;
      document.body.classList.remove('panel-open');
      document.body.style.paddingRight = '';
      lenis.start();

      if (panelTl) panelTl.timeScale(1.2).reverse();
    }

    panelClose?.addEventListener('click', closePanel);
    panelBg?.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) closePanel();
    });
  }
}

// COPYRIGHT YEAR //
function initDynamicCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = currentYear;
  });
}

// SCRAMBLE TEXT CURSOR //
function initScrambleTextCursor() {
  const cursor = document.querySelector("[data-cursor]");
  const cursorTextTarget = document.querySelector("[data-cursor-text-target]");

  if (!cursor || !cursorTextTarget || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  let mouseX = 0;
  let mouseY = 0;
  let hasMouseMoved = false;
  let activeHoverItem = null;

  const scrambleCharacters = "XYZxy#&@0$€£";

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.4, ease: "power3.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.4, ease: "power3.out" });

  function updateCursor() {
    const hoverItem = document.elementFromPoint(mouseX, mouseY)?.closest("[data-cursor-hover]");
    const rect = cursor.getBoundingClientRect();

    const isHovering = !!hoverItem;
    const isEdge = rect.right >= window.innerWidth;
    const text = hoverItem?.getAttribute("data-cursor-text") || "";

    cursor.setAttribute("data-cursor", isHovering ? (isEdge ? "active-edge" : "active") : "");

    if (hoverItem !== activeHoverItem) {
      gsap.to(cursorTextTarget, {
        duration: 0.6,
        overwrite: "auto",
        scrambleText: {
          text: text,
          chars: scrambleCharacters,
          speed: 1.2
        }
      });

      activeHoverItem = hoverItem;
    }
  }

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    hasMouseMoved = true;

    xTo(mouseX);
    yTo(mouseY);

    requestAnimationFrame(updateCursor);
  });

  window.addEventListener("scroll", () => {
    if (!hasMouseMoved) return;
    requestAnimationFrame(updateCursor);
  }, { passive: true });
}

// FAQ TOGGLE //
function initFAQToggle() {
  const toggles = {
    employer: document.querySelector('.faq_toggle_inner.employer'),
    candidate: document.querySelector('.faq_toggle_inner.candidate'),
  };

  const panels = {
    employer: document.querySelector('.accordion-css.employer'),
    candidate: document.querySelector('.accordion-css.candidate'),
  };

  if (!toggles.employer || !toggles.candidate || !panels.employer || !panels.candidate) return;

  const getItems = (panel) => Array.from(panel.querySelectorAll(':scope > *'));

  let activeKey =
    toggles.employer.classList.contains('is-active') ? 'employer' :
    toggles.candidate.classList.contains('is-active') ? 'candidate' :
    'employer';

  let isAnimating = false;

  function setInitialState(key) {
    const showPanel = panels[key];
    const hidePanel = panels[key === 'employer' ? 'candidate' : 'employer'];

    gsap.set(showPanel, { display: 'block', autoAlpha: 1, height: 'auto' });
    gsap.set(hidePanel, { display: 'none', autoAlpha: 0 });
    gsap.set(getItems(showPanel), { autoAlpha: 1, y: 0 });
    gsap.set(getItems(hidePanel), { autoAlpha: 0, y: 12 });

    toggles.employer.classList.toggle('is-active', key === 'employer');
    toggles.candidate.classList.toggle('is-active', key === 'candidate');
  }

  setInitialState(activeKey);

  function switchTo(nextKey) {
    if (isAnimating || nextKey === activeKey) return;
    isAnimating = true;

    const prevKey = activeKey;
    const prevPanel = panels[prevKey];
    const nextPanel = panels[nextKey];
    const prevItems = getItems(prevPanel);
    const nextItems = getItems(nextPanel);

    toggles[prevKey].classList.remove('is-active');
    toggles[nextKey].classList.add('is-active');

    gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => { activeKey = nextKey; isAnimating = false; }
    })
      .to(prevItems, { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.03, clearProps: 'transform' })
      .set(prevPanel, { display: 'none', autoAlpha: 0 })
      .set(nextPanel, { display: 'block', autoAlpha: 1 })
      .set(nextItems, { autoAlpha: 0, y: 12 })
      .to(nextItems, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04 }, '+=0.02');
  }

  toggles.employer.addEventListener('click', () => switchTo('employer'));
  toggles.candidate.addEventListener('click', () => switchTo('candidate'));
}


function initButtonCharacterStagger() {
  const offsetIncrement = 0.01;
  const buttons = document.querySelectorAll('[data-button-animate-chars]');

  buttons.forEach(button => {
    const text = button.textContent;
    button.innerHTML = '';

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      if (char === ' ') {
        span.style.whiteSpace = 'pre';
      }

      button.appendChild(span);
    });
  });
}

function initLinkCharacterStagger() {
  const offsetIncrement = 0.01;
  const links = document.querySelectorAll('[data-link-animate-chars]');

  links.forEach(link => {
    const text = link.textContent;
    link.innerHTML = '';

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      if (char === ' ') {
        span.style.whiteSpace = 'pre';
      }

      link.appendChild(span);
    });
  });
}

// IMAGE SEQUENCE SCROLL //
function initImageSequenceScroll() {
  const wraps = document.querySelectorAll('[data-sequence-wrap]');

  wraps.forEach((wrap) => {
    // Prevent double-initializing
    if (wrap.dataset.sequenceInit === 'true') return;
    wrap.dataset.sequenceInit = 'true';

    const element = wrap.querySelector('[data-sequence-element]');
    const canvas = element && element.querySelector('[data-sequence-canvas]');
    if (!element || !canvas) return;

    // Data attributes and their fallbacks
    const frames = parseInt(canvas.dataset.frames, 10) || 1;
    const digits = parseInt(canvas.dataset.digits, 10) || 3;
    const indexStart = parseInt(canvas.dataset.indexStart, 10) || 1;
    const desktopSrc = canvas.dataset.desktopSrc || '';
    const mobileSrc = canvas.dataset.mobileSrc || desktopSrc;
    const staticSrc = canvas.dataset.staticSrc;
    const filetype = canvas.dataset.filetype || 'webp';
    const startTrigger = wrap.dataset.scrollStart || 'top top';
    const endTrigger = wrap.dataset.scrollEnd || 'bottom top';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const baseUrl = isMobile ? mobileSrc : desktopSrc;
    const lastIndex = indexStart + frames - 1;

    // Track last rendered scroll progress so we can redraw on resize
    let lastProgress = 0;

    // Canvas setup (size to the sticky element)
    const ctx = canvas.getContext('2d');
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    }
    resizeCanvas();

    // Image cache and loading queue
    const loaded = new Map();
    const queue = [];
    let processingQueue = false;
    let resizeTimer;

    // Draw helper (canvas equivalent of object-fit: cover)
    function drawCover(img) {
      if (!img) return;
      resizeCanvas();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
      const x = (canvasWidth - img.width * scale) / 2;
      const y = (canvasHeight - img.height * scale) / 2;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (loaded.size) render(lastProgress);
        ScrollTrigger.refresh();
      }, 200);
    });

    function pad(num) {
      return String(num).padStart(digits, '0');
    }

    function getUrl(i) {
      return `${baseUrl}frame-${pad(i)}.${filetype}`;
    }

    function loadFrame(i, onDone) {
      if (loaded.has(i) || i < indexStart || i > lastIndex) return;
      const img = new Image();
      img.src = getUrl(i);

      img.onload = () => {
        loaded.set(i, img);
        if (typeof onDone === 'function') onDone();
      };

      img.onerror = () => {
        console.warn('[ImageSequence] Failed to load frame', {
          index: i,
          url: getUrl(i),
          wrap: wrap
        });
      };
    }

    // Daybreak-style progressive loader (binary midpoint / "wave" fill)
    function processQueue() {
      if (processingQueue) return;
      const next = queue.shift();
      if (!next) return;
      processingQueue = true;
      const [a, b] = next;
      if (b - a <= 1) {
        processingQueue = false;
        processQueue();
        return;
      }
      const m = Math.floor((a + b) / 2);
      loadFrame(m, () => {
        queue.push([a, m], [m, b]);
        processingQueue = false;
        setTimeout(processQueue, 0);
      });
    }

    function startLoading() {
      loadFrame(indexStart, () => {
        drawImageAt(indexStart);
        loadFrame(lastIndex);
        queue.push([indexStart, lastIndex]);
        processQueue();
        ScrollTrigger.refresh();
      });
    }

    function findNearestLoaded(i) {
      for (let r = 1; r <= 10; r++) {
        if (loaded.has(i - r)) return i - r;
        if (loaded.has(i + r)) return i + r;
      }

      const keys = Array.from(loaded.keys());
      if (keys.length === 0) return null;
      let nearest = keys[0];
      let minDiff = Math.abs(i - nearest);
      for (const k of keys) {
        const diff = Math.abs(i - k);
        if (diff < minDiff) {
          nearest = k;
          minDiff = diff;
        }
      }
      return nearest;
    }

    function drawImageAt(i) {
      const img = loaded.get(i);
      if (!img) return;
      drawCover(img);
    }

    function render(progress) {
      const relative = progress * (frames - 1);
      const index = indexStart + Math.round(relative);
      if (loaded.has(index)) {
        drawImageAt(index);
      } else {
        const nearest = findNearestLoaded(index);
        if (nearest !== null) drawImageAt(nearest);
      }
    }

    // Reduced motion: draw a single static image (or first frame fallback)
    if (reduceMotion) {
      if (staticSrc) {
        const staticImage = new Image();
        staticImage.src = staticSrc;
        staticImage.onload = () => {
          drawCover(staticImage);
        };
        staticImage.onerror = () => {};
        return;
      }
      loadFrame(indexStart, () => {
        drawImageAt(indexStart);
      });
      return;
    }

    // Begin loading frames in the background
    startLoading();

    // Set up ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: startTrigger,
      end: endTrigger,
      scrub: true,
      onUpdate: (self) => {
        lastProgress = self.progress;
        render(self.progress);
      }
    });

    // Draw once immediately
    lastProgress = st.progress || 0;
    render(lastProgress);

  });
}

// HERO WRAP REVEAL //
function initHeroWrapReveal() {
  const wrap = document.querySelector('[hero-wrap]');
  if (!wrap) return;

  const allEls = [...wrap.querySelectorAll('[hero-fade], [hero-heading], [hero-body]')];
  if (!allEls.length) return;

  const rem          = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const ease         = 'osmo';
  const DURATION     = 0.85;
  const BASE_STAGGER = 0.14;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: wrap,
      start: 'top top',
      once: true,
    }
  });

  let offset = 0;

  allEls.forEach((el) => {
    if (el.hasAttribute('hero-fade')) {
      gsap.set(el, { opacity: 0, filter: 'blur(10px)', y: rem });
      tl.to(el, { opacity: 1, filter: 'blur(0px)', y: 0, duration: DURATION, ease }, offset);

    } else if (el.hasAttribute('hero-heading')) {
      const split = new SplitText(el, { type: 'words' });
      gsap.set(split.words, { opacity: 0, filter: 'blur(8px)', y: rem });
      tl.to(split.words, { opacity: 1, filter: 'blur(0px)', y: 0, duration: DURATION, ease, stagger: 0.06 }, offset);

    } else if (el.hasAttribute('hero-body')) {
      const split = new SplitText(el, { type: 'lines' });
      gsap.set(split.lines, { opacity: 0, filter: 'blur(8px)', y: rem });
      tl.to(split.lines, { opacity: 1, filter: 'blur(0px)', y: 0, duration: DURATION, ease, stagger: 0.08 }, offset);
    }

    offset += BASE_STAGGER;
  });
}

// SPLIT TEXT REVEAL //
function initSplitTextReveal() {
  document.querySelectorAll('[data-split]').forEach(el => {
    const type = el.getAttribute('data-split') || 'lines';
    if (!['chars', 'words', 'lines'].includes(type)) return;

    const split = new SplitText(el, { types: type });
    const items = split[type];
    if (!items.length) return;
    const isLine = type === 'lines';

    // Wrap each item in an overflow:hidden mask
    items.forEach(item => {
      const mask = document.createElement('div');
      mask.classList.add('split-mask');
      mask.style.cssText = `overflow:hidden;display:${isLine ? 'block' : 'inline-block'};`;
      item.parentNode.insertBefore(mask, item);
      mask.appendChild(item);
    });

    const stagger = type === 'chars' ? 0.025 : type === 'words' ? 0.06 : 0.1;

    gsap.fromTo(items,
      { yPercent: 100, opacity: 0, filter: 'blur(4px)' },
      {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'osmo',
        stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      }
    );
  });
}

// ELEMENT REVEAL //
function initReveal() {
  document.querySelectorAll('[data-reveal]').forEach(el => {
    const type = el.getAttribute('data-reveal') || 'up';

    const fromVars = {
      opacity: 0,
      filter: 'blur(6px)',
    };

    if (type === 'up')    { fromVars.yPercent = 30; }
    if (type === 'down')  { fromVars.yPercent = -30; }
    if (type === 'left')  { fromVars.xPercent = 15; }
    if (type === 'right') { fromVars.xPercent = -15; }

    gsap.fromTo(el, fromVars, {
      yPercent: 0,
      xPercent: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'osmo',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });
}

// SERVICES LIST ACTIVE STATE //
function initServList() {
  const rows = gsap.utils.toArray('[serv-row]');
  if (!rows.length) return;

  const items = gsap.utils.toArray('[serv-item]');
  const count = Math.min(rows.length, items.length);
  if (!count) return;

  gsap.set(rows, { opacity: 0.5 });

  let current = -1;

  function setActive(index) {
    if (index === current) return;
    if (current >= 0) gsap.to(rows[current], { opacity: 0.5, duration: 0.4, ease: 'osmo' });
    gsap.to(rows[index], { opacity: 1, duration: 0.4, ease: 'osmo' });
    current = index;
  }

  rows.slice(0, count).forEach((row, i) => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      setActive(i);
      if (lenis) {
        lenis.scrollTo(items[i], { duration: 1.1 });
      } else {
        items[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  items.slice(0, count).forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top top',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });
}

// SWIPER SLIDER //
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");
  if (!swiperSliderGroups.length) return;

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if (!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");
    const paginationEl = swiperGroup.querySelector(".swiper-pagination");

    const syncSlideState = (swiperInstance) => {
      swiperInstance.slides.forEach((slide, index) => {
        const isActive = index === swiperInstance.activeIndex;

        gsap.to(slide, {
          opacity: isActive ? 1 : 0.5,
          scale: isActive ? 1 : 0.95,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      });
    };

    new Swiper(swiperSliderWrap, {
      slidesPerView: 1,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      pagination: {
        el: paginationEl,
        type: 'bullets',
        clickable: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      on: {
        init(swiperInstance) {
          syncSlideState(swiperInstance);
        },
        slideChange(swiperInstance) {
          syncSlideState(swiperInstance);
        },
      },
    });
  });
}
