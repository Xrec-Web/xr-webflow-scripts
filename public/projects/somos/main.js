// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, Observer, CustomEase);

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
  if (document.querySelector('.nav_wrap'))                  initNav();
  if (document.querySelector('.img'))                       initImageScroll();
  if (document.querySelector('[data-current-year]'))        initDynamicCurrentYear();
  if (document.querySelector('[data-accordion-css-init]'))  initAccordionCSS();
  if (document.querySelector('.faq_toggle_inner'))          initFAQ();
  if (document.querySelector('[data-hero-parallax]') ||
      document.querySelector('[data-footer-parallax]'))     initParallax();
  if (document.querySelector('[process-wrap]'))             initProcessLoadingOnce();
  if (document.querySelector('[data-testimonial-wrap]'))    initLineRevealTestimonials();
  if (document.querySelector('[hero-test-wrap]'))           initHeroFade();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// NAV THEME SWITCH + MOBILE MENU THEME OVERRIDE + SCROLL LOCK //
function initNav() {
  gsap.registerPlugin(ScrollTrigger);

  const nav = document.querySelector(".nav_wrap");
  const ham = document.querySelector(".ham_wrap");
  const navBgMob = document.querySelector(".nav_bg_mob") || document.querySelector(".nav_bg_wrap");

  if (!nav) return;

  let menuOpen = false;
  let themeBeforeMenu = nav.classList.contains("u-theme-light") ? "u-theme-light" : "u-theme-dark";
  let suppressTheme = false;

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
    suppressTheme = true;
    themeBeforeMenu = nav.classList.contains("u-theme-light") ? "u-theme-light" : "u-theme-dark";
    setTheme("u-theme-light");
    lockScroll();
    menuOpen = true;
    requestAnimationFrame(() => (suppressTheme = false));
  }

  function closeMenu() {
    suppressTheme = true;
    unlockScroll();
    requestAnimationFrame(() => {
      setTheme(themeBeforeMenu || "u-theme-dark");
      menuOpen = false;
      requestAnimationFrame(() => (suppressTheme = false));
    });
  }

  ScrollTrigger.create({
    start: "top -10%",
    end: 99999,
    onEnter: () => {
      if (menuOpen || suppressTheme) return;
      setTheme("u-theme-light");
    },
    onLeaveBack: () => {
      if (menuOpen || suppressTheme) return;
      setTheme("u-theme-dark");
    }
  });

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
function initImageScroll() {
  gsap.utils.toArray(".img").forEach((img) => {
    gsap.fromTo(
      img,
      { autoAlpha: 0, scale: 1.05 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
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


// COPYRIGHT YEAR //
function initDynamicCurrentYear() {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = currentYear;
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


// FAQ //
function initFAQ() {
  if (typeof gsap === "undefined") {
    console.warn("GSAP not found. Load GSAP before this script.");
    return;
  }

  const toggles = {
    employer: document.querySelector(".faq_toggle_inner.employer"),
    candidate: document.querySelector(".faq_toggle_inner.candidate"),
  };

  const panels = {
    employer: document.querySelector(".accordion-css.employer"),
    candidate: document.querySelector(".accordion-css.candidate"),
  };

  if (!toggles.employer || !toggles.candidate) {
    console.warn("Missing toggles. Expected .faq_toggle_inner.employer and .faq_toggle_inner.candidate");
    return;
  }
  if (!panels.employer || !panels.candidate) {
    console.warn("Missing panels. Expected .accordion-css.employer and .accordion-css.candidate");
    return;
  }

  const getItems = (panel) => Array.from(panel.querySelectorAll(":scope > *"));

  let activeKey =
    toggles.employer.classList.contains("is-active") ? "employer" :
    toggles.candidate.classList.contains("is-active") ? "candidate" :
    "employer";

  let isAnimating = false;

  function setInitialState(key) {
    const showPanel = panels[key];
    const hidePanel = panels[key === "employer" ? "candidate" : "employer"];

    gsap.set(showPanel, { display: "block", autoAlpha: 1, height: "auto" });
    gsap.set(hidePanel, { display: "none", autoAlpha: 0 });

    gsap.set(getItems(showPanel), { autoAlpha: 1, y: 0 });
    gsap.set(getItems(hidePanel), { autoAlpha: 0, y: 12 });

    toggles.employer.classList.toggle("is-active", key === "employer");
    toggles.candidate.classList.toggle("is-active", key === "candidate");
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

    toggles[prevKey].classList.remove("is-active");
    toggles[nextKey].classList.add("is-active");

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        activeKey = nextKey;
        isAnimating = false;
      },
    });

    tl.to(prevItems, { autoAlpha: 0, y: -10, duration: 0.25, stagger: 0.03, clearProps: "transform" });
    tl.set(prevPanel, { display: "none", autoAlpha: 0 });
    tl.set(nextPanel, { display: "block", autoAlpha: 1 });
    tl.set(nextItems, { autoAlpha: 0, y: 12 });
    tl.to(nextItems, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04 }, "+=0.02");

    return tl;
  }

  toggles.employer.addEventListener("click", () => switchTo("employer"));
  toggles.candidate.addEventListener("click", () => switchTo("candidate"));
}


// HERO + FOOTER PARALLAX //
function initParallax() {

  // HERO PARALLAX
  document.querySelectorAll('[data-hero-parallax]').forEach(el => {
    const inner = el.querySelector('[data-hero-parallax-inner]');
    const dark  = el.querySelector('[data-hero-parallax-dark]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    if (inner) tl.to(inner, { yPercent: 25, ease: 'linear' });
    if (dark)  tl.to(dark,  { opacity: 0.7, ease: 'linear' }, '<');
  });

  // FOOTER PARALLAX
  document.querySelectorAll('[data-footer-parallax]').forEach(el => {
    const inner = el.querySelector('[data-footer-parallax-inner]');
    const dark  = el.querySelector('[data-footer-parallax-dark]');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: 'clamp(top top)',
        scrub: true
      }
    });

    if (inner) tl.from(inner, { yPercent: -25, ease: 'linear' });
    if (dark)  tl.from(dark,  { opacity: 0.5, ease: 'linear' }, '<');
  });
}


