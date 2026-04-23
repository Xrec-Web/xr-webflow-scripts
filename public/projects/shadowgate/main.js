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
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('[data-team-member]')) initTeamInteractions();
  if (document.querySelector('[data-cursor]')) initScrambleTextCursor();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-button-animate-chars]')) initButtonCharacterStagger();
  if (document.querySelector('[trigger-animation]')) initTriggerAnimationButtons();
  if (document.querySelector('[data-sequence-wrap]')) initImageSequenceScroll();
  if (document.querySelector('.h-hero_grid')) initHeroTitleReveal();
  if (document.querySelector('[data-split]')) initSplitTextReveal();
  if (document.querySelector('[data-reveal]')) initReveal();
  if (document.querySelector('[serv-list]')) initServList();
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

// PICK LOCATION PAGE ANIMATION //
function initTriggerAnimationButtons() {
  const buttons  = document.querySelectorAll('[trigger-animation]');
  const graphic  = document.querySelector('[trigger-graphic]');
  const fadeEl   = document.querySelector('[fade-out]');
  if (!graphic) return;

  // Timeline positions (seconds):
  //  0.0  → width starts growing
  //  1.4  → width hits 125% → y-move begins
  //  2.3  → width hits 150% → fade-out begins
  //  3.5  → width reaches 200%

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const anchor = btn.tagName === 'A' ? btn : btn.closest('a');
      const dest   = anchor?.href || btn.getAttribute('href');
      if (!dest) return;

      const tl = gsap.timeline({ onComplete: () => { window.location.href = dest; } });

      tl.to(graphic, { width: '100%', height: '120%', duration: 1.8, ease: 'relaxed' }, 0);

      if (fadeEl) {
        tl.to(fadeEl, { opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'smooth' }, 0.2);
      }
    });
  });
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


// ─── DEFENCE NETWORK GLOBE ───────────────────────────────────────────────────

/**
 * Australian Defence Network Globe
 * ---------------------------------
 * Drop-in embeddable Three.js globe.
 *
 * USAGE
 * -----
 * 1. Add a container div to your HTML with the data attribute:
 *      <div data-globe="defence-network" style="width:100%; height:600px;"></div>
 *
 * 2. Include this script (defer it, or load at end of body):
 *      <script src="https://your-cdn.com/defence-globe.js" defer></script>
 *
 * 3. The script auto-initialises all matching containers on DOMContentLoaded.
 *    You can also call `window.DefenceGlobe.init(element, options)` manually.
 *
 * OPTIONS (via data attributes or init call)
 * ------------------------------------------
 *   data-globe-color     Hex colour string, default "#547EA3"
 *   data-globe-locations JSON array of {name, lat, lng}, overrides defaults
 *   data-globe-zoom      "auto" (default) | numeric distance (3.2–6)
 *
 * The container must have non-zero width & height (set via CSS).
 * The globe sizes to the container, not the viewport.
 */

