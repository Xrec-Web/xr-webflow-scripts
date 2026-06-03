// Client: H People
// Project: [Project Name]
// Description: [Description]

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip);

// Custom Eases
CustomEase.create("slideshow-wipe", "0.6, 0.08, 0.02, 0.99");
CustomEase.create('reveal', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('osmo', 'M0,0 C0.625,0.05 0,1 1,1');
CustomEase.create('energy', 'M0,0 C0.32,0.72 0,1 1,1');
CustomEase.create('smooth', 'M0,0 C0.38,0.005 0.215,1 1,1');
CustomEase.create('punch', 'M0,0 C0.19,1 0.22,1 1,1');
CustomEase.create('relaxed', 'M0,0 C0.7,0 0.3,1 1,1');
CustomEase.create('expo.inOut', 'M0,0 C0.87,0 0.13,1 1,1');
CustomEase.create('jump', 'M0,0 C0.35,1.5 0.6,1 1,1');
CustomEase.create('pop', 'M0,0 C0.17,0.67 0.3,1.33 1,1');

// Lenis — Smooth Scrolling
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Initialize all functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-slideshow="wrap"]'))    initParallaxImageGallery();
  if (document.querySelector('[data-accordion-css-init]')) initAccordionCSS();
  if (document.querySelector('[data-reveal], [data-reveal-clip]')) initReveal();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
  if (document.querySelector('[data-hero-parallax], [data-footer-parallax]')) initParallax();
  if (document.querySelector('[data-form-validate]')) initBasicFormValidation();
  if (document.querySelector('.swiper.is-gallery')) initGallerySlider();
  if (document.querySelector('[data-mini-showreel-open]')) initMiniShowreelPlayer();
  if (document.querySelector('[data-video="playpause"]')) initPlayPauseVideoScroll();
  if (document.querySelector('[data-modal-target]')) initModalBasic();
});


// ─── Functions ─── //


// SLIDESHOW FUNCTION 1 //
function initSlideShow(el) {
  const slides = Array.from(el.querySelectorAll('[data-slideshow="slide"]'));
  if (!slides.length) return;

  const getInner = (slide) =>
    slide.querySelector('[data-slideshow="parallax"]') || slide;

  el.style.backgroundColor = "#000";

  /* -------------------------------
     READ CUSTOM ATTRIBUTE
  ------------------------------- */

  const hold        = parseFloat(el.getAttribute("data-slideshow-duration")) || 2.0;
  const crossfade   = 0.8;
  const overlap     = 0.75;
  const scaleAmount = 1.05;
  const fadeInLead  = crossfade * overlap;

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
    const toIndex   = (current + 1) % slides.length;
    const fromSlide = slides[fromIndex];
    const toSlide   = slides[toIndex];
    const fromInner = getInner(fromSlide);

    toSlide.classList.add("is--current");
    gsap.set(fromSlide, { zIndex: 1 });
    gsap.set(toSlide, { zIndex: 2, opacity: 0 });
    gsap.killTweensOf(fromSlide);
    gsap.killTweensOf(toSlide);

    const fadeInStart  = Math.max(0, hold - fadeInLead);
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
    tl.to(toSlide,   { opacity: 1, duration: crossfade, ease: "slideshow-wipe" }, fadeInStart);
    tl.to(fromSlide, { opacity: 0, duration: crossfade, ease: "slideshow-wipe" }, fadeOutStart);
  }

  cycle();
}

