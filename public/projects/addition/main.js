// Client: [Client Name]
// Project: Vendito
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
CustomEase.create("button-ease", "0.5, 0.05, 0.05, 0.99");

// Lenis (with GSAP Scroltrigger)
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {lenis.raf(time * 1000);});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-tabs="wrapper"]')) initTabSystem();
  if (document.querySelector('[data-swiper-group]')) initSwiperSlider();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('[data-css-marquee]')) initCSSMarquee();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('.img')) initImageScrollEffect();
  if (document.querySelector('[data-marquee-scroll-direction-target]')) initMarqueeScrollDirection();
  if (document.querySelector('[data-slideshow="wrap"]')) initParallaxImageGallery();
  if (document.querySelector('[data-reveal], [data-reveal-fade]')) initReveal();
  if (document.querySelector('[data-hero-parallax], [data-footer-parallax]')) initParallax();
  if (document.querySelector('.nav_wrap')) initNavScrollColor();
  if (document.querySelector('[data-menu-button]')) initMenuButton();

});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// TAB SYSTEM //
function initTabSystem() {
  const wrappers = document.querySelectorAll('[data-tabs="wrapper"]');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const contentItems = Array.from(wrapper.querySelectorAll('[data-tabs="content-item"]'));
    const visualItems = Array.from(wrapper.querySelectorAll('[data-tabs="visual-item"]'));

    if (!contentItems.length || !visualItems.length) return;

    const autoplay = wrapper.dataset.tabsAutoplay === "true";
    const autoplayDuration = parseInt(wrapper.dataset.tabsAutoplayDuration, 10) || 5000;

    let activeContent = null;
    let activeVisual = null;
    let isAnimating = false;
    let progressBarTween = null;
    let inView = false;

    function startProgressBar(index) {
      if (progressBarTween) progressBarTween.kill();

      const bar = contentItems[index]?.querySelector('[data-tabs="item-progress"]');
      if (!bar) return;

      gsap.set(bar, { scaleX: 0, transformOrigin: "left center" });
      progressBarTween = gsap.to(bar, {
        scaleX: 1,
        duration: autoplayDuration / 1000,
        ease: "power1.inOut",
        paused: !inView,
        onComplete: () => {
          if (!isAnimating) {
            const nextIndex = (index + 1) % contentItems.length;
            switchTab(nextIndex);
          }
        },
      });
    }

    function switchTab(index) {
      const incomingContent = contentItems[index];
      const incomingVisual = visualItems[index];

      if (!incomingContent || !incomingVisual) return;
      if (isAnimating) return;
      if (incomingContent === activeContent) return;

      isAnimating = true;
      if (progressBarTween) progressBarTween.kill();

      const outgoingContent = activeContent;
      const outgoingVisual = activeVisual;
      const outgoingBar = outgoingContent?.querySelector('[data-tabs="item-progress"]');
      const outgoingDetails = outgoingContent?.querySelector('[data-tabs="item-details"]');
      const incomingBar = incomingContent.querySelector('[data-tabs="item-progress"]');
      const incomingDetails = incomingContent.querySelector('[data-tabs="item-details"]');

      outgoingContent?.classList.remove("active");
      outgoingVisual?.classList.remove("active");
      incomingContent.classList.add("active");
      incomingVisual.classList.add("active");

      const tl = gsap.timeline({
        defaults: { duration: 0.65, ease: "power3" },
        onComplete: () => {
          activeContent = incomingContent;
          activeVisual = incomingVisual;
          isAnimating = false;

          if (autoplay) startProgressBar(index);
        },
      });

      if (outgoingContent) {
        tl.set(outgoingBar, { transformOrigin: "right center" })
          .to(outgoingBar, { scaleX: 0, duration: 0.3 }, 0)
          .to(outgoingVisual, { autoAlpha: 0, xPercent: 3 }, 0);

        if (outgoingDetails) {
          tl.to(outgoingDetails, { height: 0 }, 0);
        }
      }

      tl.fromTo(incomingVisual, { autoAlpha: 0, xPercent: 3 }, { autoAlpha: 1, xPercent: 0 }, 0.3)
        .set(incomingBar, { scaleX: 0, transformOrigin: "left center" }, 0);

      if (incomingDetails) {
        tl.fromTo(incomingDetails, { height: 0 }, { height: "auto" }, 0);
      }
    }

    switchTab(0);

    contentItems.forEach((item, i) => {
      item.addEventListener("click", () => {
        if (item === activeContent) return;
        switchTab(i);
      });
    });

    if (autoplay) {
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top 80%',
        end: 'bottom 20%',
        onToggle: (self) => {
          inView = self.isActive;
          if (!progressBarTween) return;
          inView ? progressBarTween.play() : progressBarTween.pause();
        }
      });
    }
  });
}

