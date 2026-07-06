// -----------------------------------------
// OSMO PAGE TRANSITION BOILERPLATE
// -----------------------------------------

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip, Observer);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches)); 

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });



// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
  
  // Runs once on first load. These live OUTSIDE the Barba container (they
  // persist across page transitions), so query the whole document — `has()` is
  // scoped to nextPage (the container) and would never find them.
  // if (document.querySelector('[data-something]')) initSomething();
  if (document.querySelector('.progressive-blur')) initProgressiveBlurScroll();
  if (document.querySelector('[data-slideshow="wrap"]')) initParallaxImageGallery();
  if (document.querySelector('[data-underlay-nav-toggle]')) initMobileMenu();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  
  
  if(hasLenis){
    lenis.resize();
  }
  
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
}



// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

// Logo paths travel an absolute pixel distance (measured from the logo height,
// floored) so every path clears the mask uniformly regardless of its own height.
// Overshoot is invisible behind the mask. Kept in sync with `main copy.js`.
const LOGO_TRAVEL_MIN = 300; // px floor so the paths always clear the mask

function measureLogoTravel(logo) {
  const h = logo ? logo.getBoundingClientRect().height : 0;
  return Math.max(h, LOGO_TRAVEL_MIN) * 1.2;
}

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();

  tl.call(() => {
    resetPage(next);
  }, null, 0);

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
  const transitionPanelTop = transitionWrap.querySelector("[data-transition-panel-top]");
  const transitionPanelBottom = transitionWrap.querySelector("[data-transition-panel-bottom]");
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");
  const transitionLogoPath = transitionWrap.querySelectorAll("path");

  // Absolute travel distance (px) so every path moves the same amount.
  const logoTravel = measureLogoTravel(transitionLogo);

  const tl = gsap.timeline({
    onComplete: () => { current.remove() }
  });
  
  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    return tl.set(current, { autoAlpha: 0 });
  }
  
  tl.set(transitionPanel, {
    autoAlpha: 1
  }, 0);
  
  tl.set(transitionPanelTop, {
    scaleY: 0,
    height: "15vw"
  }, 0);
  
  tl.set(transitionPanelBottom, {
    scaleY: 1,
    height: "20vw"
  }, 0);
  
  tl.set(transitionLogo, {
    autoAlpha: 1
  });
  
  tl.set(transitionLogoPath, {
    y: logoTravel
  });

  tl.set(next,{
    autoAlpha: 0
  }, 0);
  
  tl.fromTo(transitionPanel,{
    yPercent: 0
  },{
    yPercent: -100,
    duration: 1,
  }, 0);
  
  tl.fromTo(transitionPanelTop,{
    scaleY: 0
  },{
    scaleY: 1,
    duration: 1,
  }, "<");
  
  tl.fromTo(transitionLogoPath, {
    y: logoTravel
  },{
    y: 0,
    duration: 0.8,
    ease: "expo.out",
    stagger: {
      amount: 0.06
    }
  }, "<+=0.4");
  
  tl.fromTo(current,{
    y: "0vh"
  },{
    y: "-15dvh",
    duration: 1,
  }, 0);
}

function runPageEnterAnimation(next){
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionPanel = transitionWrap.querySelector("[data-transition-panel]");
  const transitionPanelTop = transitionWrap.querySelector("[data-transition-panel-top]");
  const transitionPanelBottom = transitionWrap.querySelector("[data-transition-panel-bottom]");
  const transitionLogo = transitionWrap.querySelector("[data-transition-logo]");
  const transitionLogoPath = transitionWrap.querySelectorAll("path");

  // Absolute travel distance (px) so every path clears the mask uniformly.
  const logoTravel = measureLogoTravel(transitionLogo);

  const tl = gsap.timeline();

  if (reducedMotion) {
    // Immediate swap behavior if user prefers reduced motion
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady")
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }  
  
  tl.add("startEnter", 1.35);
  
  tl.set(next, {
    autoAlpha: 1,
  }, "startEnter");
  
  tl.fromTo(transitionPanel, {
    yPercent: -100,
  },{
    yPercent: -200,
    duration: 1,
    overwrite: "auto",
    immediateRender: false
  }, "startEnter");
  
  tl.fromTo(transitionPanelBottom,{
    scaleY: 1
  },{
    scaleY: 0,
    duration: 1,
  }, "<");
  
  tl.set(transitionPanel, {
    autoAlpha: 0
  }, ">");
  
  tl.to(transitionLogoPath, {
    y: -logoTravel,
    duration: 1.2,
    ease: "expo.inOut",
    stagger: {
      amount: -0.06
    }
  }, "startEnter-=0.4");
  
  tl.from(next, {
    y: "25dvh",
    duration: 1,
  }, "startEnter");
  
  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}


// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  // Position new container on top
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
  });
  
  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }
  
  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave(() => {
  if(hasScrollTrigger){
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
})

barba.hooks.afterEnter(data => {
  // Run page functions
  initAfterEnterFunctions(data.next.container);
  
  // Settle
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
  
  if(hasScrollTrigger){
    ScrollTrigger.refresh(); 
  }
});

barba.init({
  debug: true, // Set to 'false' in production
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,
      
      // First load
      async once(data) {
        initOnceFunctions();

        return runPageOnceAnimation(data.next.container);
      },

      // Current page leaves
      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      // New page enters
      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});



// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: {
    nav: "dark",
    transition: "light"
  },
  dark: {
    nav: "light",
    transition: "dark"
  }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;
  
  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) {
    transitionEl.dataset.themeTransition = config.transition;
  }

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) {
    nav.dataset.themeNav = config.nav;
  }
}

function initLenis() {
  if (lenis) return; // already created
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

function resetPage(container){
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });
  
  if(hasLenis){
    lenis.resize();
    lenis.start();    
  }
}

function debounceOnWidthChange(fn, ms) {
  let last = innerWidth,
    timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (innerWidth !== last) {
        last = innerWidth;
        fn.apply(this, args);
      }
    }, ms);
  };
}

function initBarbaNavUpdate(data) {
  var tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  var nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  var currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach(function (curr, index) {
    var next = nextNodes[index];
    if (!next) return;

    // Aria-current sync
    var newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    // Class list sync
    var newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}



// -----------------------------------------
// YOUR FUNCTIONS GO BELOW HERE
// -----------------------------------------

function initMobileMenu() {
  const menu = document.querySelector('[form-inner-menu]');
  if (!menu) return;

  // The overlay container, if there is one; otherwise treat the panel as its own.
  const wrap = document.querySelector('[form-wrap]') || menu;
  // Backdrop: this project uses .dark-bg (no [form-bg]).
  const bg   = document.querySelector('[form-bg]') || document.querySelector('.dark-bg');

  // Collect every toggle's bars + labels and zero them out.
  const buttons = [];
  document.querySelectorAll('[data-underlay-nav-toggle]').forEach((btn) => {
    const bars = btn.querySelectorAll('.underlay-nav__toggle-bar');
    if (bars.length < 2) return;
    const labels = btn.querySelectorAll('.underlay-nav__toggle-label');
    gsap.set(bars, { y: 0, rotation: 0 });
    gsap.set(labels, { yPercent: 0 });
    buttons.push({ btn, bars, labels });
  });
  if (!buttons.length) return;

  const CLIP_HIDDEN = 'inset(0% 0% 0% 100%)'; // width 0, anchored right
  const CLIP_SHOWN  = 'inset(0% 0% 0% 0%)';   // full width

  // Make the overlay renderable but hidden. When there's no separate [form-wrap],
  // `wrap` IS the menu, so this also overrides any display:none / opacity:0 that
  // Webflow set on it — otherwise the clip would animate on an invisible element.
  gsap.set(wrap, { display: 'flex', autoAlpha: 0, pointerEvents: 'none' });
  if (bg) gsap.set(bg, { autoAlpha: 0 });
  gsap.set(menu, { clipPath: CLIP_HIDDEN });

  let open = false;

  // lenis.stop() adds .lenis-stopped (overflow:hidden), locking touch scroll too.
  const lockScroll = (lock) => {
    if (!lenis) return;
    if (lock) lenis.stop();
    else lenis.start();
  };

  // Drive every toggle's icon to match the panel state.
  const syncIcon = (isOpen) => {
    buttons.forEach(({ btn, bars, labels }) => {
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'close menu' : 'open menu');
      if (isOpen) {
        gsap.to(bars[0], { y: '0.25em', rotation: 45, duration: 0.35, ease: 'pop', overwrite: 'auto' });
        gsap.to(bars[1], { y: '-0.25em', rotation: -45, duration: 0.35, ease: 'pop', overwrite: 'auto' });
        gsap.to(labels, { yPercent: -100, duration: 0.4, ease: 'energy', overwrite: 'auto' });
      } else {
        gsap.to(bars, { y: 0, rotation: 0, duration: 0.25, ease: 'osmo', overwrite: 'auto' });
        gsap.to(labels, { yPercent: 0, duration: 0.25, ease: 'osmo', overwrite: 'auto' });
      }
    });
  };

  function openMenu() {
    if (open) return;
    open = true;
    gsap.set(wrap, { autoAlpha: 1, pointerEvents: 'auto' });
    if (bg) gsap.to(bg, { autoAlpha: 1, duration: 0.4, ease: 'osmo' });
    gsap.fromTo(menu, { clipPath: CLIP_HIDDEN }, { clipPath: CLIP_SHOWN, duration: 0.6, ease: 'osmo' });
    lockScroll(true);
    syncIcon(true);
  }

  // Fire-and-forget: the page transition triggers this from Barba's beforeLeave
  // and runs CONCURRENTLY (matching the proven Quaglio setup). lockScroll(false)
  // restarts lenis; beforeEnter then stops it for the transition and resetPage
  // restarts it on the new page.
  function closeMenu() {
    if (!open) return;
    open = false;
    lockScroll(false);
    if (bg) gsap.to(bg, { autoAlpha: 0, duration: 0.4, ease: 'osmo' });
    syncIcon(false);
    gsap.to(menu, {
      clipPath: CLIP_HIDDEN,
      duration: 0.45,
      ease: 'osmo',
      onComplete: () => {
        if (!open) gsap.set(wrap, { autoAlpha: 0, pointerEvents: 'none' }); // guard against a quick re-open
      }
    });
  }

  const toggle = () => (open ? closeMenu() : openMenu());

  // Exposed so Barba's beforeLeave can clip the menu out when a link triggers a
  // page transition (fire-and-forget, concurrent — see closeMenu).
  closeMobileMenu = closeMenu;

  buttons.forEach(({ btn }) => {
    // A toggle inside [form-close] already closes via the closer handler below —
    // binding the toggle here too would close then instantly re-open.
    if (btn.closest('[form-close]')) return;
    btn.addEventListener('click', toggle);
  });

  // Dedicated close buttons + backdrop.
  document.querySelectorAll('[form-close]').forEach((el) => el.addEventListener('click', () => closeMenu()));
  if (bg) bg.addEventListener('click', () => closeMenu());

  // Close the menu the INSTANT a link inside it is tapped. Barba's beforeLeave
  // only fires after the next page is fetched (~1s on mobile), which left the
  // menu hanging open. Capture phase runs before Barba's own click handler, so
  // the clip-out starts immediately and overlaps the page fetch + transition.
  menu.addEventListener('click', (e) => {
    if (open && e.target.closest('a[href]')) closeMenu();
  }, true);
}


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
  // Discover every toggle/panel pair by the shared "key" class (employer,
  // candidate, recruiter, …) so new tabs work with no code changes — just add
  // a matching .faq_toggle_inner.KEY and .accordion-css.KEY in Webflow.
  const toggleEls = Array.from(document.querySelectorAll('.faq_toggle_inner'));

  const keys = [];
  const toggles = {};
  const panels = {};

  toggleEls.forEach((toggleEl) => {
    // The key is whichever class on the toggle has a matching .accordion-css panel.
    Array.from(toggleEl.classList).some((cls) => {
      if (cls === 'faq_toggle_inner' || cls === 'is-active') return false;
      const panel = document.querySelector(`.accordion-css.${cls}`);
      if (!panel) return false;
      keys.push(cls);
      toggles[cls] = toggleEl;
      panels[cls] = panel;
      return true; // stop at the first matching class
    });
  });

  // Need at least two tabs for a toggle to be meaningful.
  if (keys.length < 2) return;

  const getItems = (panel) => Array.from(panel.querySelectorAll(':scope > *'));

  let activeKey = keys.find((k) => toggles[k].classList.contains('is-active')) || keys[0];

  let isAnimating = false;

  function setInitialState(activeK) {
    keys.forEach((key) => {
      const isActive = key === activeK;
      const panel = panels[key];

      gsap.set(panel, isActive
        ? { display: 'block', autoAlpha: 1, height: 'auto' }
        : { display: 'none', autoAlpha: 0 });
      gsap.set(getItems(panel), isActive ? { autoAlpha: 1, y: 0 } : { autoAlpha: 0, y: 12 });

      toggles[key].classList.toggle('is-active', isActive);
    });
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

  keys.forEach((key) => {
    toggles[key].addEventListener('click', () => switchTo(key));
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
    // Constant duration; the stagger comes from delay alone. (Previously
    // duration shrank per item, so later reveals snapped in near-instantly.)
    gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: DURATION, ease: 'reveal', delay: baseDelay + offset });
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
  // Hero parallax runs on tablet+ only. gsap.matchMedia builds the ScrollTriggers
  // when the query matches and reverts them (kills triggers + clears inline
  // transforms) below 768px, so mobile gets a static hero.
  gsap.matchMedia().add('(min-width: 768px)', () => {
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
  // Webflow embeds Vimeo through an embedly wrapper iframe. We pull the real
  // player.vimeo.com URL out of it once, then drive play/stop purely through the
  // iframe's `autoplay` param: reload with autoplay=1 on open, without it on
  // close. This avoids the SDK's async handshake (which loses the click gesture).

  // Pull the real player.vimeo.com URL out of an embedly (or direct) iframe.
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

  function withAutoplay(url, on) {
    try {
      const u = new URL(url, location.href);
      if (on) u.searchParams.set('autoplay', '1');
      else u.searchParams.delete('autoplay');
      return u.toString();
    } catch (_) {
      return url;
    }
  }

  // Get the modal's Vimeo iframe, converting the embedly wrapper to a native
  // Vimeo iframe the first time. The base URL is cached on a data attribute.
  function getVimeoIframe(modal) {
    const existing = modal.querySelector('iframe');
    if (!existing) return null;
    if (existing.dataset.vimeoBase) return existing;

    const vsrc = vimeoSrcFromIframe(existing);
    if (!vsrc) return null;
    const base = withAutoplay(vsrc, false); // normalize: never autoplay by default

    const iframe = document.createElement('iframe');
    iframe.src = base;
    iframe.dataset.vimeoBase = base;
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
    const modal = document.querySelector(`[data-modal-name="${name}"]`);
    if (!modal) return;
    const iframe = getVimeoIframe(modal);
    if (!iframe) return;
    iframe.src = withAutoplay(iframe.dataset.vimeoBase, true); // reload + autoplay
  }

  function stopAllVideos() {
    document.querySelectorAll('[data-modal-name]').forEach((modal) => {
      const iframe = modal.querySelector('iframe');
      if (!iframe || !iframe.dataset.vimeoBase) return;
      iframe.src = iframe.dataset.vimeoBase; // reload without autoplay → fully stops
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

      // Lock background scroll (Lenis keeps scrolling under a fixed overlay)
      if (lenis && typeof lenis.stop === 'function') lenis.stop();

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

    // Resume background scroll
    if (lenis && typeof lenis.start === 'function') lenis.start();
  }
}

// PROGRESSIVE BLUR AT PAGE BOTTOM //
// Always-active (bound once): the .progressive-blur lives outside the Barba
// container, so we use a scroll listener rather than a ScrollTrigger (those get
// killed on every page transition). Approaching the bottom of the page the blur
// scrubs smoothly to 0em / 0 opacity; scrolling back up grows it back.
function initProgressiveBlurScroll() {
  const blurs = Array.from(document.querySelectorAll('.progressive-blur'));
  if (!blurs.length) return;

  const RANGE = 300; // px before the bottom over which it fades out

  // Measure each element's natural height (with any inline height cleared).
  const measure = (el) => {
    const prev = el.style.height;
    el.style.height = '';
    const h = parseFloat(getComputedStyle(el).height) || 0;
    el.style.height = prev;
    return h;
  };
  let heights = blurs.map(measure);

  // Smoothed setters so the value eases even with abrupt scroll/momentum.
  const setH = blurs.map((el) => gsap.quickTo(el, 'height', { duration: 0.4, ease: 'osmo' }));
  const setO = blurs.map((el) => gsap.quickTo(el, 'opacity', { duration: 0.4, ease: 'osmo' }));

  function update() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const distance = maxScroll - window.scrollY; // px remaining to the bottom

    // Fade only over the last RANGE px — but never more than the page can scroll,
    // so short pages stay fully visible at the top instead of starting collapsed.
    const range = Math.min(RANGE, maxScroll);
    const progress = maxScroll <= 0 ? 0 : gsap.utils.clamp(0, 1, 1 - distance / range);

    blurs.forEach((el, i) => {
      setH[i](heights[i] * (1 - progress));
      setO[i](1 - progress);
    });
  }

  function onResize() {
    heights = blurs.map(measure);
    update();
  }

  // Lenis drives scrolling; fall back to native scroll if it isn't present.
  if (lenis && typeof lenis.on === 'function') {
    lenis.on('scroll', update);
  } else {
    window.addEventListener('scroll', update, { passive: true });
  }
  window.addEventListener('resize', onResize);

  // scrollHeight isn't final until content/images load (and it changes per Barba
  // page), so re-evaluate once everything settles.
  window.addEventListener('load', update);

  update(); // set the correct initial state
}

// DRAGGABLE MARQUEE (DIRECTIONAL) //
function initDraggableMarquee() {
  const wrappers = document.querySelectorAll("[data-draggable-marquee-init]");

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute("data-draggable-marquee-init") === "initialized") return;

    const collection = wrapper.querySelector("[data-draggable-marquee-collection]");
    const list = wrapper.querySelector("[data-draggable-marquee-list]");
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, "data-duration", 20);
    const multiplier = getNumberAttr(wrapper, "data-multiplier", 40);
    const sensitivity = getNumberAttr(wrapper, "data-sensitivity", 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute("data-draggable-marquee-clone", "");
      listClone.setAttribute("aria-hidden", "true");
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: "none",
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + "px"
      },
    });

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (wrapper.getAttribute("data-direction") || "left").toLowerCase();
    const baseDirection = initialDirectionAttr === "right" ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute("data-direction", baseDirection < 0 ? "right" : "left");

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute("data-direction", timeScale.value < 0 ? "right" : "left");
    }

    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: "pointer,touch",
      preventDefault: true,
      debounce: false,
      onChangeX: (observerEvent) => {
        let velocityTimeScale = observerEvent.velocityX * -sensitivity;
        velocityTimeScale = gsap.utils.clamp(-multiplier, multiplier, velocityTimeScale);

        gsap.killTweensOf(timeScale);

        const restingDirection = velocityTimeScale < 0 ? -1 : 1;

        gsap.timeline({ onUpdate: applyTimeScale })
          .to(timeScale, { value: velocityTimeScale, duration: 0.1, overwrite: true })
          .to(timeScale, { value: restingDirection, duration: 1.0 });
      }
    });

    // Pause marquee when scrolled out of view
    ScrollTrigger.create({
      trigger: wrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onEnterBack: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onLeave: () => { marqueeLoop.pause(); marqueeObserver.disable(); },
      onLeaveBack: () => { marqueeLoop.pause(); marqueeObserver.disable(); }
    });

    wrapper.setAttribute("data-draggable-marquee-init", "initialized");
  });
}

