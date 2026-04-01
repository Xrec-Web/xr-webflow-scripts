// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase);

CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1');

// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);

// Refresh ScrollTrigger whenever page height changes (filters, dynamic content, etc.)
let heightRefreshTimer;

function scheduleRefresh(delay = 150) {
  clearTimeout(heightRefreshTimer);
  heightRefreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay);
}

// Catches height changes from filters or any layout shift
const bodyHeightObserver = new ResizeObserver(scheduleRefresh);
bodyHeightObserver.observe(document.documentElement);

// Catches dummy items being removed/replaced by CMS scripts on load
const domMutationObserver = new MutationObserver(() => scheduleRefresh(200));
domMutationObserver.observe(document.body, { childList: true, subtree: true });

// Once everything (including CMS scripts) has finished, do a final refresh
// and stop watching DOM mutations to avoid ongoing overhead
window.addEventListener('load', () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
    domMutationObserver.disconnect();
  }, 500);
});


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[filter-list="categories"]')) initFilters('categories');
  if (document.querySelector('[data-testimonial-wrap]')) initLineRevealTestimonials();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('.nav_wrap')) initNav();
  if (document.querySelector('.img')) initImageScrollEffect();
  if (document.querySelector('[data-hero-parallax], [data-footer-parallax]')) initParallax();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
});

// ─── FUNCTIONS ───────────────────────────────────────────────────────────────
// SCROLL SPLIT TEXT + IMG REVEAL //
const splitConfig = {
  lines: { duration: 1.0, stagger: 0.08 },
  words: { duration: 0.8, stagger: 0.06 },
  chars: { duration: 0.6, stagger: 0.01 }
};

// Returns true if any ancestor also carries a reveal attribute
function hasRevealAncestor(el) {
  let parent = el.parentElement;
  while (parent) { 
    if (parent.matches('[data-reveal], [data-reveal-clip]')) return true;
    parent = parent.parentElement;
  }
  return false;
}

// TEXT + CLIP REVEAL //
function initMaskTextScrollReveal() {
  ScrollTrigger.batch('[data-reveal-clip]:not([data-reveal-load])', {
    start: 'clamp(top 80%)',
    once: true,
    onEnter: (batch) => {
      const DURATION = 0.9;
      const STAGGER  = 0.1;
      const roots    = batch.filter(el => !hasRevealAncestor(el));
      const children = batch.filter(el =>  hasRevealAncestor(el));
      const animateClipBatch = (els, baseDelay) => {
        els.forEach((el, i) => {
          const offset = i * STAGGER;
          gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION - offset, ease: 'reveal', delay: baseDelay + offset });
        });
      };
      animateClipBatch(roots, 0);
      animateClipBatch(children, 0.2);
    }
  });

  document.querySelectorAll('[data-reveal]:not([data-reveal-load])').forEach((el) => {
    const isChild = hasRevealAncestor(el);
    const type = (el.dataset.reveal || 'lines').toLowerCase();
    const safeType = ['lines', 'words', 'chars'].includes(type) ? type : 'lines';

    const typesToSplit =
      safeType === 'lines' ? ['lines'] :
      safeType === 'words' ? ['lines', 'words'] :
      ['lines', 'words', 'chars'];

    SplitText.create(el, {
      type: typesToSplit.join(','),
      mask: 'lines',
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
      onSplit: (instance) => {
        gsap.set(el, { opacity: 1 });
        const targets = instance[safeType];
        const config = splitConfig[safeType];

        const baseDelay = isChild ? 0.2 : 0;
        targets.forEach((target, i) => {
          const offset = i * config.stagger;
          gsap.from(target, {
            yPercent: 110,
            duration: config.duration - offset,
            ease: 'reveal',
            delay: baseDelay + offset,
            scrollTrigger: {
              trigger: el,
              start: 'clamp(top 80%)',
              once: true
            }
          });
        });
      }
    });
  });
}

