/**
 * Australian Defence Network Globe
 * ---------------------------------
 * Exposes explicit init/destroy helpers for Barba-driven page lifecycles.
 *
 * WEBFLOW SETUP
 * -------------
 * 1. In Page Settings → Before </body>, add:
 *      <script type="module" src="YOUR_CDN/defence-globe.js"></script>
 *
 * 2. Add the container element wherever you need the globe:
 *      <div data-globe="defence-network" style="width:100%; height:600px;"></div>
 *
 * 3. From your page/app init, call:
 *      window.DefenceGlobe.initAll(container);
 *
 * OPTIONS (via data attributes)
 * ------------------------------
 *   data-globe-color     Hex colour, default "#547EA3"
 *   data-globe-locations JSON array of {name, lat, lng}
 *   data-globe-zoom      "auto" | number 3.2–6
 */

import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';
import * as topojsonMod from 'https://esm.sh/topojson-client@3';

const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const DEFAULT_LOCATIONS = [
  { name: 'Tindal',        lat: -14.5211, lng: 132.3783 },
  { name: 'Alice Springs', lat: -23.6980, lng: 133.8807 },
  { name: 'Woomera',       lat: -31.1999, lng: 136.8250 },
  { name: 'Exmouth',       lat: -21.9323, lng: 114.1278 },
  { name: 'Geraldton',     lat: -28.7744, lng: 114.6089 },
  { name: 'Wagga Wagga',   lat: -35.1082, lng: 147.3598 },
  { name: 'Broome',        lat: -17.9614, lng: 122.2359 },
];

const DEFAULT_COLOR    = '#547EA3';
const AUSTRALIA_CENTER = { lat: -25.0, lng: 133.0 };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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

function lighten(hexInt, amount = 0.3) {
  const r = Math.min(255, ((hexInt >> 16) & 255) + 255 * amount);
  const g = Math.min(255, ((hexInt >> 8)  & 255) + 255 * amount);
  const b = Math.min(255, ( hexInt        & 255) + 255 * amount);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}

function lngLatToVec3(lng, lat, radius) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── GLOBE INIT ──────────────────────────────────────────────────────────────

