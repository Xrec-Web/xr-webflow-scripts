// Client: [Client Name]
// Project: Vendito
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, ScrollToPlugin, InertiaPlugin, Observer, CustomEase);

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
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  runPreloader();
  if (document.querySelector('[data-testimonial-wrap]')) initLineRevealTestimonials();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  initDynamicCurrentYear();
  initHamburger();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// LINE REVEAL TESTIMONIALS //
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

    window.addEventListener("keydown", onKeyDown);

    ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => { isInView = true; resumeAutoplay(); },
      onEnterBack: () => { isInView = true; resumeAutoplay(); },
      onLeave: () => { isInView = false; pauseAutoplay(); },
      onLeaveBack: () => { isInView = false; pauseAutoplay(); },
    });
  });
}

// PRELOADER //
function runPreloader() {
  const tl = gsap.timeline();

  const navWrap = document.querySelector(".nav_wrap");
  if (navWrap) {
    gsap.set(navWrap, {
      paddingLeft: "0rem",
      paddingRight: "0rem",
      marginTop: "2rem"
    });
  }

  gsap.set(".l-icon", { transformOrigin: "50% 50%" });

  tl.to(".l-icon", {
    rotation: 360,
    duration: 0.75,
    ease: "power2.inOut",
  });

  tl.from(
    [".l-1", ".l-2", ".l-3", ".l-4", ".l-5", ".l-6", ".l-7"],
    {
      y: 30,
      opacity: 0,
      duration: 0.35,
      stagger: 0.05,
      ease: "power3.out",
    },
    "-=0.4"
  );

  tl.to({}, { duration: 1 });

  tl.to(".load_logo", {
    opacity: 0,
    filter: "blur(12px)",
    duration: 0.35,
    ease: "power3.out",
  });

  tl.to(".page_load", {
    y: "100%",
    duration: 0.5,
    ease: "power2.inOut",
  });

  tl.call(() => {
    document.body.style.opacity = "1";
    initPageAnimations();
  });
}

// PAGE ANIMATIONS (runs after preloader) //
function initPageAnimations() {
  initNavScrollAnimation();
  runHTxtAnimations();
  setupStickyPanelToggle();
  setupSwiper();
}

// NAV SCROLL //
function initNavScrollAnimation() {
  const navWrap = document.querySelector(".nav_wrap");
  if (!navWrap) return;

  gsap.set(navWrap, {
    paddingLeft: "0rem",
    paddingRight: "0rem",
    marginTop: "2rem"
  });

  gsap.to(navWrap, {
    paddingLeft: "1.5rem",
    paddingRight: "1.5rem",
    marginTop: "1rem",
    ease: "power3.out",
    scrollTrigger: {
      start: 1,
      end: window.innerHeight * 0.10,
      scrub: true
    }
  });
}

// STICKY PANELS SCROLL //
function createScroll01() {
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.trigger?.classList.contains("sticky-section_panel")) {
      trigger.kill();
    }
  });

  const panels = Array.from(document.querySelectorAll('.sticky-section_panel'))
    .filter(p => p.style.display === 'block');

  panels.forEach((panel, index) => {
    const isLast = index === panels.length - 1;
    gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top top',
        scrub: 1,
      },
    }).to(panel, {
      ease: 'none',
      startAt: { filter: 'opacity(100%) blur(0px)' },
      filter: isLast ? 'none' : 'opacity(50%) blur(10px)',
      scale: 0.9,
      borderRadius: 40,
    }, '<');
  });

  ScrollTrigger.refresh();
}