// SLIDESHOW FUNCTION 2 //
function initParallaxImageGallery() {
  document.querySelectorAll('[data-slideshow="wrap"]').forEach((wrap) => {
    if (wrap._slideshowInit) return;
    wrap._slideshowInit = true;
    initSlideShow(wrap);
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

// TEXT + ELEMENT REVEAL - 1 //
const splitConfig = {
  lines: { duration: 1.0, stagger: 0.08 },
  words: { duration: 0.8, stagger: 0.06 },
  chars: { duration: 0.6, stagger: 0.01 }
};

// TEXT + ELEMENT REVEAL - 2 //
function hasRevealAncestor(el) {
  let parent = el.parentElement;
  while (parent) {
    if (parent.matches('[data-reveal], [data-reveal-clip]')) return true;
    parent = parent.parentElement;
  }
  return false;
}

// TEXT + ELEMENT REVEAL - 3 //
function animateClipBatch(els, baseDelay) {
  const DURATION = 0.9;
  const STAGGER  = 0.1;
  els.forEach((el, i) => {
    const offset = i * STAGGER;
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION - offset, ease: 'reveal', delay: baseDelay + offset });
  });
}

// TEXT + ELEMENT REVEAL - 4 //
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
      mask: 'lines',
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

// COPYRIGHT YEAR //
function initDynamicCurrentYear() {  
  const currentYear = new Date().getFullYear();
  const currentYearElements = document.querySelectorAll('[data-current-year]');
  currentYearElements.forEach(currentYearElement => {
    currentYearElement.textContent = currentYear;
  });
}

// CURSOR TEXT HOVER //
function initDynamicCustomTextCursor() {
  let cursorItem = document.querySelector('.cursor');
  let cursorParagraph = cursorItem.querySelector('p');
  let targets = document.querySelectorAll('[data-cursor]');
  let xOffset = 6;
  let yOffset = 140;
  let cursorIsOnRight = false;
  let currentTarget = null;
  let lastText = '';

  // Position cursor relative to actual cursor position on page load
  gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

  // Use GSAP quick.to for a more performative tween on the cursor
  let xTo = gsap.quickTo(cursorItem, 'x', { ease: 'power3' });
  let yTo = gsap.quickTo(cursorItem, 'y', { ease: 'power3' });

  // Function to get the width of the cursor element including a buffer
  const getCursorEdgeThreshold = () => {
    return cursorItem.offsetWidth + 16; // Cursor width + 16px margin
  };

  // On mousemove, call the quickTo functions to the actual cursor position
  window.addEventListener('mousemove', e => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

    // Default offsets
    let xPercent = xOffset;
    let yPercent = yOffset;

    // Adjust X offset dynamically based on cursor width
    let cursorEdgeThreshold = getCursorEdgeThreshold();
    if (cursorX > windowWidth - cursorEdgeThreshold) {
      cursorIsOnRight = true;
      xPercent = -100;
    } else {
      cursorIsOnRight = false;
    }

    // Adjust Y offset if in the bottom 10% of the current viewport
    if (cursorY > scrollY + windowHeight * 0.9) {
      yPercent = -120;
    }

    if (currentTarget) {
      let newText = currentTarget.getAttribute('data-cursor');
      if (newText !== lastText) { // Only update if the text is different
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        // Recalculate edge awareness whenever the text changes
        cursorEdgeThreshold = getCursorEdgeThreshold();
      }
    }

    gsap.to(cursorItem, { xPercent: xPercent, yPercent: yPercent, duration: 0.9, ease: 'power3' });
    xTo(cursorX);
    yTo(cursorY - scrollY);
  });

  // Add a mouse enter listener for each link that has a data-cursor attribute
  targets.forEach(target => {
    target.addEventListener('mouseenter', () => {
      currentTarget = target; // Set the current target

      let newText = target.getAttribute('data-cursor');

      // Update only if the text changes
      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;

        // Recalculate edge awareness whenever the text changes
        let cursorEdgeThreshold = getCursorEdgeThreshold();
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

// MINI SHOWREEL PLAYER //
function initMiniShowreelPlayer() {
  const openBtns = document.querySelectorAll("[data-mini-showreel-open]");
  if (!openBtns.length) return;

  // Settings
  var duration = 1;
  var ease = "expo.inOut";
  var zIndex = 999;

  let n = "", isOpen = false;
  let lb, pw, tg;
  let pwCss = "", lbZ = "", pwZ = "";

  const q = (sel, root = document) => root.querySelector(sel);

  const getLB = (name) => q(`[data-mini-showreel-lightbox="${name}"]`);
  const getPW = (name) => q(`[data-mini-showreel-player="${name}"]`);

  const safe = (t) => t.closest("[data-mini-showreel-safearea]") || q("[data-mini-showreel-safearea]", t) || t;

  const fit = (b, a) => {
    let w = b.width, h = w / a;
    if (h > b.height) { h = b.height; w = h * a; }
    return {
      left: b.left + (b.width - w) / 2,
      top: b.top + (b.height - h) / 2,
      width: w,
      height: h
    };
  };

  const rectFor = (t) => {
    const b = safe(t).getBoundingClientRect();
    const r = t.getBoundingClientRect();
    const a = r.width > 0 && r.height > 0 ? r.width / r.height : 16 / 9;
    return fit(b, a);
  };

  const place = (el, r) =>
    gsap.set(el, {
      position: "fixed",
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height,
      margin: 0,
      x: 0,
      y: 0
    });

  function setStatus(status) {
    if (!n) return;
    document.querySelectorAll(`[data-mini-showreel-lightbox="${n}"], [data-mini-showreel-player="${n}"]`).forEach((el) => el.setAttribute("data-mini-showreel-status", status));
  }

  function zOn() {
    lbZ = lb?.style.zIndex || "";
    pwZ = pw?.style.zIndex || "";
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);
  }

  function zOff() {
    if (lb) lb.style.zIndex = lbZ;
    if (pw) pw.style.zIndex = pwZ;
  }

  function playFor(name) {
    const wrap = getPW(name);
    if (!wrap) return;

    const bunny = wrap.querySelector("[data-bunny-player-init]");
    const video = wrap.querySelector("video");
    if (!video) return;

    if (bunny) {
      const btn = bunny.querySelector('[data-player-control="play"], [data-player-control="playpause"]');
      if (btn && (video.paused || video.ended)) btn.click();
      return;
    }

    try { video.play(); } catch(_) {}
  }

  function stopFor(name) {
    const wrap = getPW(name);
    if (!wrap) return;

    const bunny = wrap.querySelector("[data-bunny-player-init]");
    const video = wrap.querySelector("video");
    if (!video) return;

    if (bunny) {
      const btn = bunny.querySelector('[data-player-control="pause"], [data-player-control="playpause"]');
      if (btn && (!video.paused && !video.ended)) btn.click();
    } else {
      try { video.pause(); } catch(_) {}
    }

    try { video.currentTime = 0; } catch(_) {}
  }

  function openBy(name) {
    if (!name || isOpen) return;

    lb = getLB(name);
    pw = getPW(name);
    if (!lb || !pw) return;

    tg = q("[data-mini-showreel-target]", lb);
    if (!tg) return;

    n = name;
    isOpen = true;

    pw.dataset.flipId = n;
    pwCss = pw.style.cssText || "";

    zOn();
    setStatus("active");
    playFor(n);

    const state = Flip.getState(pw);
    place(pw, rectFor(tg));

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false
    });
  }

  function closeBy(nameOrEmpty) {
    if (!isOpen || !pw) return;
    if (nameOrEmpty && nameOrEmpty !== n) return;

    stopFor(n);
    setStatus("not-active");

    const state = Flip.getState(pw);

    pw.style.cssText = pwCss;
    if (lb) lb.style.zIndex = String(zIndex);
    if (pw) pw.style.zIndex = String(zIndex);

    Flip.from(state, {
      duration: duration,
      ease: ease,
      absolute: true,
      scale: false,
      onComplete: () => {
        zOff();
        n = "";
        isOpen = false;
        lb = pw = tg = null;
        pwCss = "";
        lbZ = "";
        pwZ = "";
      }
    });
  }

  function onResize() {
    if (!isOpen || !pw || !tg) return;
    place(pw, rectFor(tg));
  }

  openBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openBy(btn.getAttribute("data-mini-showreel-open") || "");
    });
  });

  document.addEventListener("click", (e) => {
    const closeBtn = e.target.closest("[data-mini-showreel-close]");
    if (!closeBtn) return;
    e.preventDefault();
    closeBy(closeBtn.getAttribute("data-mini-showreel-close") || "");
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBy("");
  });

  window.addEventListener("resize", onResize);
}

