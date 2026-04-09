// Client: H People
// Project: [Project Name]
// Description: [Description]

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

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
  if (document.querySelector('[data-video-on-hover]')) initPlayVideoHover();
  if (document.querySelector('[data-reveal], [data-reveal-clip]')) initReveal();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('.cursor')) initDynamicCustomTextCursor();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
  if (document.querySelector('.faq_toggle_inner')) initFAQToggle();
});


// ─── Functions ────────────────────────────────────────────────────────────────

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