// LOAD REVEAL (hero elements) //
function initLoadReveal() {
  const CLIP_DURATION = 0.9;
  const CLIP_STAGGER  = 0.1;
  const BASE_DELAY    = 0.15;

  // Clip-style: [data-reveal-load] without [data-reveal]
  const clipEls = [...document.querySelectorAll('[data-reveal-load]:not([data-reveal])')];
  clipEls.forEach((el, i) => {
    const offset = i * CLIP_STAGGER;
    const delay  = BASE_DELAY + (hasRevealAncestor(el) ? 0.2 : 0) + offset;
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: CLIP_DURATION - offset, ease: 'reveal', delay });
  });

  // Text: [data-reveal-load][data-reveal]
  document.querySelectorAll('[data-reveal-load][data-reveal]').forEach((el) => {
    const isChild  = hasRevealAncestor(el);
    const type     = (el.dataset.reveal || 'lines').toLowerCase();
    const safeType = ['lines', 'words', 'chars'].includes(type) ? type : 'lines';
    const typesToSplit = safeType === 'lines' ? ['lines'] : safeType === 'words' ? ['lines', 'words'] : ['lines', 'words', 'chars'];

    SplitText.create(el, {
      type: typesToSplit.join(','),
      mask: 'lines',
      autoSplit: true,
      linesClass: 'line',
      wordsClass: 'word',
      charsClass: 'letter',
      onSplit: (instance) => {
        gsap.set(el, { opacity: 1 });
        const targets   = instance[safeType];
        const config    = splitConfig[safeType];
        const baseDelay = BASE_DELAY + (isChild ? 0.2 : 0);
        targets.forEach((target, i) => {
          const offset = i * config.stagger;
          gsap.from(target, { yPercent: 110, duration: config.duration - offset, ease: 'reveal', delay: baseDelay + offset });
        });
      }
    });
  });
}