// PROCESS ANIMATION //
function initProcessLoadingOnce() {
  document.querySelectorAll('[process-wrap]').forEach((wrap) => {
    const bar = wrap.querySelector('[process-bar]');
    const items = Array.from(wrap.querySelectorAll('[process-item]'));

    if (!bar || items.length === 0) return;

    items.sort((a, b) => {
      const sa = parseInt(a.getAttribute('process-step') || '0', 10);
      const sb = parseInt(b.getAttribute('process-step') || '0', 10);
      return sa - sb;
    });

    const DURATION = parseFloat(wrap.getAttribute('process-duration')) || 1.8;
    const fadeDur = 0.08;

    gsap.set(bar, { width: '0%' });
    gsap.set(items, { opacity: 0.5 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    tl.to(bar, { width: '100%', duration: 1 }, 0);

    items.forEach((item, i) => {
      const t = (i + 1) / items.length;
      tl.to(item, { opacity: 1, duration: fadeDur }, t);
    });

    tl.duration(DURATION);

    ScrollTrigger.create({
      trigger: wrap,
      start: 'top 75%',
      once: true,
      onEnter: () => tl.play(0)
    });
  });
}


// TESTIMONIALS //
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
        if (!isInView || isAnimating) { startAutoplay(); return; }
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

    slides.forEach((_, i) => setSlideState(i, i === activeIndex));
    updateCounter();

    gsap.matchMedia().add(
      { reduce: "(prefers-reduced-motion: reduce)" },
      (context) => { reduceMotion = context.conditions.reduce; }
    );

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
              gsap.set(slide.image, { clipPath: isActive ? imageClipVisible : imageClipHidden });
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
        tl.to(outgoingSlide.item, { autoAlpha: 0, duration: 0.4, ease: "power2" }, 0)
          .fromTo(incomingSlide.item, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2" }, 0);
        return;
      }

      const outgoingLines = outgoingSlide.getLines();
      const incomingLines = incomingSlide.getLines();

      gsap.set(incomingSlide.item, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(incomingLines, { yPercent: 110 });
      if (outgoingSlide.image) gsap.set(outgoingSlide.image, { clipPath: imageClipVisible });

      tl.to(outgoingLines, { yPercent: -110, duration: 0.6, ease: "power4.inOut", stagger: { amount: 0.25 } }, 0);

      if (outgoingSlide.image) {
        tl.to(outgoingSlide.image, { clipPath: imageClipHidden, duration: 0.6, ease: "power4.inOut" }, 0);
      }

      tl.to(incomingLines, { yPercent: 0, duration: 0.7, ease: "power4.inOut", stagger: { amount: 0.4 } }, ">-=0.3");

      if (incomingSlide.image) {
        tl.fromTo(incomingSlide.image,
          { clipPath: imageClipHidden },
          { clipPath: imageClipVisible, duration: 0.75, ease: "power4.inOut" },
          "<"
        );
      }

      tl.set(outgoingSlide.item, { autoAlpha: 0 }, ">");
    }

    startAutoplay();

    if (btnNext) btnNext.addEventListener("click", () => { resetAutoplay(); goTo((activeIndex + 1) % slides.length); });
    if (btnPrev) btnPrev.addEventListener("click", () => { resetAutoplay(); goTo((activeIndex - 1 + slides.length) % slides.length); });

    function onKeyDown(e) {
      if (!isInView) return;
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); resetAutoplay(); goTo((activeIndex + 1) % slides.length); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); resetAutoplay(); goTo((activeIndex - 1 + slides.length) % slides.length); }
    }

    window.addEventListener("keydown", onKeyDown);

    ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onEnter:      () => { isInView = true;  resumeAutoplay(); },
      onEnterBack:  () => { isInView = true;  resumeAutoplay(); },
      onLeave:      () => { isInView = false; pauseAutoplay();  },
      onLeaveBack:  () => { isInView = false; pauseAutoplay();  },
    });
  });
}


// HERO FADE //
function initHeroFade() {
  const wrapper = document.querySelector('[hero-test-wrap]');
  if (!wrapper) return;

  const items = wrapper.querySelectorAll('[hero-item]');
  if (!items.length) return;

  let current = 0;
  let isAnimating = false;

  items.forEach((item, i) => {
    item.style.opacity = i === 0 ? '1' : '0';
    item.style.transition = 'opacity 0.5s ease';
    if (i === 0) item.classList.add('is-active');
  });

  function next() {
    if (isAnimating) return;
    isAnimating = true;

    const currentItem = items[current];
    const nextIndex = (current + 1) % items.length;
    const nextItem = items[nextIndex];

    currentItem.style.opacity = '0';

    setTimeout(() => {
      currentItem.classList.remove('is-active');
      nextItem.classList.add('is-active');
      nextItem.style.opacity = '1';
      current = nextIndex;
      isAnimating = false;
    }, 500);
  }

  setInterval(next, 3000);
}