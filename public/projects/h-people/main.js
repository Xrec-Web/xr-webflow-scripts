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
  if (document.querySelector('[data-underlay-nav-toggle]')) initMobileMenu();
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs before the enter animation
  // if (has('[data-something]')) initSomething();
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;
  
  // Runs after enter animation completes
  // if (has('[data-something]')) initSomething();
  
  
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