function initLineRevealTestimonials() {
  const wraps = document.querySelectorAll("[data-testimonial-wrap]");
  if (!wraps.length) return;

  const imageClipHidden = "circle(0% at 50% 50%)";
  const imageClipVisible = "circle(50% at 50% 50%)";
  
  wraps.forEach((wrap) => {
    const list = wrap.querySelector("[data-testimonial-list]");
    if (!list) return;

    const items = Array.from(list.querySelectorAll("[data-testimonial-item]"));
    if (!items.length) return;

    const btnPrev = wrap.querySelector("[data-prev]");
    const btnNext = wrap.querySelector("[data-next]");
    const elCurrent = wrap.querySelector("[data-current]");
    const elTotal = wrap.querySelector("[data-total]");

    if (elTotal) elTotal.textContent = String(items.length);

    let activeIndex = items.findIndex((el) => el.classList.contains("is--active"));
    if (activeIndex < 0) activeIndex = 0;

    let isAnimating = false;
    let reduceMotion = false;
    
    const autoplayEnabled = wrap.getAttribute("data-autoplay") === "true";
    const autoplayDuration = parseInt(wrap.getAttribute("data-autoplay-duration"), 10) || 4000;
    
    let autoplayCall = null;
    let isInView = true;

    const slides = items.map((item) => ({
      item,
      image: item.querySelector("[data-testimonial-img]"),
      
      splitTargets: [
        item.querySelector("[data-testimonial-text]"),
        ...item.querySelectorAll("[data-testimonial-split]"),
      ].filter(Boolean),
      
      splitInstances: [],
      
      getLines() {
        return this.splitInstances.flatMap((instance) => instance.lines);
      },
      
    }));

    function setSlideState(slideIndex, isActive) {
      const { item } = slides[slideIndex];
      item.classList.toggle("is--active", isActive);
      item.setAttribute("aria-hidden", String(!isActive));
      gsap.set(item, {
        autoAlpha: isActive ? 1 : 0,
        pointerEvents: isActive ? "auto" : "none",
      });
    }

    function updateCounter() {
      if (elCurrent) elCurrent.textContent = String(activeIndex + 1);
    }
    
    function startAutoplay() {
      if (!autoplayEnabled) return;
      if (autoplayCall) autoplayCall.kill();
    
      autoplayCall = gsap.delayedCall(autoplayDuration / 1000, () => {
        if (!isInView || isAnimating) {
          startAutoplay();
          return;
        }
        goTo((activeIndex + 1) % slides.length);
        startAutoplay();
      });
    }
    
    function pauseAutoplay() {
      if (autoplayCall) autoplayCall.pause();
    }
    
    function resumeAutoplay() {
      if (!autoplayEnabled) return;
      if (!autoplayCall) startAutoplay();
      else autoplayCall.resume();
    }
    
    function resetAutoplay() {
      if (!autoplayEnabled) return;
      startAutoplay();
    }

    // Set initial state
    slides.forEach((_, i) => setSlideState(i, i === activeIndex));
    updateCounter();

    // Handle reduced motion preference
    gsap.matchMedia().add(
      { reduce: "(prefers-reduced-motion: reduce)" },
      (context) => {
        reduceMotion = context.conditions.reduce;
      }
    );

    // Create SplitText instances
    slides.forEach((slide, slideIndex) => {
      slide.splitInstances = slide.splitTargets.map((el) =>
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "text-line",
          autoSplit: true,
          onSplit(self) {
            if (reduceMotion) return;

            const isActive = slideIndex === activeIndex;
            gsap.set(self.lines, { yPercent: isActive ? 0 : 110 });

            if (slide.image) {
              gsap.set(slide.image, {
                clipPath: isActive ? imageClipVisible : imageClipHidden,
              });
            }
          },
        })
      );
    });

    function goTo(nextIndex) {
      if (isAnimating || nextIndex === activeIndex) return;
      isAnimating = true;

      const outgoingSlide = slides[activeIndex];
      const incomingSlide = slides[nextIndex];

      const tl = gsap.timeline({
        onComplete: () => {
          setSlideState(activeIndex, false);
          setSlideState(nextIndex, true);
          activeIndex = nextIndex;
          updateCounter();
          isAnimating = false;
        },
      });

      if (reduceMotion) {
        tl.to(outgoingSlide.item, { 
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2"
          }, 0)
          .fromTo(incomingSlide.item, {
            autoAlpha: 0
          }, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2"
          }, 0);
          
        return;
      }

      const outgoingLines = outgoingSlide.getLines();
      const incomingLines = incomingSlide.getLines();

      gsap.set(incomingSlide.item, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(incomingLines, { yPercent: 110 });
  
      if (outgoingSlide.image) gsap.set(outgoingSlide.image, { clipPath: imageClipVisible });

      tl.to(outgoingLines, {
        yPercent: -110,
        duration: 0.6,
        ease: "power4.inOut",
        stagger: { amount: 0.25 },
      }, 0);

      if (outgoingSlide.image) {
        tl.to(outgoingSlide.image, {
          clipPath: imageClipHidden,
          duration: 0.6,
          ease: "power4.inOut",
        }, 0);
      }

      tl.to(incomingLines, {
        yPercent: 0,
        duration: 0.7,
        ease: "power4.inOut",
        stagger: { amount: 0.4 },
      }, ">-=0.3");

      if (incomingSlide.image) {
        tl.fromTo(incomingSlide.image, {
          clipPath: imageClipHidden,
        }, {
          clipPath: imageClipVisible,
          duration: 0.75,
          ease: "power4.inOut",
        }, "<");
      }

      tl.set(outgoingSlide.item, { autoAlpha: 0 }, ">");
    }
  
    // Start autoplay on the wrap (only works if autoplay is set to 'true')
    startAutoplay();

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        resetAutoplay();
        goTo((activeIndex + 1) % slides.length);
      });
    }
    
    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        resetAutoplay();
        goTo((activeIndex - 1 + slides.length) % slides.length);
      });
    }
        
    function onKeyDown(e) {
      if (!isInView) return;
    
      // Don't hijack arrow keys while user is typing.
      const t = e.target;
      const isTypingTarget =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
    
      if (isTypingTarget) return;
    
      if (e.key === "ArrowRight") {
        e.preventDefault();
        resetAutoplay();
        goTo((activeIndex + 1) % slides.length);
      }
    
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        resetAutoplay();
        goTo((activeIndex - 1 + slides.length) % slides.length);
      }
    }
    
    // Listen for left/right arrows
    window.addEventListener("keydown", onKeyDown);
    
    // Enable/disable keyboard + autoplay depending on scroll position
    ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        isInView = true;
        resumeAutoplay();
      },
      onEnterBack: () => {
        isInView = true;
        resumeAutoplay();
      },
      onLeave: () => {
        isInView = false;
        pauseAutoplay();
      },
      onLeaveBack: () => {
        isInView = false;
        pauseAutoplay();
      },
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