// SWIPER SLIDER //
function initSwiperSlider() {
  const swiperSliderGroups = document.querySelectorAll("[data-swiper-group]");

  swiperSliderGroups.forEach((swiperGroup) => {
    const swiperSliderWrap = swiperGroup.querySelector("[data-swiper-wrap]");
    if (!swiperSliderWrap) return;

    const prevButton = swiperGroup.querySelector("[data-swiper-prev]");
    const nextButton = swiperGroup.querySelector("[data-swiper-next]");

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 1.25,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      breakpoints: {
        // when window width is >= 480px
        480: {
          slidesPerView: 1.8,
        },
        // when window width is >= 992px
        992: {
          slidesPerView: 3.5,
        }
      },
      navigation: {
        nextEl: nextButton,
        prevEl: prevButton,
      },
      pagination: {
        el: '.swiper-pagination',
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

// BASIC FILTER //
function initFilterBasic() {
  // Find all filter groups on the page
  const groups = document.querySelectorAll('[data-filter-group]');

  groups.forEach((group) => {
    const buttons = group.querySelectorAll('[data-filter-target]');
    const items = group.querySelectorAll('[data-filter-name]');
    const transitionDelay = 300; // Delay for transition effect (in milliseconds)

    // Function to update the status and accessibility attributes of items
    const updateStatus = (element, shouldBeActive) => {
      // If the item should be active, set it to "active", otherwise "not-active"
      element.setAttribute('data-filter-status', shouldBeActive ? 'active' : 'not-active');
      element.setAttribute('aria-hidden', shouldBeActive ? 'false' : 'true');
    };

    // Function to handle filtering logic when a button is clicked
    const handleFilter = (target) => {
      // Loop through all items and ensure every item transitions out first
      items.forEach((item) => {
        const shouldBeActive = target === 'all' || item.getAttribute('data-filter-name') === target;
        const currentStatus = item.getAttribute('data-filter-status');

        // Only transition items currently visible (status: active)
        if (currentStatus === 'active') {
          item.setAttribute('data-filter-status', 'transition-out');
          // After the transition delay, set the final status
          setTimeout(() => updateStatus(item, shouldBeActive), transitionDelay);
        } else {
          // For items not currently visible, simply update their status after the delay
          setTimeout(() => updateStatus(item, shouldBeActive), transitionDelay);
        }
      });

      // Update the active status for all buttons
      buttons.forEach((button) => {
        const isActive = button.getAttribute('data-filter-target') === target;
        button.setAttribute('data-filter-status', isActive ? 'active' : 'not-active');
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false'); // Accessibility: indicate active state
      });
    };

    // Attach click event listeners to each button
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-filter-target');

        // If the button is already active, do nothing
        if (button.getAttribute('data-filter-status') === 'active') return;

        // Trigger the filter logic with the selected target
        handleFilter(target);
      });
    });
  });
}

