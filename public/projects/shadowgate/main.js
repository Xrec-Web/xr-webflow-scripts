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
  if (q('[data-sequence-wrap]'))         initImageSequenceScroll();
  if (q('.h-hero_grid'))                 initHeroTitleReveal();
  if (q('[data-split]'))                 initSplitTextReveal();
  if (q('[data-reveal]'))                initReveal();
  if (q('[serv-list]'))                  initServList();
  if (q('[data-globe]'))                 initDefenceGlobe(nextPage);
}

function destroyPageFunctions(container) {
  if (window.DefenceGlobe?.destroyAll) window.DefenceGlobe.destroyAll(container);
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

function initDefenceGlobe(container) {
  if (!window.DefenceGlobe?.initAll) return;
  window.DefenceGlobe.initAll(container);
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

// HERO TITLE REVEAL //
function initHeroTitleReveal() {
  const grid  = document.querySelector('.h-hero_grid');
  const title = grid?.querySelector('.h-hero_title');
  const bot   = grid?.querySelector('.h-hero_bot');

  if (!grid || !title || !bot) return;

  gsap.set([title, bot], { opacity: 0, filter: 'blur(12px)' });

  gsap.timeline({
    scrollTrigger: {
      trigger: grid,
      start: 'top 80%',
      end: 'bottom top',
      toggleActions: 'play none none reverse',
    }
  })
    .to(title, { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'relaxed' })
    .to(bot,   { opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'relaxed' }, '-=0.3');
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

// SERVICES LIST ACTIVE DOT //
function initServList() {
  const rows = gsap.utils.toArray('[serv-row]');
  if (!rows.length) return;

  const dots = rows.map(row => row.querySelector('[serv-dot]'));

  gsap.set(dots, { opacity: 0.2 });

  let current = -1;

  function setActive(index) {
    if (index === current) return;
    if (current >= 0) gsap.to(dots[current], { opacity: 0.2, duration: 0.4, ease: 'osmo' });
    gsap.to(dots[index], { opacity: 1, duration: 0.4, ease: 'osmo' });
    current = index;
  }

  const items = gsap.utils.toArray('[serv-item]');

  items.forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top top',
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    });
  });
}
