// Client: [Client Name]
// Project: Carel
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer, CustomEase);

CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create("osmo", "M0,0 C0.625,0.05 0,1 1,1");
CustomEase.create("energy", "M0,0 C0.32,0.72 0,1 1,1");
CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
CustomEase.create("punch", "M0,0 C0.19,1 0.22,1 1,1");
CustomEase.create("relaxed", "M0,0 C0.7,0 0.3,1 1,1");
CustomEase.create("expo.inOut", "M0,0 C0.87,0 0.13,1 1,1");
CustomEase.create("jump", "M0,0 C0.35,1.5 0.6,1 1,1");
CustomEase.create("pop", "M0,0 C0.17,0.67 0.3,1.33 1,1");

gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });

  initNav();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-reveal], [data-reveal-clip]')) initReveal();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-draw-svg]')) initDrawSVG();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// NAV //
function initNav() {
  const nav = document.querySelector(".nav_wrap");
  const ham = document.querySelector(".ham_wrap");
  const navBgMob = document.querySelector(".nav_bg_mob") || document.querySelector(".nav_bg_wrap");

  if (!nav) return;

  let menuOpen = false;
  let themeBeforeMenu = nav.classList.contains("u-theme-light") ? "u-theme-light" : "u-theme-dark";

  function setTheme(theme) {
    nav.classList.remove("u-theme-dark", "u-theme-light");
    nav.classList.add(theme);
  }

  let scrollY = 0;

  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockScroll() {
    const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || scrollY || 0;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    window.scrollTo(0, y);
  }

  function openMenu() {
    themeBeforeMenu = nav.classList.contains("u-theme-light") ? "u-theme-light" : "u-theme-dark";
    setTheme("u-theme-light");
    lockScroll();
    menuOpen = true;
  }

  function closeMenu() {
    unlockScroll();
    setTheme(themeBeforeMenu || "u-theme-dark");
    menuOpen = false;
  }

  if (!nav.classList.contains("u-theme-dark") && !nav.classList.contains("u-theme-light")) {
    nav.classList.add("u-theme-dark");
  }

  const defer = (fn) => queueMicrotask(fn);

  if (ham) {
    ham.addEventListener("click", () => {
      defer(() => {
        if (!menuOpen) openMenu();
        else closeMenu();
      });
    });
  }

  if (navBgMob) {
    navBgMob.addEventListener("click", () => {
      defer(() => {
        if (menuOpen) closeMenu();
      });
    });
  }
}

// IMAGE SCROLL EFFECT //
function initImageScrollEffect() {
  gsap.utils.toArray(".img").forEach((img) => {
    gsap.fromTo(img,
      { autoAlpha: 0, scale: 1.05 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        ease: "osmo",
        scrollTrigger: {
          trigger: img,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true
        }
      }
    );

    gsap.to(img, {
      yPercent: 20,
      ease: "none",
      scrollTrigger: {
        trigger: img,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });
}

// DRAW SVG //
function initDrawSVG() {
  document.querySelectorAll('[data-draw-svg]').forEach((svg) => {
    const paths = [...svg.querySelectorAll('path, circle, rect, ellipse, polygon, polyline, line')];
    if (!paths.length) return;

    // Store original fills and set initial state
    paths.forEach((path) => {
      const length = path.getTotalLength ? path.getTotalLength() : 0;
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        fillOpacity: 0,
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: svg,
        start: 'top 80%',
        once: true,
      }
    });

    // Draw stroke
    tl.to(paths, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'osmo',
      stagger: { amount: 0.3 },
    });

    // Fill in while stroke finishes
    tl.to(paths, {
      fillOpacity: 1,
      duration: 0.8,
      ease: 'osmo',
      stagger: { amount: 0.2 },
    }, '>-=0.5');

    // Float the parent .float-graphic after reveal, always a new direction
    tl.call(() => {
      const floatEl = svg.closest('.float-graphic') || svg.parentElement?.closest('.float-graphic');
      if (!floatEl) return;

      function floatNext(prevAngle) {
        let angle;
        do {
          angle = gsap.utils.random(0, 360);
        } while (Math.abs(angle - prevAngle) < 60 || Math.abs(angle - prevAngle) > 300);

        const rad = (angle * Math.PI) / 180;
        gsap.to(floatEl, {
          xPercent: Math.cos(rad) * 10,
          yPercent: Math.sin(rad) * 10,
          rotation: gsap.utils.random(-4, 4),
          duration: gsap.utils.random(3, 5),
          ease: 'relaxed',
          onComplete: () => floatNext(angle),
        });
      }

      floatNext(gsap.utils.random(0, 360));
    });
  });
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

// COPYRIGHT YEAR //
function initDynamicCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = currentYear;
  });
}

// REVEAL //
const splitConfig = {
  lines: { duration: 1.0, stagger: 0.08 },
  words: { duration: 0.8, stagger: 0.06 },
  chars: { duration: 0.6, stagger: 0.01 }
};

function hasRevealAncestor(el) {
  let parent = el.parentElement;
  while (parent) {
    if (parent.matches('[data-reveal], [data-reveal-clip]')) return true;
    parent = parent.parentElement;
  }
  return false;
}

function animateClipBatch(els, baseDelay) {
  const DURATION = 0.9;
  const STAGGER  = 0.1;
  els.forEach((el, i) => {
    const offset = i * STAGGER;
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION - offset, ease: 'reveal', delay: baseDelay + offset });
  });
}

function initReveal() {
  // Clip reveals
  const allClipEls  = [...document.querySelectorAll('[data-reveal-clip]')];
  const loadClips   = allClipEls.filter(el => el.hasAttribute('data-load'));
  const scrollClips = allClipEls.filter(el => !el.hasAttribute('data-load'));

  if (loadClips.length) {
    const roots    = loadClips.filter(el => !hasRevealAncestor(el));
    const children = loadClips.filter(el =>  hasRevealAncestor(el));
    animateClipBatch(roots, 0);
    animateClipBatch(children, 0.2);
  }

  if (scrollClips.length) {
    ScrollTrigger.batch(scrollClips, {
      start: 'clamp(top 80%)',
      once: true,
      onEnter: (batch) => {
        const roots    = batch.filter(el => !hasRevealAncestor(el));
        const children = batch.filter(el =>  hasRevealAncestor(el));
        animateClipBatch(roots, 0);
        animateClipBatch(children, 0.2);
      }
    });
  }

  // Split text reveals
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const isLoad   = el.hasAttribute('data-load');
    const isChild  = hasRevealAncestor(el);
    const type     = (el.dataset.reveal || 'lines').toLowerCase();
    const safeType = ['lines', 'words', 'chars'].includes(type) ? type : 'lines';

    const typesToSplit =
      safeType === 'lines' ? ['lines'] :
      safeType === 'words' ? ['lines', 'words'] :
      ['lines', 'words', 'chars'];

    SplitText.create(el, {
      type: typesToSplit.join(','),
      mask: safeType,
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
      onSplit: (instance) => {
        gsap.set(el, { opacity: 1 });
        const targets   = instance[safeType];
        const config    = splitConfig[safeType];
        const baseDelay = isChild ? 0.2 : 0;
        targets.forEach((target, i) => {
          const offset = i * config.stagger;
          gsap.from(target, {
            yPercent: 110,
            duration: config.duration - offset,
            ease: 'reveal',
            delay: baseDelay + offset,
            ...(isLoad ? {} : { scrollTrigger: { trigger: el, start: 'clamp(top 80%)', once: true } })
          });
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
      if (type === 'tel') {
        const digits = field.value.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) isValid = false;
      }

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