// PLAY/PAUSE VIDEO ON SCROLL //
function initPlayPauseVideoScroll() {
  const videos = gsap.utils.toArray('[data-video="playpause"]');

  videos.forEach(el => {
    const video = el.querySelector('video');
    if (!video) return;

    ScrollTrigger.create({
      trigger: el,
      start: '0% 100%',
      end: '100% 0%',
      onEnter: () => video.play(),
      onEnterBack: () => video.play(),
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    });
  });
}

// BASIC MODAL //
function initModalBasic() {
  const modalGroup = document.querySelector('[data-modal-group-status]');
  const modals = document.querySelectorAll('[data-modal-name]');
  const modalTargets = document.querySelectorAll('[data-modal-target]');

  // ── Vimeo control ──
  // Loads the official Vimeo Player SDK once, then attaches a player to each
  // modal's Vimeo iframe (Webflow's Video element). Players are cached by name.
  const players = {};
  let apiPromise;

  function loadVimeoAPI() {
    if (window.Vimeo && window.Vimeo.Player) return Promise.resolve();
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://player.vimeo.com/api/player.js';
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
    return apiPromise;
  }

  // Webflow embeds Vimeo through an embedly wrapper iframe, which the Vimeo
  // SDK can't control. Pull the real player.vimeo.com URL out of its `src`.
  function vimeoSrcFromIframe(iframe) {
    let raw = iframe.getAttribute('src') || '';
    if (raw.indexOf('//') === 0) raw = 'https:' + raw;
    try {
      const u = new URL(raw);
      if (u.hostname.indexOf('vimeo.com') !== -1) return raw;
      const inner = u.searchParams.get('src'); // embedly stores the real URL here
      if (inner && inner.indexOf('vimeo.com') !== -1) return inner;
    } catch (_) {}
    return null;
  }

  // Replace the embedly iframe with a native Vimeo iframe so the SDK can drive it.
  function ensureVimeoIframe(modal) {
    const existing = modal.querySelector('iframe');
    if (!existing) return null;
    if (existing.src.indexOf('player.vimeo.com') !== -1) return existing;

    const vsrc = vimeoSrcFromIframe(existing);
    if (!vsrc) return null;

    const iframe = document.createElement('iframe');
    iframe.src = vsrc;
    iframe.title = existing.title || '';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'allowfullscreen');
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    existing.parentNode.replaceChild(iframe, existing);
    return iframe;
  }

  function playModal(name) {
    loadVimeoAPI().then(() => {
      const modal = document.querySelector(`[data-modal-name="${name}"]`);
      if (!modal || !window.Vimeo || !window.Vimeo.Player) return;
      const iframe = ensureVimeoIframe(modal);
      if (!iframe) return;
      if (!players[name]) players[name] = new window.Vimeo.Player(iframe);
      players[name].play().catch(() => {});
    });
  }

  function stopAllVideos() {
    document.querySelectorAll('[data-modal-name]').forEach((modal) => {
      const name = modal.getAttribute('data-modal-name');
      const iframe = modal.querySelector('iframe');
      if (!iframe || iframe.src.indexOf('player.vimeo.com') === -1) return;

      // Try a graceful SDK pause first (no flash if it's ready)…
      if (players[name]) {
        try { players[name].pause().catch(() => {}); } catch (_) {}
      }
      // …then hard-reset the iframe so playback fully stops in every state.
      const src = iframe.src;
      iframe.src = src;
      delete players[name]; // stale after reload — recreate on next open
    });
  }

  // Open modal
  modalTargets.forEach((modalTarget) => {
    modalTarget.addEventListener('click', function () {
      const modalTargetName = this.getAttribute('data-modal-target');

      // Stop any playing video, then close all modals
      stopAllVideos();
      modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));
      modals.forEach((modal) => modal.setAttribute('data-modal-status', 'not-active'));

      // Activate clicked modal
      document.querySelector(`[data-modal-target="${modalTargetName}"]`).setAttribute('data-modal-status', 'active');
      document.querySelector(`[data-modal-name="${modalTargetName}"]`).setAttribute('data-modal-status', 'active');

      // Set group to active
      if (modalGroup) {
        modalGroup.setAttribute('data-modal-group-status', 'active');
      }

      // Start the video inside the opened modal
      playModal(modalTargetName);
    });
  });

  // Close modal
  document.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', closeAllModals);
  });

  // Close modal on `Escape` key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });

  // Function to close all modals
  function closeAllModals() {
    stopAllVideos();
    modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));

    if (modalGroup) {
      modalGroup.setAttribute('data-modal-group-status', 'not-active');
    }
  }
}