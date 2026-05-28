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

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-twostep-nav]')) initTwostepScalingNavigation();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('.img')) initImageScrollEffect();
  if (document.querySelector('[data-reveal], [data-reveal-fade]')) initReveal();
  if (document.querySelector('[data-hero-parallax]')) initParallax();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// EXAMPLE //
function initTwostepScalingNavigation() {
  const navElement = document.querySelector("[data-twostep-nav]")
  const navStatusEl = document.querySelector("[data-nav-status]");
  
  if (!navElement || !navStatusEl) return;
  
  const setNavStatus = (status) => {
    navStatusEl.setAttribute("data-nav-status", status);
  };

  const isActive = () => navStatusEl.getAttribute("data-nav-status") === "active";

  const openNav = () => {
    setNavStatus("active");
    // If you use Lenis, you could pause the scroll here:
    // Lenis.stop?.();
  };

  const closeNav = () => {
    setNavStatus("not-active");
    // If you use Lenis, you could resume scroll here:
    // Lenis.start?.();
  };

  const toggleNav = () => (isActive() ? closeNav() : openNav());

  // Toggle buttons
  document.querySelectorAll('[data-nav-toggle="toggle"]').forEach((btn) => {
    btn.addEventListener("click", toggleNav);
  });

  // Close buttons
  document.querySelectorAll('[data-nav-toggle="close"]').forEach((btn) => {
    btn.addEventListener("click", closeNav);
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isActive()) closeNav();
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

// FAQ ACCORDION //
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

// HERO PARALLAX //
function initParallax() {
  document.querySelectorAll('[data-hero-parallax]').forEach(el => {
    const inner = el.querySelector('[data-hero-parallax-inner]');
    const dark  = el.querySelector('[data-hero-parallax-dark]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });

    if (inner) tl.to(inner, { yPercent: 25, ease: 'linear' });
    if (dark)  tl.to(dark,  { opacity: 0.7, ease: 'linear' }, '<');
  });
}

// TEXT SCROLL //
const splitConfig = {
  lines: { duration: 1.0, stagger: 0.08 },
  words: { duration: 0.8, stagger: 0.06 },
  chars: { duration: 0.6, stagger: 0.01 }
};

function hasRevealAncestor(el) {
  let parent = el.parentElement;
  while (parent) {
    if (parent.matches('[data-reveal], [data-reveal-fade]')) return true;
    parent = parent.parentElement;
  }
  return false;
}

function getLoadOrder(el) {
  if (!el.hasAttribute('data-load')) return null;
  const n = parseFloat(el.getAttribute('data-load'));
  return Number.isFinite(n) ? n : 0;
}

function effectiveLoadOrder(el) {
  let o = getLoadOrder(el);
  if (o !== null) return o;
  let parent = el.parentElement;
  while (parent) {
    if (parent.matches('[data-reveal-fade]')) {
      o = getLoadOrder(parent);
      if (o !== null) return o;
    }
    parent = parent.parentElement;
  }
  return null;
}

function animateFadeBatch(els, baseDelay) {
  const DURATION = 0.9;
  const STAGGER  = 0.1;
  els.forEach((el, i) => {
    const offset = i * STAGGER;
    gsap.to(el, {
      y: 0,
      filter: 'blur(0px)',
      opacity: 1,
      duration: DURATION - offset,
      ease: 'reveal',
      delay: baseDelay + offset
    });
  });
}

function initReveal() {
  const GROUP_GAP = 0.3;

  // Fade reveals
  const allFadeEls  = [...document.querySelectorAll('[data-reveal-fade]')];
  const allRevealEls = [...document.querySelectorAll('[data-reveal]')];
  const isLoadFade  = (el) => effectiveLoadOrder(el) !== null;
  const loadFades   = allFadeEls.filter(isLoadFade);
  const scrollFades = allFadeEls.filter(el => !isLoadFade(el));

  // Build a shared order → delay map from every element participating in the load sequence
  const orderSet = new Set();
  [...allFadeEls, ...allRevealEls].forEach(el => {
    const o = effectiveLoadOrder(el);
    if (o !== null) orderSet.add(o);
  });
  const sortedOrders = [...orderSet].sort((a, b) => a - b);
  const orderDelay = new Map();
  sortedOrders.forEach((o, i) => orderDelay.set(o, i * GROUP_GAP));

  if (allFadeEls.length) {
    gsap.set(allFadeEls, { y: 24, filter: 'blur(10px)', opacity: 0 });
  }

  if (loadFades.length) {
    const grouped = new Map();
    loadFades.forEach(el => {
      const o = effectiveLoadOrder(el);
      if (!grouped.has(o)) grouped.set(o, []);
      grouped.get(o).push(el);
    });
    [...grouped.keys()].sort((a, b) => a - b).forEach(o => {
      const group    = grouped.get(o);
      const base     = orderDelay.get(o) ?? 0;
      const roots    = group.filter(el => !hasRevealAncestor(el));
      const children = group.filter(el =>  hasRevealAncestor(el));
      animateFadeBatch(roots, base);
      animateFadeBatch(children, base + 0.2);
    });
  }

  if (scrollFades.length) {
    ScrollTrigger.batch(scrollFades, {
      start: 'clamp(top 80%)',
      once: true,
      onEnter: (batch) => {
        const roots    = batch.filter(el => !hasRevealAncestor(el));
        const children = batch.filter(el =>  hasRevealAncestor(el));
        animateFadeBatch(roots, 0);
        animateFadeBatch(children, 0.2);
      }
    });
  }

  // Split text reveals
  const FADE_CHILD_STAGGER = 0.15;

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const fadeParent = el.parentElement?.closest('[data-reveal-fade]');
    const order      = effectiveLoadOrder(el);
    const isLoad     = order !== null;
    const groupOffset = isLoad ? (orderDelay.get(order) ?? 0) : 0;
    const isChild    = hasRevealAncestor(el);
    const type       = (el.dataset.reveal || 'lines').toLowerCase();
    const safeType   = ['lines', 'words', 'chars'].includes(type) ? type : 'lines';

    const childIdx = fadeParent
      ? [...fadeParent.querySelectorAll('[data-reveal]')].indexOf(el)
      : 0;

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
        const baseDelay = (fadeParent
          ? 0.2 + childIdx * FADE_CHILD_STAGGER
          : isChild ? 0.2 : 0) + groupOffset;
        targets.forEach((target, i) => {
          const offset = i * config.stagger;
          gsap.from(target, {
            yPercent: 110,
            duration: config.duration - offset,
            ease: 'reveal',
            delay: baseDelay + offset,
            ...(isLoad ? {} : { scrollTrigger: { trigger: fadeParent || el, start: 'clamp(top 80%)', once: true } })
          });
        });
      }
    });
  });
}