// HEADER TEXT ANIMATIONS //
function runHTxtAnimations() {
  document.fonts.ready.then(() => {
    gsap.set([".split", ".h-txt", ".h-title"], {
      opacity: 1,
      visibility: "visible",
    });

    const isDesktop = window.matchMedia("(min-width: 992px)").matches;

    if (isDesktop) {
      document.querySelectorAll(".h-title").forEach(el => {
        const split = new SplitText(el, {
          type: "words,chars",
          charsClass: "char",
          autoSplit: true,
          mask: "chars"
        });
        gsap.from(split.chars, {
          duration: 0.6,
          yPercent: 100,
          opacity: 0,
          stagger: 0.02,
          ease: "power3.out"
        });
      });

      document.querySelectorAll(".h-txt").forEach(el => {
        const split = new SplitText(el, {
          type: "words,lines",
          linesClass: "line",
          autoSplit: true,
          mask: "lines"
        });
        gsap.from(split.lines, {
          duration: 0.6,
          yPercent: 100,
          opacity: 0,
          stagger: 0.1,
          ease: "power3.out"
        });
      });
    }

    document.querySelectorAll(".split").forEach(el => {
      const split = new SplitText(el, {
        type: "words,lines",
        linesClass: "line",
        autoSplit: true,
        mask: "lines"
      });
      const anim = gsap.from(split.lines, {
        duration: 0.6,
        yPercent: 100,
        opacity: 0,
        stagger: 0.1,
        ease: "power3.out",
        paused: true
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => anim.play()
      });
    });

    document.querySelectorAll("[an-title]").forEach(el => {
      const split = new SplitText(el, {
        type: "words",
        wordsClass: "word",
        autoSplit: true,
        mask: "words"
      });
      const anim = gsap.from(split.words, {
        duration: 0.6,
        yPercent: 100,
        opacity: 0,
        stagger: 0.05,
        ease: "power3.out",
        paused: true
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => anim.play()
      });
    });

    document.querySelectorAll("[an-body]").forEach(el => {
      const split = new SplitText(el, {
        type: "lines",
        linesClass: "line",
        autoSplit: true,
        mask: "lines"
      });
      const anim = gsap.from(split.lines, {
        duration: 0.6,
        yPercent: 100,
        opacity: 0,
        stagger: 0.08,
        ease: "power3.out",
        paused: true
      });
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        onEnter: () => anim.play()
      });
    });

    document.querySelectorAll(".img-para").forEach(el => {
      const wrapper = el.parentElement;

      gsap.to(el, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      gsap.fromTo(el, {
        scale: 1.1,
        opacity: 0,
        filter: "blur(10px)"
      }, {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
    });
  });
}

// STICKY PANEL TOGGLE //
function setupStickyPanelToggle() {
  const toggles = document.querySelectorAll(".sticky_toggle");
  const panels = document.querySelectorAll(".sticky-section_panel");
  const scrollTarget = document.querySelector(".sticky-section_wrapper");

  function switchPanels(targetClass) {
    const outgoingPanels = Array.from(panels).filter(p => p.style.display === "block" && !p.classList.contains(targetClass));
    const incomingPanels = Array.from(panels).filter(p => p.classList.contains(targetClass));

    const tl = gsap.timeline();

    tl.to(outgoingPanels, {
      y: "100%",
      autoAlpha: 0,
      duration: 0.5,
      ease: "power3.in"
    }, 0);

    tl.to(window, {
      scrollTo: scrollTarget,
      duration: 0.8,
      ease: "power3.out"
    }, 0);

    tl.set(outgoingPanels, { visibility: "hidden", display: "none" });

    tl.set(incomingPanels, {
      display: "block",
      visibility: "visible",
      y: "100%",
      autoAlpha: 0
    });

    tl.to(incomingPanels, {
      y: "0%",
      autoAlpha: 1,
      duration: 0.6,
      ease: "power3.out"
    });

    tl.call(() => { createScroll01(); });
  }

  const activeToggle = document.querySelector(".sticky_toggle.active");
  if (activeToggle) {
    const comboClass = activeToggle.classList.contains("employer") ? "employer" : "seeker";
    panels.forEach(panel => {
      const isMatch = panel.classList.contains(comboClass);
      gsap.set(panel, {
        y: isMatch ? "0%" : "100%",
        autoAlpha: isMatch ? 1 : 0,
        visibility: isMatch ? "visible" : "hidden",
        display: isMatch ? "block" : "none"
      });
    });
    createScroll01();
  }

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      if (toggle.classList.contains("active")) return;
      toggles.forEach(t => t.classList.remove("active"));
      toggle.classList.add("active");
      const comboClass = toggle.classList.contains("employer") ? "employer" : "seeker";
      switchPanels(comboClass);
    });
  });
}

// SWIPER //
function setupSwiper() {
  new Swiper(".swiper.is-team", {
    loop: true,
    slidesPerView: 1.5,
    spaceBetween: 16,
    allowTouchMove: true,
    navigation: {
      nextEl: ".swiper-btn-next",
      prevEl: ".swiper-btn-prev"
    },
    breakpoints: {
      300: { slidesPerView: 1.25 },
      1000: { slidesPerView: 2.75 },
      1600: { slidesPerView: 3.25 }
    }
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

// HAMBURGER //
function initHamburger() {
  const hamburger = document.querySelector(".hamburger_5_wrap");
  if (!hamburger) return;

  hamburger.addEventListener("click", function () {
    this.classList.toggle("is-active");
  });
}