async function initGlobe(container, options = {}) {
  if (container.hasAttribute('data-globe-initialised')) return;
  container.setAttribute('data-globe-initialised', 'true');

  const accentHex = options.color || container.dataset.globeColor || DEFAULT_COLOR;
  let locations   = options.locations || DEFAULT_LOCATIONS;
  if (container.dataset.globeLocations) {
    try { locations = JSON.parse(container.dataset.globeLocations); }
    catch { console.warn('[DefenceGlobe] Invalid data-globe-locations JSON, using defaults.'); }
  }
  const zoomAttr = options.zoom || container.dataset.globeZoom || 'auto';

  const accent         = hexToRgbNorm(accentHex);
  const ACCENT_HEX     = accent.hex;
  const ACCENT_LIGHT   = lighten(ACCENT_HEX, 0.3);
  const ACCENT_RGB     = { r: accent.r, g: accent.g, b: accent.b };

  container.style.setProperty('--dg-accent', accentHex);
  const rgbStr = `${Math.round(accent.r*255)}, ${Math.round(accent.g*255)}, ${Math.round(accent.b*255)}`;
  container.style.setProperty('--dg-rule', `rgba(${rgbStr}, 0.35)`);

  // Build DOM structure
  const canvas     = Object.assign(document.createElement('canvas'), { className: 'dg-canvas' });
  const vignette   = Object.assign(document.createElement('div'),   { className: 'dg-vignette' });
  const labelLayer = Object.assign(document.createElement('div'),   { className: 'dg-pin-labels' });
  container.append(canvas, vignette, labelLayer);

  // Fetch world topology
  const topology = await fetch(WORLD_ATLAS_URL).then(r => r.json()).catch(() => null);

  // ── SCENE ──────────────────────────────────────────────────────────────────

  const getSize = () => ({ w: container.clientWidth || 1, h: container.clientHeight || 1 });
  const size    = getSize();
  const scene   = new THREE.Scene();

  const camera   = new THREE.PerspectiveCamera(35, size.w / size.h, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size.w, size.h, false);

  // ── GLOBE ──────────────────────────────────────────────────────────────────

  const GLOBE_RADIUS = 1.6;
  const globeGroup   = new THREE.Group();
  scene.add(globeGroup);

  globeGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96),
    new THREE.MeshBasicMaterial({ color: 0x081624 })
  ));

  // ── GRATICULE ──────────────────────────────────────────────────────────────

  const gratMat = new THREE.LineBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.22 });
  for (let lat = -60; lat <= 60; lat += 15) {
    const pts = [];
    for (let lng = -180; lng <= 180; lng += 2) pts.push(lngLatToVec3(lng, lat, GLOBE_RADIUS * 1.001));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }
  for (let lng = -180; lng < 180; lng += 15) {
    const pts = [];
    for (let lat = -85; lat <= 85; lat += 2) pts.push(lngLatToVec3(lng, lat, GLOBE_RADIUS * 1.001));
    globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
  }

  // ── COUNTRY BOUNDARIES ─────────────────────────────────────────────────────

  if (topology) {
    try {
      const countriesGeo = topojsonMod.feature(topology, topology.objects.countries);
      const lineMat      = new THREE.LineBasicMaterial({ color: ACCENT_HEX, transparent: true, opacity: 0.95 });
      const r            = GLOBE_RADIUS * 1.003;

      countriesGeo.features.forEach(({ geometry: geom }) => {
        if (!geom) return;
        const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
        polys.forEach(poly => poly.forEach(ring => {
          const points = [];
          for (let i = 0; i < ring.length - 1; i++) {
            const [lng1, lat1] = ring[i], [lng2, lat2] = ring[i + 1];
            const steps = Math.max(2, Math.ceil(Math.hypot(lng2 - lng1, lat2 - lat1)));
            for (let s = 0; s < steps; s++) {
              const t = s / steps;
              points.push(lngLatToVec3(lng1 + (lng2 - lng1) * t, lat1 + (lat2 - lat1) * t, r));
            }
          }
          const [lngEnd, latEnd] = ring[ring.length - 1];
          points.push(lngLatToVec3(lngEnd, latEnd, r));
          globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMat));
        }));
      });
    } catch (err) {
      console.warn('[DefenceGlobe] Country boundaries parse failed:', err);
    }
  }

  // ── ATMOSPHERE ─────────────────────────────────────────────────────────────

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

  // ── STARS ──────────────────────────────────────────────────────────────────

  const starCount     = 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r     = 80 + Math.random() * 40;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i*3+2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xaaccee, size: 0.4, transparent: true, opacity: 0.6, sizeAttenuation: true,
  }));
  scene.add(stars);

  // ── MARKERS ────────────────────────────────────────────────────────────────

  const markers = [];
  locations.forEach((loc) => {
    const pos    = lngLatToVec3(loc.lng, loc.lat, GLOBE_RADIUS * 1.004);
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

  // ── ARCS ───────────────────────────────────────────────────────────────────

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
  const seen        = new Set();
  markers.forEach((m, i) => {
    markers
      .map((other, j) => ({ j, d: i === j ? Infinity : m.worldPos.distanceTo(other.worldPos) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) { seen.add(key); connections.push([i, j]); }
      });
  });

  const arcs          = connections.map(([a, b]) => { const arc = createArc(markers[a].worldPos, markers[b].worldPos); globeGroup.add(arc.line); return arc; });
  const pulseParticles = arcs.map(arc => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 12, 12),
      new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT, transparent: true, opacity: 1 })
    );
    globeGroup.add(mesh);
    return { mesh, points: arc.points, progress: Math.random(), speed: 0.003 + Math.random() * 0.003 };
  });

  // ── LABELS ─────────────────────────────────────────────────────────────────

  const labelEls = markers.map(m => {
    const el = Object.assign(document.createElement('div'), { className: 'dg-pin-label', textContent: m.data.name });
    labelLayer.appendChild(el);
    return el;
  });

  // ── CAMERA ─────────────────────────────────────────────────────────────────

  let centreLat = AUSTRALIA_CENTER.lat, centreLng = AUSTRALIA_CENTER.lng;
  if (locations.length > 0) {
    centreLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
    centreLng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;
  }
  const centreVec    = lngLatToVec3(centreLng, centreLat, 1).normalize();
  const CAM_DISTANCE = zoomAttr === 'auto' ? 4.2 : Math.max(3.2, Math.min(6, parseFloat(zoomAttr)));
  camera.position.copy(centreVec.clone().multiplyScalar(CAM_DISTANCE));
  camera.lookAt(0, 0, 0);

  // ── CONTROLS ───────────────────────────────────────────────────────────────

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping  = true;
  controls.dampingFactor  = 0.08;
  controls.rotateSpeed    = 0.4;
  controls.enablePan      = false;
  controls.enableZoom     = true;
  controls.minDistance    = 3.2;
  controls.maxDistance    = 6;
  controls.autoRotate     = false;

  const sph = new THREE.Spherical().setFromVector3(camera.position);
  controls.minAzimuthAngle = sph.theta - Math.PI / 4;
  controls.maxAzimuthAngle = sph.theta + Math.PI / 4;
  controls.minPolarAngle   = Math.max(0.1,           sph.phi - Math.PI / 6);
  controls.maxPolarAngle   = Math.min(Math.PI - 0.1, sph.phi + Math.PI / 6);
  controls.target.set(0, 0, 0);
  controls.update();

  // ── RESIZE ─────────────────────────────────────────────────────────────────

  let currentW = size.w, currentH = size.h;
  const resizeObserver = new ResizeObserver(() => {
    const { w, h } = getSize();
    if (w === currentW && h === currentH) return;
    currentW = w; currentH = h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });
  resizeObserver.observe(container);

  // ── ANIMATE ────────────────────────────────────────────────────────────────

  const clock = new THREE.Clock();
  let rafId   = null;

  function updatePinLabels() {
    const tempVec    = new THREE.Vector3();
    const { w, h }  = getSize();
    markers.forEach((m, i) => {
      tempVec.copy(m.worldPos).applyMatrix4(globeGroup.matrixWorld);
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
    controls.update();

    markers.forEach(m => {
      const phase = (t * 0.7 + m.phase / 4) % 1;
      m.pulse.scale.setScalar(1 + phase * 0.8);
      m.pulse.material.opacity = 0.7 * (1 - phase);
    });

    pulseParticles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
      const idx    = Math.floor(p.progress * (p.points.length - 1));
      const nextIdx = Math.min(idx + 1, p.points.length - 1);
      const localT  = (p.progress * (p.points.length - 1)) - idx;
      p.mesh.position.lerpVectors(p.points[idx], p.points[nextIdx], localT);
      const fade = Math.sin(p.progress * Math.PI);
      p.mesh.material.opacity = fade;
      p.mesh.scale.setScalar(0.8 + fade * 0.5);
    });

    stars.material.opacity = 0.55 + Math.sin(t * 0.5) * 0.08;
    updatePinLabels();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }
  animate();

  // ── DESTROY ────────────────────────────────────────────────────────────────

  const instance = {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse(obj => {
        obj.geometry?.dispose();
        if (obj.material) {
          Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose();
        }
      });
      container.innerHTML = '';
      container.removeAttribute('data-globe-initialised');
    },
  };

  container._defenceGlobe = instance;
  return instance;
}

