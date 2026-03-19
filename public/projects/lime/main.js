// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer);

// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


// ─── INIT ────────────────────────────────────────────────────────────────────
// Each init is guarded — only runs if its trigger element exists on the page.

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-reveal]'))               initMaskTextScrollReveal();
  if (document.querySelector('.cursor'))                     initDynamicCustomTextCursor();
  if (document.querySelector('[data-video-on-hover]'))       initPlayVideoHover();
  if (document.querySelector('[data-momentum-hover-init]'))  initMomentumBasedHover();
  if (document.querySelector('[data-draggable-marquee-init]')) initDraggableMarquee();
  if (document.querySelector('.h-process_grid'))             initProcessBlockTopFade();
  if (document.querySelector('[filter-list="categories"]'))  initCategoryFilters();
});

// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// SCROLL SPLIT TEXT + IMG REVEAL //
const splitConfig = {
  lines: { duration: 0.8, stagger: 0.08 },
  words: { duration: 0.6, stagger: 0.06 },
  chars: { duration: 0.4, stagger: 0.01 }
};

// TEXT REVEAL //
function initMaskTextScrollReveal() {
  document.querySelectorAll('[data-reveal]').forEach((el) => {
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
        const targets = instance[safeType];
        const config = splitConfig[safeType];

        gsap.from(targets, {
          yPercent: 110,
          duration: config.duration,
          stagger: config.stagger,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'clamp(top 80%)',
            once: true
          }
        });
      }
    });
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

// VIDEO AUTOPLAY HOVER //
function initPlayVideoHover() {
  const wrappers = document.querySelectorAll('[data-video-on-hover]');

  wrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const src = wrapper.getAttribute('data-video-src') || '';
    if (!video || !src) return;

    wrapper.addEventListener('mouseenter', () => {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', src);
      }
      wrapper.dataset.videoOnHover = 'active';
      video.play().catch(err => {
        console.warn('play on hover is blocked:', err);
      });
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.dataset.videoOnHover = 'not-active';
      setTimeout(() => {
        video.pause();
        video.currentTime = 0;
      }, 200);
    });
  });
}

// MOMENTUM BASED HOVER //
function initMomentumBasedHover() {

  // If this device can't hover with a fine pointer, stop here
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) { return; }

  // Configuration (tweak these for feel)
  const xyMultiplier       = 30;  // multiplies pointer velocity for x/y movement
  const rotationMultiplier = 20;  // multiplies normalized torque for rotation speed
  const inertiaResistance  = 200; // higher = stops sooner

  // Pre-build clamp functions for performance
  const clampXY  = gsap.utils.clamp(-1080, 1080);
  const clampRot = gsap.utils.clamp(-60, 60);

  // Initialize each root container
  document.querySelectorAll('[data-momentum-hover-init]').forEach(root => {
    let prevX = 0, prevY = 0;
    let velX  = 0, velY  = 0;
    let rafId = null;

    // Track pointer velocity (throttled to RAF)
    root.addEventListener('mousemove', e => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        velX = e.clientX - prevX;
        velY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        rafId = null;
      });
    });

    // Attach hover inertia to each child element
    root.querySelectorAll('[data-momentum-hover-element]').forEach(el => {
      el.addEventListener('mouseenter', e => {
        const target = el.querySelector('[data-momentum-hover-target]');
        if (!target) return;

        // Compute offset from center to pointer
        const { left, top, width, height } = target.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        // Compute raw torque (px²/frame)
        const rawTorque = offsetX * velY - offsetY * velX;

        // Normalize torque so rotation ∝ pointer speed (deg/sec)
        const leverDist    = Math.hypot(offsetX, offsetY) || 1;
        const angularForce = rawTorque / leverDist;

        // Calculate and clamp velocities
        const velocityX        = clampXY(velX * xyMultiplier);
        const velocityY        = clampXY(velY * xyMultiplier);
        const rotationVelocity = clampRot(angularForce * rotationMultiplier);

        // Apply GSAP inertia tween
        gsap.to(target, {
          inertia: {
            x:        { velocity: velocityX,        end: 0 },
            y:        { velocity: velocityY,        end: 0 },
            rotation: { velocity: rotationVelocity, end: 0 },
            resistance: inertiaResistance
          }
        });
      });
    });
  });
}