(function () {
  'use strict';

  // ---------- DEFAULT CONFIG ----------
  const DEFAULT_LOCATIONS = [
    { name: 'Tindal',        lat: -14.5211, lng: 132.3783 },
    { name: 'Alice Springs', lat: -23.6980, lng: 133.8807 },
    { name: 'Woomera',       lat: -31.1999, lng: 136.8250 },
    { name: 'Exmouth',       lat: -21.9323, lng: 114.1278 },
    { name: 'Geraldton',     lat: -28.7744, lng: 114.6089 },
    { name: 'Wagga Wagga',   lat: -35.1082, lng: 147.3598 },
    { name: 'Broome',        lat: -17.9614, lng: 122.2359 },
  ];

  const DEFAULT_COLOR = '#547EA3';
  const AUSTRALIA_CENTER = { lat: -25.0, lng: 133.0 };

  // CDN URLs
  const THREE_URL = 'https://esm.sh/three@0.160.0';
  const ORBIT_URL = 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';
  const TOPOJSON_URL = 'https://esm.sh/topojson-client@3';
  const WORLD_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

  // ---------- HELPERS ----------
  function hexToRgbNorm(hex) {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean, 16);
    return {
      r: ((bigint >> 16) & 255) / 255,
      g: ((bigint >> 8) & 255) / 255,
      b: (bigint & 255) / 255,
      hex: parseInt(clean, 16),
    };
  }

  function lighten(hexInt, amount = 0.3) {
    const r = Math.min(255, ((hexInt >> 16) & 255) + 255 * amount);
    const g = Math.min(255, ((hexInt >> 8) & 255) + 255 * amount);
    const b = Math.min(255, (hexInt & 255) + 255 * amount);
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
  }

  function lngLatToVec3(THREE, lng, lat, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  // ---------- STYLE INJECTION (scoped to our containers) ----------
  const STYLE_ID = 'defence-globe-styles';
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `
      [data-globe-initialised] {
        position: relative;
        overflow: hidden;
        background: radial-gradient(ellipse at 50% 50%, #0a1a2e 0%, #02060a 70%);
      }
      [data-globe-initialised] .dg-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        cursor: grab;
      }
      [data-globe-initialised] .dg-canvas:active { cursor: grabbing; }
      [data-globe-initialised] .dg-vignette {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 10, 0.55) 100%);
      }
      [data-globe-initialised] .dg-pin-labels {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      [data-globe-initialised] .dg-pin-label {
        position: absolute;
        font-family: 'JetBrains Mono', 'SF Mono', 'Monaco', monospace;
        font-size: 10px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #e6f1ff;
        background: rgba(2, 6, 10, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        padding: 4px 10px;
        border: 1px solid var(--dg-rule, rgba(84, 126, 163, 0.35));
        border-left: 2px solid var(--dg-accent, #547EA3);
        white-space: nowrap;
        transform: translate(14px, -50%);
        transition: opacity 0.25s ease;
        pointer-events: none;
        opacity: 0;
      }
      [data-globe-initialised] .dg-pin-label::before {
        content: '';
        position: absolute;
        left: -14px;
        top: 50%;
        width: 12px;
        height: 1px;
        background: var(--dg-accent, #547EA3);
        transform: translateY(-0.5px);
      }
    `;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ---------- LAZY-LOAD FONT (optional, degrades to system mono) ----------
  function injectFont() {
    if (document.getElementById('dg-font')) return;
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = '';
    document.head.appendChild(preconnect2);
    const link = document.createElement('link');
    link.id = 'dg-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap';
    document.head.appendChild(link);
  }

  // ---------- MAIN ----------
  async function initGlobe(container, options = {}) {
    if (container.hasAttribute('data-globe-initialised')) return;
    container.setAttribute('data-globe-initialised', 'true');

    // Read options from data attributes, fall back to provided options, then defaults
    const accentHex = options.color || container.dataset.globeColor || DEFAULT_COLOR;
    let locations = options.locations || DEFAULT_LOCATIONS;
    if (container.dataset.globeLocations) {
      try { locations = JSON.parse(container.dataset.globeLocations); }
      catch (e) { console.warn('[DefenceGlobe] Invalid data-globe-locations JSON, using defaults.'); }
    }
    const zoomAttr = options.zoom || container.dataset.globeZoom || 'auto';

    const accent = hexToRgbNorm(accentHex);
    const ACCENT_HEX = accent.hex;
    const ACCENT_LIGHT_HEX = lighten(ACCENT_HEX, 0.3);
    const ACCENT_RGB = { r: accent.r, g: accent.g, b: accent.b };

    // set CSS variables on this container for labels
    container.style.setProperty('--dg-accent', accentHex);
    const rgbStr = `${Math.round(accent.r*255)}, ${Math.round(accent.g*255)}, ${Math.round(accent.b*255)}`;
    container.style.setProperty('--dg-rule', `rgba(${rgbStr}, 0.35)`);

    injectStyles();
    injectFont();

    // Build inner structure
    const canvas = document.createElement('canvas');
    canvas.className = 'dg-canvas';
    container.appendChild(canvas);

    const vignette = document.createElement('div');
    vignette.className = 'dg-vignette';
    container.appendChild(vignette);

    const labelLayer = document.createElement('div');
    labelLayer.className = 'dg-pin-labels';
    container.appendChild(labelLayer);

    // Load Three.js + OrbitControls + topojson
    const [THREE, { OrbitControls }, topojsonMod, topology] = await Promise.all([
      import(THREE_URL),
      import(ORBIT_URL),
      import(TOPOJSON_URL),
      fetch(WORLD_ATLAS_URL).then(r => r.json()).catch(() => null),
    ]);

    // ---------- SCENE ----------
    const scene = new THREE.Scene();
    const getSize = () => ({
      w: container.clientWidth || 1,
      h: container.clientHeight || 1,
    });
    const size = getSize();

    const camera = new THREE.PerspectiveCamera(35, size.w / size.h, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size.w, size.h, false);

    // ---------- GLOBE ----------
    const GLOBE_RADIUS = 1.6;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS, 96, 96),
      new THREE.MeshBasicMaterial({ color: 0x081624 })
    );
    globeGroup.add(globeMesh);

    // ---------- GRATICULE ----------
    const gratMat = new THREE.LineBasicMaterial({
      color: ACCENT_HEX,
      transparent: true,
      opacity: 0.22,
    });
    for (let lat = -60; lat <= 60; lat += 15) {
      const pts = [];
      for (let lng = -180; lng <= 180; lng += 2) {
        pts.push(lngLatToVec3(THREE, lng, lat, GLOBE_RADIUS * 1.001));
      }
      globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
    }
    for (let lng = -180; lng < 180; lng += 15) {
      const pts = [];
      for (let lat = -85; lat <= 85; lat += 2) {
        pts.push(lngLatToVec3(THREE, lng, lat, GLOBE_RADIUS * 1.001));
      }
      globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gratMat));
    }

    // ---------- COUNTRY BOUNDARIES ----------
    if (topology && topojsonMod) {
      try {
        const countriesGeo = topojsonMod.feature(topology, topology.objects.countries);
        const lineMat = new THREE.LineBasicMaterial({
          color: ACCENT_HEX,
          transparent: true,
          opacity: 0.95,
        });
        const r = GLOBE_RADIUS * 1.003;

        countriesGeo.features.forEach((feature) => {
          const geom = feature.geometry;
          if (!geom) return;
          const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
          polys.forEach((poly) => {
            poly.forEach((ring) => {
              const points = [];
              for (let i = 0; i < ring.length - 1; i++) {
                const [lng1, lat1] = ring[i];
                const [lng2, lat2] = ring[i + 1];
                const segLen = Math.hypot(lng2 - lng1, lat2 - lat1);
                const steps = Math.max(2, Math.ceil(segLen));
                for (let s = 0; s < steps; s++) {
                  const t = s / steps;
                  points.push(lngLatToVec3(THREE,
                    lng1 + (lng2 - lng1) * t,
                    lat1 + (lat2 - lat1) * t,
                    r
                  ));
                }
              }
              if (ring.length > 0) {
                const [lngEnd, latEnd] = ring[ring.length - 1];
                points.push(lngLatToVec3(THREE, lngEnd, latEnd, r));
              }
              globeGroup.add(new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                lineMat
              ));
            });
          });
        });
      } catch (err) {
        console.warn('[DefenceGlobe] Country boundaries parse failed:', err);
      }
    }

    // ---------- ATMOSPHERE ----------
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.06, 64, 64),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(ACCENT_RGB.r, ACCENT_RGB.g, ACCENT_RGB.b) } },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          varying vec3 vPositionNormal;
          void main() {
            float intensity = pow(1.0 + dot(vNormal, vPositionNormal), 3.5);
            gl_FragColor = vec4(uColor, 1.0) * intensity * 0.5;
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
      })
    );
    scene.add(atmosphere);

    // ---------- STARS ----------
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i*3+2] = r * Math.cos(phi);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xaaccee,
      size: 0.4,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    }));
    scene.add(stars);

    // ---------- MARKERS ----------
    const markers = [];
    locations.forEach((loc, i) => {
      const pos = lngLatToVec3(THREE, loc.lng, loc.lat, GLOBE_RADIUS * 1.004);
      const normal = pos.clone().normalize();

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 16, 16),
        new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT_HEX })
      );
      dot.position.copy(pos);
      globeGroup.add(dot);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.014, 0.018, 32),
        new THREE.MeshBasicMaterial({
          color: ACCENT_HEX,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        })
      );
      halo.position.copy(pos);
      halo.position.add(normal.clone().multiplyScalar(0.001));
      halo.lookAt(normal.clone().multiplyScalar(2));
      globeGroup.add(halo);

      const pulse = new THREE.Mesh(
        new THREE.RingGeometry(0.014, 0.016, 48),
        new THREE.MeshBasicMaterial({
          color: ACCENT_HEX,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        })
      );
      pulse.position.copy(pos);
      pulse.position.add(normal.clone().multiplyScalar(0.002));
      pulse.lookAt(normal.clone().multiplyScalar(2));
      globeGroup.add(pulse);

      markers.push({
        data: loc,
        worldPos: pos.clone(),
        normal, halo, pulse, dot,
        phase: Math.random() * Math.PI * 2,
        index: i,
      });
    });

    // ---------- ARCS ----------
    function createArc(start, end, heightFactor = 0.2) {
      const distance = start.distanceTo(end);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const chordMidLen = mid.length();
      mid.normalize().multiplyScalar(chordMidLen + distance * heightFactor);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const colors = [];
      for (let i = 0; i <= 64; i++) {
        const fade = Math.sin((i / 64) * Math.PI);
        colors.push(ACCENT_RGB.r * fade, ACCENT_RGB.g * fade, ACCENT_RGB.b * fade);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      return {
        line: new THREE.Line(geo, new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.6,
        })),
        points,
      };
    }

    // Build a sensible connection graph: connect every location to its 2 nearest neighbours
    const connections = [];
    const seen = new Set();
    markers.forEach((m, i) => {
      const dists = markers
        .map((other, j) => ({ j, d: i === j ? Infinity : m.worldPos.distanceTo(other.worldPos) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      dists.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          connections.push([i, j]);
        }
      });
    });

    const arcs = [];
    connections.forEach(([a, b]) => {
      const arcData = createArc(markers[a].worldPos, markers[b].worldPos, 0.2);
      globeGroup.add(arcData.line);
      arcs.push(arcData);
    });

    const pulseParticles = [];
    arcs.forEach((arc) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 12, 12),
        new THREE.MeshBasicMaterial({ color: ACCENT_LIGHT_HEX, transparent: true, opacity: 1 })
      );
      globeGroup.add(mesh);
      pulseParticles.push({
        mesh,
        points: arc.points,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.003,
      });
    });

    // ---------- LABELS ----------
    const labelEls = markers.map((m) => {
      const el = document.createElement('div');
      el.className = 'dg-pin-label';
      el.textContent = m.data.name;
      labelLayer.appendChild(el);
      return el;
    });

    // ---------- CAMERA ----------
    // Aim camera at the centroid of the supplied locations (falls back to Australia centre).
    let centreLat = 0, centreLng = 0;
    locations.forEach((l) => { centreLat += l.lat; centreLng += l.lng; });
    if (locations.length > 0) {
      centreLat /= locations.length;
      centreLng /= locations.length;
    } else {
      centreLat = AUSTRALIA_CENTER.lat;
      centreLng = AUSTRALIA_CENTER.lng;
    }
    const centreVec = lngLatToVec3(THREE, centreLng, centreLat, 1).normalize();

    const CAM_DISTANCE = zoomAttr === 'auto' ? 4.2 : Math.max(3.2, Math.min(6, parseFloat(zoomAttr)));
    camera.position.copy(centreVec.clone().multiplyScalar(CAM_DISTANCE));
    camera.lookAt(0, 0, 0);

    // ---------- CONTROLS ----------
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.4;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 3.2;
    controls.maxDistance = 6;
    controls.autoRotate = false;

    const sph = new THREE.Spherical().setFromVector3(camera.position);
    controls.minAzimuthAngle = sph.theta - Math.PI / 4;
    controls.maxAzimuthAngle = sph.theta + Math.PI / 4;
    controls.minPolarAngle = Math.max(0.1, sph.phi - Math.PI / 6);
    controls.maxPolarAngle = Math.min(Math.PI - 0.1, sph.phi + Math.PI / 6);
    controls.target.set(0, 0, 0);
    controls.update();

    // ---------- RESIZE (container-based, not viewport) ----------
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

    // ---------- ANIMATE ----------
    const clock = new THREE.Clock();
    let rafId = null;

    function updatePinLabels() {
      const tempVec = new THREE.Vector3();
      const { w, h } = getSize();
      markers.forEach((m, i) => {
        tempVec.copy(m.worldPos).applyMatrix4(globeGroup.matrixWorld);
        const camToMarker = tempVec.clone().sub(camera.position).normalize();
        const markerNormal = tempVec.clone().normalize();
        const facing = -camToMarker.dot(markerNormal);
        tempVec.project(camera);
        const x = (tempVec.x * 0.5 + 0.5) * w;
        const y = (-tempVec.y * 0.5 + 0.5) * h;
        const el = labelEls[i];
        if (facing > 0.1 && tempVec.z < 1) {
          el.style.left = x + 'px';
          el.style.top = y + 'px';
          el.style.opacity = Math.min(1, (facing - 0.1) * 4);
        } else {
          el.style.opacity = 0;
        }
      });
    }

    function animate() {
      const t = clock.getElapsedTime();
      controls.update();

      markers.forEach((m) => {
        const pulsePhase = (t * 0.7 + m.phase / 4) % 1;
        m.pulse.scale.setScalar(1 + pulsePhase * 0.8);
        m.pulse.material.opacity = 0.7 * (1 - pulsePhase);
      });

      pulseParticles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const idx = Math.floor(p.progress * (p.points.length - 1));
        const nextIdx = Math.min(idx + 1, p.points.length - 1);
        const localT = (p.progress * (p.points.length - 1)) - idx;
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

    // ---------- DESTROY API ----------
    const instance = {
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        controls.dispose();
        renderer.dispose();
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        });
        container.innerHTML = '';
        container.removeAttribute('data-globe-initialised');
      },
    };

    // store instance on element for manual access
    container._defenceGlobe = instance;
    return instance;
  }

  // ---------- AUTO-INIT ----------
  function autoInit() {
    const containers = document.querySelectorAll('[data-globe]');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        initGlobe(entry.target).catch(err => console.error('[DefenceGlobe] init failed:', err));
      });
    }, { rootMargin: '200px' });

    containers.forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  // ---------- PUBLIC API ----------
  window.DefenceGlobe = {
    init: initGlobe,
    destroy(element) {
      if (element._defenceGlobe) element._defenceGlobe.destroy();
    },
  };

})();