// ─── SCOPE HELPERS ───────────────────────────────────────────────────────────

function getGlobeElements(scope = document) {
  const elements = [];
  if (scope instanceof Element && scope.matches('[data-globe]')) elements.push(scope);
  if (scope.querySelectorAll) elements.push(...scope.querySelectorAll('[data-globe]'));
  return elements;
}

function destroyGlobe(container) {
  container._defenceGlobeObserver?.disconnect?.();
  delete container._defenceGlobeObserver;
  container._defenceGlobe?.destroy?.();
}

function initAll(scope = document, options = {}) {
  const { lazy = true, rootMargin = '200px', ...globeOptions } = options;

  getGlobeElements(scope).forEach((container) => {
    if (container.hasAttribute('data-globe-initialised')) return;

    if (!lazy || typeof IntersectionObserver === 'undefined') {
      initGlobe(container, globeOptions).catch(err => console.error('[DefenceGlobe] init failed:', err));
      return;
    }

    if (container._defenceGlobeObserver) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        obs.disconnect();
        delete container._defenceGlobeObserver;
        initGlobe(entry.target, globeOptions).catch(err => console.error('[DefenceGlobe] init failed:', err));
      });
    }, { rootMargin });

    container._defenceGlobeObserver = observer;
    observer.observe(container);
  });
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

window.DefenceGlobe = {
  init: initGlobe,
  initAll,
  destroy: destroyGlobe,
  destroyAll(scope = document) {
    getGlobeElements(scope).forEach(destroyGlobe);
  },
};
