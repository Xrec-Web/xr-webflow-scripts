// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer, CustomEase);

CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('osmo', 'M0,0 C0.625,0.05 0,1 1,1');
CustomEase.create('energy', 'M0,0 C0.32,0.72 0,1 1,1');
CustomEase.create('smooth', 'M0,0 C0.38,0.005 0.215,1 1,1');
CustomEase.create('punch', 'M0,0 C0.19,1 0.22,1 1,1');
CustomEase.create('relaxed', 'M0,0 C0.7,0 0.3,1 1,1');
CustomEase.create('expo.inOut', 'M0,0 C0.87,0 0.13,1 1,1');
CustomEase.create('jump', 'M0,0 C0.35,1.5 0.6,1 1,1');
CustomEase.create('pop', 'M0,0 C0.17,0.67 0.3,1.33 1,1');

const lenis = new Lenis({
  prevent: (node) => node.classList?.contains('swiper') || node.classList?.contains('swiper-wrapper') || node.classList?.contains('swiper-slide')
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-swiper-group]')) initSwiperSlider();
  if (document.querySelector('[data-reveal], [data-reveal-clip]')) initReveal();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// SWIPER SLIDER //
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll('[data-swiper-group]');

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector('[data-swiper-wrap]');
    if (!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector('[data-swiper-prev]');
    const nextButton = swiperGroup.querySelector('[data-swiper-next]');
    const numberEl = swiperGroup.querySelector('[swiper-number]');

    const TEXT_ATTRS = ['[swipe-text]', '[swipe-author-title]', '[swipe-author-company]'];
    const splitInstances = new Map();

    // Split all text elements once across all slides
    swiperSliderWrap.querySelectorAll(TEXT_ATTRS.join(',')).forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'line',
        autoSplit: true,
        onSplit: (inst) => {
          splitInstances.set(el, inst);
          gsap.set(inst.lines, { yPercent: 110 });
        }
      });
    });

    // Hide all imgs initially
    swiperSliderWrap.querySelectorAll('[swipe-img]').forEach((el) => gsap.set(el, { autoAlpha: 0 }));

    const isMobile = () => window.innerWidth < 768;

    const getVisibleSlides = () => isMobile()
      ? [...swiperSliderWrap.querySelectorAll('.swiper-slide-active')]
      : [...swiperSliderWrap.querySelectorAll('.swiper-slide-active, .swiper-slide-next')];

    const animateOut = (slides, onComplete) => {
      const tl = gsap.timeline({ onComplete });
      slides.forEach((slide) => {
        const img = slide.querySelector('[swipe-img]');
        if (img) {
          gsap.killTweensOf(img);
          tl.to(img, { autoAlpha: 0, duration: 0.5, ease: 'osmo' }, 0);
        }
        TEXT_ATTRS.forEach((attr, i) => {
          const el = slide.querySelector(attr);
          if (!el) return;
          const inst = splitInstances.get(el);
          if (!inst?.lines?.length) return;
          gsap.killTweensOf(inst.lines);
          tl.to(inst.lines, { yPercent: -110, duration: 0.5, ease: 'osmo', stagger: 0.02 }, i * 0.03);
        });
      });
      return tl;
    };

    const animateIn = (slides) => {
      slides.forEach((slide) => {
        const img = slide.querySelector('[swipe-img]');
        if (img) {
          gsap.killTweensOf(img);
          gsap.set(img, { autoAlpha: 0 });
          gsap.to(img, { autoAlpha: 1, duration: 0.8, ease: 'osmo' });
        }
        TEXT_ATTRS.forEach((attr, i) => {
          const el = slide.querySelector(attr);
          if (!el) return;
          const inst = splitInstances.get(el);
          if (!inst?.lines?.length) return;
          gsap.killTweensOf(inst.lines);
          gsap.set(inst.lines, { yPercent: 110 });
          inst.lines.forEach((line, j) => {
            const offset = j * 0.08;
            gsap.to(line, { yPercent: 0, duration: 1.0 - offset, ease: 'reveal', delay: i * 0.1 + offset });
          });
        });
      });
    };

    let prevSlides = [];
    let isAnimating = false;
    let autoplayTimer = null;

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 1,
      slidesPerGroup: 1,
      loop: true,
      breakpoints: {
        768: {
          slidesPerView: 'auto',
          slidesPerGroup: 2,
        },
      },
      speed: 0,
      grabCursor: true,
      on: {
        init() {
          prevSlides = getVisibleSlides();
          animateIn(prevSlides);
          updateNumber(this);
          scheduleNext();
        },
        slideChangeTransitionEnd() {
          prevSlides = getVisibleSlides();
          animateIn(prevSlides);
          updateNumber(swiper);
          scheduleNext();
        }
      }
    });

    function updateNumber(sw) {
      if (!numberEl) return;
      numberEl.textContent = isMobile() ? sw.realIndex + 1 : Math.floor(sw.realIndex / 2) + 1;
    }

    function scheduleNext() {
      clearTimeout(autoplayTimer);
      autoplayTimer = setTimeout(() => triggerTransition('next'), 5000);
    }

    function triggerTransition(direction) {
      if (isAnimating) return;
      isAnimating = true;
      clearTimeout(autoplayTimer);
      animateOut(prevSlides, () => {
        isAnimating = false;
        if (direction === 'next') swiper.slideNext();
        else swiper.slidePrev();
      });
    }

    if (nextButton) nextButton.addEventListener('click', () => triggerTransition('next'));
    if (prevButton) prevButton.addEventListener('click', () => triggerTransition('prev'));
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

// COPYRIGHT YEAR //
function initDynamicCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = currentYear;
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

// ACCORDION CSS //
function initAccordionCSS() {
  if (!document.querySelector('[data-accordion-css-init]')) return;

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