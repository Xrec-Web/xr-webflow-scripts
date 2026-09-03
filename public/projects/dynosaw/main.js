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
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-swiper-group]')) initSwiperSlider();
  if (document.querySelector('[data-logo-wall-cycle-init]')) initLogoWallCycle();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// FORM VALIDATION //
// Form:   data-form-validate
// Field:  data-validate wrapper around each input/textarea
//         min / max attributes drive length rules, type="email" the format rule
// Submit: data-submit wrapper around the real input[type="submit"]
// Classes applied to the wrapper: is--filled, is--success, is--error
function initBasicFormValidation() {
  const MIN_FILL_SECONDS = 5;   // anything faster is treated as a bot

  document.querySelectorAll('[data-form-validate]').forEach(form => {
    const fields = form.querySelectorAll('[data-validate] input, [data-validate] textarea');
    const submitButtonDiv = form.querySelector('[data-submit]');
    const submitInput = submitButtonDiv && submitButtonDiv.querySelector('input[type="submit"]');

    if (!submitButtonDiv || !submitInput) return;   // markup incomplete — leave the form alone

    const formLoadTime = Date.now();
    const liveFields = new WeakSet();   // guards against stacking input listeners

    function validateField(field) {
      const parent = field.closest('[data-validate]');
      const minLength = field.getAttribute('min');
      const maxLength = field.getAttribute('max');
      const type = field.getAttribute('type');
      const value = field.value.trim();
      let isValid = true;

      parent.classList.toggle('is--filled', value !== '');

      if (field.required && value === '') isValid = false;
      if (minLength && field.value.length < +minLength) isValid = false;
      if (maxLength && field.value.length > +maxLength) isValid = false;
      if (type === 'email' && !/\S+@\S+\.\S+/.test(field.value)) isValid = false;

      parent.classList.toggle('is--success', isValid);
      parent.classList.toggle('is--error', !isValid);

      return isValid;
    }

    function startLiveValidation(field) {
      if (liveFields.has(field)) return;
      liveFields.add(field);
      field.addEventListener('input', () => validateField(field));
    }

    function validateAll() {
      let allValid = true;
      let firstInvalid = null;

      fields.forEach(field => {
        const valid = validateField(field);
        if (!valid) {
          allValid = false;
          if (!firstInvalid) firstInvalid = field;
        }
        startLiveValidation(field);
      });

      if (firstInvalid) firstInvalid.focus();
      return allValid;
    }

    const isSpam = () => (Date.now() - formLoadTime) / 1000 < MIN_FILL_SECONDS;

    function trySubmit() {
      if (!validateAll()) return;
      if (isSpam()) {
        alert('Form submitted too quickly. Please try again.');
        return;
      }
      submitInput.click();
    }

    submitButtonDiv.addEventListener('click', trySubmit);

    form.addEventListener('keydown', event => {
      if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        trySubmit();
      }
    });
  });
}

// CSS ACCORDION //
// Wrapper: data-accordion-css-init
//          data-accordion-close-siblings="true" to auto-close the others
// Item:    data-accordion-status ("active" / "not-active")
// Trigger: data-accordion-toggle
function initAccordionCSS() {
  document.querySelectorAll('[data-accordion-css-init]').forEach(accordion => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', event => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');

      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach(sibling => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// SWIPER SLIDER //
// Group:   data-swiper-group
// Wrap:    data-swiper-wrap (the .swiper element)
// Nav:     data-swiper-prev / data-swiper-next
// Bullets: .swiper-pagination inside the group
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll('[data-swiper-group]');

  swiperSliderGroups.forEach(swiperGroup => {
    const swiperSliderWrap = swiperGroup.querySelector('[data-swiper-wrap]');
    if (!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector('[data-swiper-prev]');
    const nextButton = swiperGroup.querySelector('[data-swiper-next]');
    const paginationEl = swiperGroup.querySelector('.swiper-pagination');

    new Swiper(swiperSliderWrap, {
      slidesPerView: 1.25,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      breakpoints: {
        480: {
          slidesPerView: 1.8,
        },
        992: {
          slidesPerView: 3.5,
        }
      },
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      pagination: {
        el: paginationEl,
        type: 'bullets',
        clickable: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
    });
  });
}

// LOGO WALL CYCLE //
// Wrapper: data-logo-wall-cycle-init
//          data-logo-wall-shuffle="false" to keep the first visible set in DOM order
// List:    data-logo-wall-list
// Item:    data-logo-wall-item (hide with display:none to change the visible count per breakpoint)
// Slot:    data-logo-wall-target-parent (optional — defaults to the item itself)
// Logo:    data-logo-wall-target (the swapped element; extras beyond the visible count feed the pool)
function initLogoWallCycle() {
  const loopDelay = 1.5;   // pause between swaps
  const duration = 0.9;    // swap animation length

  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach(root => {
    const list = root.querySelector('[data-logo-wall-list]');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('[data-logo-wall-item]'));
    if (!items.length) return;

    const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false';
    const originalTargets = items
      .map(item => item.querySelector('[data-logo-wall-target]'))
      .filter(Boolean);

    if (!originalTargets.length) return;

    let visibleItems = [];
    let visibleCount = 0;
    let pool = [];
    let pattern = [];
    let patternIndex = 0;
    let inView = true;   // ScrollTrigger flips this — keeps a tab refocus from resuming an off-screen wall
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
      if (!visibleCount) return;

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
      patternIndex = 0;

      // clear anything a previous setup injected
      items.forEach(item => {
        item.querySelectorAll('[data-logo-wall-target]').forEach(old => old.remove());
      });

      pool = originalTargets.map(node => node.cloneNode(true));

      let front, rest;
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool);
        front = shuffledAll.slice(0, visibleCount);
        rest = shuffleArray(shuffledAll.slice(visibleCount));
      } else {
        front = pool.slice(0, visibleCount);
        rest = shuffleArray(pool.slice(visibleCount));
      }
      pool = front.concat(rest);

      for (let i = 0; i < visibleCount; i++) {
        const parent = visibleItems[i].querySelector('[data-logo-wall-target-parent]') || visibleItems[i];
        parent.appendChild(pool.shift());
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
      tl.call(swapNext);
      if (inView && !document.hidden) tl.play(); else tl.pause();
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length;
      if (nowCount !== visibleCount) {   // breakpoint changed the visible count — rebuild
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

      if (parent.querySelectorAll('[data-logo-wall-target]').length > 1) return;   // swap already mid-flight

      const current = parent.querySelector('[data-logo-wall-target]');
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

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => {
        inView = self.isActive;
        if (!tl) return;
        if (inView && !document.hidden) tl.play(); else tl.pause();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (!tl) return;
      if (document.hidden || !inView) tl.pause(); else tl.play();
    });
  });
}