// SWIPER SLIDER //
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");
  if (!swiperSliderGroups.length) return;

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if (!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");
    const paginationEl = swiperGroup.querySelector(".swiper-pagination");

    const syncSlideState = (swiperInstance) => {
      swiperInstance.slides.forEach((slide, index) => {
        const isActive = index === swiperInstance.activeIndex;

        gsap.to(slide, {
          opacity: isActive ? 1 : 0.5,
          scale: isActive ? 1 : 0.95,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
      });
    };

    new Swiper(swiperSliderWrap, {
      slidesPerView: 1,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      pagination: {
        el: paginationEl,
        type: 'bullets',
        clickable: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      on: {
        init(swiperInstance) {
          syncSlideState(swiperInstance);
        },
        slideChange(swiperInstance) {
          syncSlideState(swiperInstance);
        },
      },
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

// CSS MARQUEE //
function initCSSMarquee() {
  const pixelsPerSecond = 75;
  const marquees = document.querySelectorAll('[data-css-marquee]');

  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      const duplicate = list.cloneNode(true);
      marquee.appendChild(duplicate);
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.querySelectorAll('[data-css-marquee-list]').forEach(list =>
        list.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused'
      );
    });
  }, { threshold: 0 });

  marquees.forEach(marquee => {
    marquee.querySelectorAll('[data-css-marquee-list]').forEach(list => {
      list.style.animationDuration = (list.offsetWidth / pixelsPerSecond) + 's';
      list.style.animationPlayState = 'paused';
    });
    observer.observe(marquee);
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

// MARQUEE SCROLL DIRECTION //
function initMarqueeScrollDirection() {
  document.querySelectorAll('[data-marquee-scroll-direction-target]').forEach((marquee) => {
    const marqueeContent = marquee.querySelector('[data-marquee-collection-target]');
    const marqueeScroll = marquee.querySelector('[data-marquee-scroll-target]');
    if (!marqueeContent || !marqueeScroll) return;

    const { marqueeSpeed: speed, marqueeDirection: direction, marqueeDuplicate: duplicate, marqueeScrollSpeed: scrollSpeed } = marquee.dataset;

    const marqueeSpeedAttr = parseFloat(speed);
    const marqueeDirectionAttr = direction === 'right' ? 1 : -1;
    const duplicateAmount = parseInt(duplicate || 0);
    const scrollSpeedAttr = parseFloat(scrollSpeed);
    const speedMultiplier = window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1;

    let marqueeSpeed = marqueeSpeedAttr * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier;

    marqueeScroll.style.marginLeft = `${scrollSpeedAttr * -1}%`;
    marqueeScroll.style.width = `${(scrollSpeedAttr * 2) + 100}%`;

    if (duplicateAmount > 0) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < duplicateAmount; i++) {
        fragment.appendChild(marqueeContent.cloneNode(true));
      }
      marqueeScroll.appendChild(fragment);
    }

    const marqueeItems = marquee.querySelectorAll('[data-marquee-collection-target]');
    const animation = gsap.to(marqueeItems, {
      xPercent: -100,
      repeat: -1,
      duration: marqueeSpeed,
      ease: 'linear'
    }).totalProgress(0.5);

    gsap.set(marqueeItems, { xPercent: marqueeDirectionAttr === 1 ? 100 : -100 });
    animation.timeScale(marqueeDirectionAttr);
    animation.play();

    marquee.setAttribute('data-marquee-status', 'normal');

    ScrollTrigger.create({
      trigger: marquee,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const isInverted = self.direction === 1;
        const currentDirection = isInverted ? -marqueeDirectionAttr : marqueeDirectionAttr;
        animation.timeScale(currentDirection);
        marquee.setAttribute('data-marquee-status', isInverted ? 'normal' : 'inverted');
      }
    });

    const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeedAttr : -scrollSpeedAttr;
    const scrollEnd = -scrollStart;

    gsap.timeline({
      scrollTrigger: {
        trigger: marquee,
        start: '0% 100%',
        end: '100% 0%',
        scrub: 0
      }
    }).fromTo(marqueeScroll, { x: `${scrollStart}vw` }, { x: `${scrollEnd}vw`, ease: 'none' });
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

// PARALLAX IMAGE SLIDESHOW //
function initSlideShow(el) {
  const slides = Array.from(el.querySelectorAll('[data-slideshow="slide"]'));
  if (!slides.length) return;

  const getInner = (slide) =>
    slide.querySelector('[data-slideshow="parallax"]') || slide;

  el.style.backgroundColor = "#000";

  const hold = parseFloat(el.getAttribute("data-slideshow-duration")) || 2.0;
  const crossfade = 0.8;
  const overlap = 0.75;
  const scaleAmount = 1.05;
  const fadeInLead = crossfade * overlap;

  slides.forEach((s, i) => {
    gsap.set(s, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 2 : 1 });
    s.classList.toggle("is--current", i === 0);
    gsap.set(getInner(s), { scale: 1, transformOrigin: "50% 50%" });
  });

  let current = 0;

  function startZoom(slide) {
    const inner = getInner(slide);
    if (inner._zoomTween) inner._zoomTween.kill();
    gsap.set(inner, { scale: 1, transformOrigin: "50% 50%" });
    inner._zoomTween = gsap.to(inner, {
      scale: scaleAmount,
      duration: hold + crossfade,
      ease: "none"
    });
  }

  startZoom(slides[current]);

  function cycle() {
    const fromIndex = current;
    const toIndex = (current + 1) % slides.length;
    const fromSlide = slides[fromIndex];
    const toSlide = slides[toIndex];
    const fromInner = getInner(fromSlide);

    toSlide.classList.add("is--current");
    gsap.set(fromSlide, { zIndex: 1 });
    gsap.set(toSlide, { zIndex: 2, opacity: 0 });
    gsap.killTweensOf(fromSlide);
    gsap.killTweensOf(toSlide);

    const fadeInStart = Math.max(0, hold - fadeInLead);
    const fadeOutStart = hold;

    const tl = gsap.timeline({
      onComplete: () => {
        if (fromInner._zoomTween) {
          fromInner._zoomTween.kill();
          fromInner._zoomTween = null;
        }
        gsap.set(fromInner, { scale: 1 });
        fromSlide.classList.remove("is--current");
        current = toIndex;
        cycle();
      }
    });

    tl.call(() => startZoom(toSlide), null, fadeInStart);
    tl.to(toSlide, { opacity: 1, duration: crossfade, ease: "slideshow-wipe" }, fadeInStart);
    tl.to(fromSlide, { opacity: 0, duration: crossfade, ease: "slideshow-wipe" }, fadeOutStart);
  }

  cycle();
}

function initParallaxImageGallery() {
  document.querySelectorAll('[data-slideshow="wrap"]').forEach((wrap) => {
    if (wrap._slideshowInit) return;
    wrap._slideshowInit = true;
    initSlideShow(wrap);
  });
}

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

// NAV SCROLL COLOR SWAP //
function initNavScrollColor() {
  const nav = document.querySelector('.nav_wrap');
  if (!nav) return;

  const rootStyles = getComputedStyle(document.documentElement);
  const lightBg = rootStyles.getPropertyValue('--swatch--light-100').trim();
  const lightText = rootStyles.getPropertyValue('--swatch--dark-900').trim();

  if (nav.hasAttribute('data-nav-light')) {
    gsap.set(nav, { backgroundColor: lightBg, color: lightText });
    return;
  }

  const tl = gsap.timeline({ paused: true })
    .to(nav, {
      backgroundColor: lightBg,
      color: lightText,
      duration: 0.4,
      ease: 'osmo'
    });

  ScrollTrigger.create({
    trigger: 'body',
    start: '10% top',
    end: 'bottom top',
    onEnter: () => tl.play(),
    onLeaveBack: () => tl.reverse()
  });
}

// MENU BUTTON //
function initMenuButton() {
  const menuButton = document.querySelector("[data-menu-button]");
  const lines = document.querySelectorAll(".menu-button-line");
  const [line1, line2, line3] = lines;

  if (!menuButton || lines.length < 3) return;

  const menuButtonTl = gsap.timeline({
    defaults: {
      overwrite: "auto",
      ease: "button-ease",
      duration: 0.3
    }
  });

  const menuOpen = () => {
    menuButtonTl.clear()
      .to(line2, { scaleX: 0, opacity: 0 })
      .to(line1, { x: "-1.3em", opacity: 0 }, "<")
      .to(line3, { x: "1.3em", opacity: 0 }, "<")
      .to([line1, line3], { opacity: 0, duration: 0.1 }, "<+=0.2")
      .set(line1, { rotate: -135, y: "-1.3em", scaleX: 0.9 })
      .set(line3, { rotate: 135, y: "-1.4em", scaleX: 0.9 }, "<")
      .to(line1, { opacity: 1, x: "0em", y: "0.5em" })
      .to(line3, { opacity: 1, x: "0em", y: "-0.25em" }, "<+=0.1");
  };

  const menuClose = () => {
    menuButtonTl.clear()
      .to([line1, line2, line3], {
        scaleX: 1,
        rotate: 0,
        x: "0em",
        y: "0em",
        opacity: 1,
        duration: 0.45,
        overwrite: "auto"
      });
  };

  menuButton.addEventListener("click", () => {
    const currentState = menuButton.getAttribute("data-menu-button");
    if (currentState === "burger") {
      menuOpen();
      menuButton.setAttribute("data-menu-button", "close");
    } else {
      menuClose();
      menuButton.setAttribute("data-menu-button", "burger");
    }
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