// NAV //
function initNav() {
  const nav = document.querySelector('.nav_wrap');
  const ham = document.querySelector('.ham_wrap');
  const navBgMob = document.querySelector('.nav_bg_mob') || document.querySelector('.nav_bg_wrap');

  let menuOpen = false;
  let themeBeforeMenu = nav.classList.contains('u-theme-light') ? 'u-theme-light' : 'u-theme-dark';
  let suppressTheme = false;

  function setTheme(theme) {
    nav.classList.remove('u-theme-dark', 'u-theme-light');
    nav.classList.add(theme);
  }

  let scrollY = 0;

  function lockScroll() {
    scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockScroll() {
    const y = Math.abs(parseInt(document.body.style.top || '0', 10)) || scrollY || 0;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, y);
  }

  function openMenu() {
    suppressTheme = true;
    themeBeforeMenu = nav.classList.contains('u-theme-light') ? 'u-theme-light' : 'u-theme-dark';
    setTheme('u-theme-light');
    lockScroll();
    menuOpen = true;
    requestAnimationFrame(() => (suppressTheme = false));
  }

  function closeMenu() {
    suppressTheme = true;
    unlockScroll();
    requestAnimationFrame(() => {
      setTheme(themeBeforeMenu || 'u-theme-dark');
      menuOpen = false;
      requestAnimationFrame(() => (suppressTheme = false));
    });
  }

  ScrollTrigger.create({
    start: 'top -10%',
    end: 99999,
    onEnter: () => {
      if (menuOpen || suppressTheme) return;
      setTheme('u-theme-light');
    },
    onLeaveBack: () => {
      if (menuOpen || suppressTheme) return;
      setTheme('u-theme-dark');
    }
  });

  if (!nav.classList.contains('u-theme-dark') && !nav.classList.contains('u-theme-light')) {
    nav.classList.add('u-theme-dark');
  }

  const defer = (fn) => queueMicrotask(fn);

  if (ham) {
    ham.addEventListener('click', () => {
      defer(() => {
        if (!menuOpen) openMenu();
        else closeMenu();
      });
    });
  }

  if (navBgMob) {
    navBgMob.addEventListener('click', () => {
      defer(() => {
        if (menuOpen) closeMenu();
      });
    });
  }
}

// IMAGE SCROLL EFFECT //
function initImageScrollEffect() {
  gsap.utils.toArray('.img').forEach((img) => {
    gsap.fromTo(
      img,
      { autoAlpha: 0, scale: 1.05 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: img,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );

    gsap.to(img, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: img,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      }
    });
  });
}

// HERO + FOOTER PARALLAX //
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

  document.querySelectorAll('[data-footer-parallax]').forEach(el => {
    const inner = el.querySelector('[data-footer-parallax-inner]');
    const dark  = el.querySelector('[data-footer-parallax-dark]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: 'clamp(top top)',
        scrub: 1
      }
    });

    if (inner) tl.from(inner, { yPercent: -25, ease: 'linear' });
    if (dark)  tl.from(dark,  { opacity: 0.5, ease: 'linear' }, '<');
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