// RESOURCE ITEM HOVER //
function initResourceHover() {
  document.querySelectorAll('[resource-item]').forEach((item) => {
    const img = item.querySelector('[resource-img]');
    const line = item.querySelector('[resource-line]');

    // 'osmo' === cubic-bezier(0.625, 0.05, 0, 1); 0.735s matches the source timing.
    const tl = gsap.timeline({
      paused: true,
      defaults: { duration: 0.735, ease: 'osmo' }
    });

    if (img) tl.to(img, { scale: 1.05 }, 0);
    if (line) tl.fromTo(line, { width: '0%' }, { width: '100%' }, 0);

    item.addEventListener('mouseenter', () => tl.play());
    item.addEventListener('mouseleave', () => tl.reverse());
  });
}

// STICKY CARD STACK //
// Each [card-sticky] is position: sticky; top: 27vh. As a card reaches that
// sticky point and the next card stacks over it, it recedes — scale 0.9,
// opacity drop, and blur — so the active (top) card always reads as foreground.
function initStickyCardStack() {
  const cards = gsap.utils.toArray('[card-sticky]');

  cards.forEach((card, i) => {
    const next = cards[i + 1];

    // No card stacks over the last one, so it never needs to recede.
    if (!next) return;

    if (reducedMotion) return;

    gsap.fromTo(
      card,
      { scale: 1, opacity: 1, filter: 'blur(0px)' },
      {
        scale: 0.9,
        opacity: 0.6,
        filter: 'blur(6px)',
        ease: 'none', // scrub drives the progress; keep the mapping linear
        scrollTrigger: {
          trigger: card,
          start: 'top 27%',      // card hits its sticky point (27vh)
          endTrigger: next,
          end: 'top 27%',        // next card has reached the sticky point on top
          scrub: true
        }
      }
    );
  });
}