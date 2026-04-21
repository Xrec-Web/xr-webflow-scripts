// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer, CustomEase, ScrambleTextPlugin);

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
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('[data-globe-init]')) {
    fetch('https://xr-webflow-scripts.vercel.app/api/mapbox-token')
      .then(res => res.json())
      .then(data => initInteractiveGlobeMapbox(data.token));
  }
  if (document.querySelector('[data-team-member]')) initTeamInteractions();
  if (document.querySelector('[data-cursor]')) initScrambleTextCursor();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-button-animate-chars]')) initButtonCharacterStagger();
});


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

        const { name, role, img } = member.dataset;
        const targets = [previewImgEl, previewName, previewRole].filter(Boolean);

        gsap.timeline()
          .to(targets, { scale: 0.92, opacity: 0, duration: 0.22, ease: 'osmo' })
          .call(() => {
            if (previewImg) { previewImg.srcset = ''; previewImg.src = img || ''; }
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
        const { name, role, img, bioHeading, bio } = member.dataset;

        if (panelImg)     panelImg.src             = img        || '';
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
      document.body.classList.add('panel-open');
      lenis.stop();

      const innerEls = [panelImg, panelName, panelRole, panelBioHead, panelBioBody].filter(Boolean);

      panelTl = gsap.timeline({ onReverseComplete: () => gsap.set(panel, { display: 'none' }) })
        .set(panel, { display: 'flex' });

      if (panelBg)       panelTl.fromTo(panelBg,    { opacity: 0 },     { opacity: 1, duration: 0.4, ease: 'osmo' }, 0);
      if (panelInner)    panelTl.fromTo(panelInner,  { xPercent: 100 },  { xPercent: 0, duration: 0.5, ease: 'osmo' }, 0);
      if (innerEls.length) panelTl.fromTo(innerEls,  { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'osmo', stagger: 0.07 }, '-=0.25');
    }

    // ── CLOSE ────────────────────────────────────────────────────────────────

    function closePanel() {
      if (!isOpen) return;
      isOpen = false;
      document.body.classList.remove('panel-open');
      lenis.start();

      if (panelTl) panelTl.reverse();
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

// INTERACTIVE GLOBE (MAPBOX) //
function initInteractiveGlobeMapbox(mapboxToken) {
  const cfg = {
    mapboxToken,
    mapStyle: "mapbox://styles/osmo-supply/cmmw1zil7003e01s84w3h740n",
    center: [0, 20],
    zoom: 3,
    projection: "globe",
    autoRotate: true,
    secondsPerRevolution: 120,
    maxSpinZoom: 5,
    slowSpinZoom: 3,
    flyToDuration: 2000,
    flyToZoom: 5,
    globeOffsetX: -0.2,
    globeOffsetY: 0.25,
    mobile: {
      zoom: 2,
      flyToZoom: 2.5,
      globeOffsetX: 0,
      globeOffsetY: 0.5,
    },
    markers: [
      { id: "tindal",     lat: -14.5211, lng: 132.3781, name: "Tindal",     city: "Katherine, NT",    image: "", link: "" },
      { id: "alice",      lat: -23.6980, lng: 133.8807, name: "Alice Springs", city: "Alice Springs, NT", image: "", link: "" },
      { id: "woomera",    lat: -31.1558, lng: 136.8009, name: "Woomera",    city: "Woomera, SA",      image: "", link: "" },
      { id: "exmouth",    lat: -21.9344, lng: 114.1272, name: "Exmouth",    city: "Exmouth, WA",      image: "", link: "" },
      { id: "geraldton",  lat: -28.7774, lng: 114.6145, name: "Geraldton",  city: "Geraldton, WA",    image: "", link: "" },
      { id: "wagga",      lat: -35.1082, lng: 147.3598, name: "Wagga Wagga", city: "Wagga Wagga, NSW", image: "", link: "" },
      { id: "broome",     lat: -17.9614, lng: 122.2359, name: "Broome",     city: "Broome, WA",       image: "", link: "" },
    ],
  };

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmall = () => window.matchMedia("(max-width: 991px)").matches;
  const val = (key) => (isSmall() && cfg.mobile && cfg.mobile[key] !== undefined) ? cfg.mobile[key] : cfg[key];

  const wrapper = document.querySelector("[data-globe-init]");
  if (!wrapper || wrapper.dataset.globeInit === "initialized") return;
  if (typeof mapboxgl === "undefined") return;
  if (!cfg.mapboxToken) return;

  mapboxgl.accessToken = cfg.mapboxToken;

  const mapEl = wrapper.querySelector("[data-globe-map]");
  if (!mapEl) return;
  mapEl.id = "globe-map";

  const markers = readMarkers(wrapper);

  const firstMarker = markers.length ? markers[0] : null;

  const map = new mapboxgl.Map({
    container: mapEl.id,
    style: cfg.mapStyle,
    center: firstMarker ? [firstMarker.lng, firstMarker.lat] : cfg.center,
    zoom: firstMarker ? val("flyToZoom") : val("zoom"),
    projection: cfg.projection,
    attributionControl: false,
    cooperativeGestures: true,
  });

  map.addControl(new mapboxgl.AttributionControl({ compact: true }));
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

  const getPadding = (extraRight) => {
    const w = mapEl.offsetWidth;
    const h = mapEl.offsetHeight;
    const ox = val("globeOffsetX");
    const oy = val("globeOffsetY");
    return {
      top: Math.max(0, oy * h),
      bottom: Math.max(0, -oy * h),
      left: Math.max(0, ox * w),
      right: Math.max(0, -ox * w) + (extraRight || 0),
    };
  };

  map.on("load", () => {
    const infoEl = wrapper.querySelector("[data-globe-info]");
    const infoW = !isSmall() && infoEl && infoEl.offsetWidth > 0
      ? infoEl.offsetWidth + 24
      : 0;
    map.setPadding(getPadding(infoW));

    const pins = addPins(map, markers, wrapper);

    initSlider(wrapper, markers, map, pins);
    if (cfg.autoRotate && !reducedMotion) initSpin(map);
    initPanel(wrapper, map, getPadding);
    initResize(map, wrapper, getPadding);

    wrapper.dataset.globeInit = "initialized";
  });


  // Read markers — clone-based if cfg.markers exists, otherwise use HTML as-is
  function readMarkers(wrapper) {
    const list = wrapper.querySelector("[data-globe-list]");
    const items = Array.from(wrapper.querySelectorAll("[data-globe-item]"));

    if (list && items.length && cfg.markers && cfg.markers.length) {
      const tpl = items[0];
      items.forEach(el => el.remove());

      return cfg.markers.map((m, i) => {
        const clone = tpl.cloneNode(true);
        clone.setAttribute("data-globe-id", m.id || "loc-" + i);
        clone.setAttribute("data-globe-lat", m.lat);
        clone.setAttribute("data-globe-lng", m.lng);

        const img = clone.querySelector("[data-globe-item-image]");
        const city = clone.querySelector("[data-globe-item-city]");
        const name = clone.querySelector("[data-globe-item-name]");
        const link = clone.querySelector("[data-globe-item-link]");

        if (img) img.src = m.image || "";
        if (city) city.textContent = m.city || "";
        if (name) name.textContent = m.name || "";
        if (link) link.href = m.link || "#";

        list.appendChild(clone);

        return {
          id: m.id || "loc-" + i,
          lat: m.lat,
          lng: m.lng,
          name: m.name || "",
          city: m.city || "",
          image: m.image || "",
          link: m.link || "",
          element: clone,
        };
      });
    }

    if (items.length) {
      return items.map((el, i) => ({
        id: el.getAttribute("data-globe-id") || "loc-" + i,
        lat: parseFloat(el.getAttribute("data-globe-lat")) || 0,
        lng: parseFloat(el.getAttribute("data-globe-lng")) || 0,
        name: txt(el, "[data-globe-item-name]") || "Location " + (i + 1),
        city: txt(el, "[data-globe-item-city]") || "",
        image: attr(el, "[data-globe-item-image]", "src") || "",
        link: attr(el, "[data-globe-item-link]", "href") || "",
        element: el,
      }));
    }

    return [];
  }


  // Map pins
  function addPins(map, markers, wrapper) {
    const tpl = wrapper.querySelector("[data-globe-marker-template]");

    return markers.map(data => {
      let el;

      if (tpl) {
        el = tpl.cloneNode(true);
        el.removeAttribute("data-globe-marker-template");
      } else {
        el = document.createElement("div");
        el.className = "globe-marker";
        el.innerHTML = '<svg class="globe-marker__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
      }

      el.setAttribute("data-globe-marker", data.id);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([data.lng, data.lat])
        .addTo(map);

      return { marker, element: el, data };
    });
  }

  function setActive(pins, idx) {
    pins.forEach((p, i) => {
      const v = i === idx ? "true" : "false";
      p.element.setAttribute("data-active", v);
      if (p.data.element) p.data.element.setAttribute("data-active", v);
    });
  }


  // Slider
  function initSlider(wrapper, markers, map, pins) {
    const list = wrapper.querySelector("[data-globe-list]");
    const prevBtn = wrapper.querySelector("[data-globe-prev]");
    const nextBtn = wrapper.querySelector("[data-globe-next]");
    const counter = wrapper.querySelector("[data-globe-counter]");
    if (!list || !markers.length) return;

    let cur = 0;
    let flying = false;
    const total = markers.length;

    const count = () => {
      if (counter) counter.textContent = (cur + 1) + " / " + total;
    };

    const flyTo = (i) => {
      map.flyTo({
        center: [markers[i].lng, markers[i].lat],
        zoom: val("flyToZoom"),
        duration: cfg.flyToDuration,
        essential: true,
      });
    };

    const go = (i) => {
      i = ((i % total) + total) % total;
      if (i === cur && markers[i].element.getAttribute("data-active") === "true") return;

      cur = i;
      flying = true;

      markers[i].element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });

      setActive(pins, i);
      count();
      flyTo(i);

      setTimeout(() => { flying = false; }, cfg.flyToDuration + 200);
    };

    if (prevBtn) prevBtn.addEventListener("click", () => go(cur - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(cur + 1));

    const observer = new IntersectionObserver(entries => {
      if (flying) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio <= 0.5) return;
        const idx = markers.findIndex(m => m.element === entry.target);
        if (idx !== -1 && idx !== cur) {
          cur = idx;
          setActive(pins, idx);
          count();
          flyTo(idx);
        }
      });
    }, { root: list, threshold: 0.5 });

    markers.forEach(m => {
      if (m.element) observer.observe(m.element);
    });

    markers.forEach((m, i) => {
      if (m.element) {
        m.element.addEventListener("click", e => {
          if (e.target.closest("[data-globe-item-link]")) return;
          go(i);
        });
      }
    });

    pins.forEach((p, i) => {
      p.element.addEventListener("click", () => go(i));
    });

    list.setAttribute("tabindex", "0");
    list.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); go(cur - 1); }
    });

    setActive(pins, 0);
    count();
  }


  // Auto-rotate
  function initSpin(map) {
    let interacting = false;

    const spin = () => {
      const z = map.getZoom();
      if (interacting || z >= cfg.maxSpinZoom) return;

      let speed = 360 / cfg.secondsPerRevolution;
      if (z > cfg.slowSpinZoom) {
        speed *= (cfg.maxSpinZoom - z) / (cfg.maxSpinZoom - cfg.slowSpinZoom);
      }

      const c = map.getCenter();
      c.lng -= speed;

      map.easeTo({
        center: c,
        duration: 1000,
        easing: n => n,
      });
    };

    map.on("mousedown", () => { interacting = true; });
    map.on("touchstart", () => { interacting = true; });

    ["mouseup", "dragend", "pitchend", "rotateend", "touchend"].forEach(e =>
      map.on(e, () => { interacting = false; spin(); })
    );

    map.on("moveend", spin);
    spin();
  }


  // Panel toggle
  function initPanel(wrapper, map, getPadding) {
    const info = wrapper.querySelector("[data-globe-info]");
    const close = wrapper.querySelector("[data-globe-close]");
    const open = wrapper.querySelector("[data-globe-reopen]");
    if (!info) return;

    const sync = () => {
      const collapsed = wrapper.getAttribute("data-collapsed") === "true";
      const w = (!isSmall() && !collapsed) ? info.offsetWidth + 24 : 0;
      map.setPadding(getPadding(w));

      if (collapsed) {
        map.flyTo({
          center: cfg.center,
          zoom: val("zoom"),
          duration: cfg.flyToDuration,
          essential: true,
        });
      }
    };

    new MutationObserver(sync).observe(wrapper, {
      attributes: true,
      attributeFilter: ["data-collapsed"],
    });

    if (close) close.addEventListener("click", () => wrapper.setAttribute("data-collapsed", "true"));
    if (open) open.addEventListener("click", () => wrapper.setAttribute("data-collapsed", "false"));
  }


  // Resize
  function initResize(map, wrapper, getPadding) {
    const mql = window.matchMedia("(max-width: 991px)");
    const infoEl = wrapper.querySelector("[data-globe-info]");

    const apply = () => {
      map.resize();
      const collapsed = wrapper.getAttribute("data-collapsed") === "true";
      const w = (!mql.matches && infoEl && !collapsed) ? infoEl.offsetWidth + 24 : 0;
      map.setPadding(getPadding(w));
    };

    mql.addEventListener("change", apply);

    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(apply, 200);
    }, { passive: true });
  }


  // Helpers
  function txt(parent, sel) {
    const el = parent.querySelector(sel);
    return el ? el.textContent.trim() : "";
  }

  function attr(parent, sel, key) {
    const el = parent.querySelector(sel);
    return el ? el.getAttribute(key) : "";
  }

}

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
  const offsetIncrement = 0.01; // Transition offset increment in seconds
  const buttons = document.querySelectorAll('[data-button-animate-chars]');

  buttons.forEach(button => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ''; // Clear the original content

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      // Handle spaces explicitly
      if (char === ' ') {
        span.style.whiteSpace = 'pre'; // Preserve space width
      }

      button.appendChild(span);
    });
  });
}