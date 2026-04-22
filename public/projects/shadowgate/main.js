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
if (document.querySelector('[data-team-member]')) initTeamInteractions();
  if (document.querySelector('[data-cursor]')) initScrambleTextCursor();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-button-animate-chars]')) initButtonCharacterStagger();
  if (document.querySelector('[trigger-animation]')) initTriggerAnimationButtons();
  if (document.querySelector('[data-sequence-wrap]')) initImageSequenceScroll();
  if (document.querySelector('.h-hero_title')) initHeroTitleReveal();
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

// TRIGGER ANIMATION BUTTONS //
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

      tl.to(graphic, { width: '200%', yPercent: -100, duration: 2.4, ease: 'relaxed' }, 0);

      if (fadeEl) {
        tl.to(fadeEl, { opacity: 0, filter: 'blur(6px)', duration: 2.4, ease: 'relaxed' }, 0);
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
    if (wrap.dataset.sequenceInit === 'true') return;
    wrap.dataset.sequenceInit = 'true';

    const element = wrap.querySelector('[data-sequence-element]');
    const canvas = element && element.querySelector('[data-sequence-canvas]');
    if (!element || !canvas) return;

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

    let lastProgress = 0;

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

    const loaded = new Map();
    const queue = [];
    let processingQueue = false;
    let resizeTimer;

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
      const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      return `${base}frame-${pad(i)}.${filetype}`;
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
        console.warn('[ImageSequence] Failed to load frame', { index: i, url: getUrl(i), wrap });
      };
    }

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
        if (diff < minDiff) { nearest = k; minDiff = diff; }
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

    if (reduceMotion) {
      if (staticSrc) {
        const staticImage = new Image();
        staticImage.src = staticSrc;
        staticImage.onload = () => { drawCover(staticImage); };
        return;
      }
      loadFrame(indexStart, () => { drawImageAt(indexStart); });
      return;
    }

    startLoading();

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

    lastProgress = st.progress || 0;
    render(lastProgress);
  });
}

// HERO TITLE REVEAL //
function initHeroTitleReveal() {
  const title = document.querySelector('.h-hero_title');
  const bot   = document.querySelector('.h-hero_bot');

  if (bot) gsap.set(bot, { opacity: 0, filter: 'blur(12px)' });

  if (title) {
    gsap.fromTo(title,
      { opacity: 0, filter: 'blur(12px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        ease: 'relaxed',
        scrollTrigger: {
          trigger: title,
          start: 'top 90%',
          end: 'top 10%',
          scrub: true,
          onLeave: () => {
            if (!bot) return;
            gsap.to(bot, { opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'relaxed' });
          },
          onEnterBack: () => {
            if (!bot) return;
            lenis.stop();
            gsap.to(bot, {
              opacity: 0,
              filter: 'blur(12px)',
              duration: 0.8,
              ease: 'relaxed',
              onComplete: () => lenis.start()
            });
          }
        }
      }
    );
  }
}