// DRAGGABLE MARQUEE //
function initDraggableMarquee() {
  const wrappers = document.querySelectorAll('[data-draggable-marquee-init]');

  const getNumberAttr = (el, name, fallback) => {
    const value = parseFloat(el.getAttribute(name));
    return Number.isFinite(value) ? value : fallback;
  };

  wrappers.forEach((wrapper) => {
    if (wrapper.getAttribute('data-draggable-marquee-init') === 'initialized') return;

    const collection = wrapper.querySelector('[data-draggable-marquee-collection]');
    const list = wrapper.querySelector('[data-draggable-marquee-list]');
    if (!collection || !list) return;

    const duration = getNumberAttr(wrapper, 'data-duration', 20);
    const multiplier = getNumberAttr(wrapper, 'data-multiplier', 40);
    const sensitivity = getNumberAttr(wrapper, 'data-sensitivity', 0.01);

    const wrapperWidth = wrapper.getBoundingClientRect().width;
    const listWidth = list.scrollWidth || list.getBoundingClientRect().width;
    if (!wrapperWidth || !listWidth) return;

    // Make enough duplicates to cover screen
    const minRequiredWidth = wrapperWidth + listWidth + 2;
    while (collection.scrollWidth < minRequiredWidth) {
      const listClone = list.cloneNode(true);
      listClone.setAttribute('data-draggable-marquee-clone', '');
      listClone.setAttribute('aria-hidden', 'true');
      collection.appendChild(listClone);
    }

    const wrapX = gsap.utils.wrap(-listWidth, 0);

    gsap.set(collection, { x: 0 });

    const marqueeLoop = gsap.to(collection, {
      x: -listWidth,
      duration,
      ease: 'none',
      repeat: -1,
      onReverseComplete: () => marqueeLoop.progress(1),
      modifiers: {
        x: (x) => wrapX(parseFloat(x)) + 'px'
      },
    });

    // Direction can be used for css + set initial direction on load
    const initialDirectionAttr = (wrapper.getAttribute('data-direction') || 'left').toLowerCase();
    const baseDirection = initialDirectionAttr === 'right' ? -1 : 1;

    const timeScale = { value: 1 };

    timeScale.value = baseDirection;
    wrapper.setAttribute('data-direction', baseDirection < 0 ? 'right' : 'left');

    if (baseDirection < 0) marqueeLoop.progress(1);

    function applyTimeScale() {
      marqueeLoop.timeScale(timeScale.value);
      wrapper.setAttribute('data-direction', timeScale.value < 0 ? 'right' : 'left');
    }

    applyTimeScale();

    // Drag observer
    const marqueeObserver = Observer.create({
      target: wrapper,
      type: 'pointer,touch',
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
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onEnterBack: () => { marqueeLoop.resume(); applyTimeScale(); marqueeObserver.enable(); },
      onLeave: () => { marqueeLoop.pause(); marqueeObserver.disable(); },
      onLeaveBack: () => { marqueeLoop.pause(); marqueeObserver.disable(); }
    });

    wrapper.setAttribute('data-draggable-marquee-init', 'initialized');
  });
}

// CATEGORY FILTERS //
function initCategoryFilters() {
  const list = document.querySelector('[filter-list="categories"]');
  if (!list) return;

  // Collect unique category names from all data-item elements
  const categories = [...new Set(
    [...document.querySelectorAll('[data-item="categories"]')]
      .map(el => el.textContent.trim())
      .filter(text => text.length > 0)
  )];

  // Clear existing filter items
  list.querySelectorAll('[filter-item="categories"]').forEach(el => el.remove());

  // Populate one checkbox per unique category
  categories.forEach(category => {
    const label = document.createElement('label');
    label.setAttribute('filter-item', 'categories');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = category;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(category));
    list.appendChild(label);
  });
}


// PROCESS BLOCK TOP FADE //
function initProcessBlockTopFade() {
  // Exclude the last item
  const blocks = gsap.utils.toArray(
    '.h-process_grid .h-process_block:not(.last)'
  );

  if (!blocks.length) return;

  blocks.forEach((block) => {

    gsap.set(block, {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transformOrigin: '50% 0%'
    });

    gsap.to(block, {
      scale: 0.92,
      opacity: 0,
      filter: 'blur(10px)',
      ease: 'none',
      scrollTrigger: {
        trigger: block,
        start: 'top 10%',
        end: 'top -20%',
        scrub: true
      }
    });

  });
}
