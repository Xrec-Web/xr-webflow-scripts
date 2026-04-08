// Client: [Client Name]
// Project: [Project Name]
// Description: [Description]

// ─── ALWAYS-ON SETUP ────────────────────────────────────────────────────────

gsap.registerPlugin(SplitText, ScrollTrigger, InertiaPlugin, Observer, CustomEase);

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
  if (document.querySelector('[data-example]')) initExample();
  if (document.querySelector('[data-swiper-group]')) initSwiperSlider();
  if (document.querySelector('[data-reveal], [data-reveal-clip]')) initMaskTextScrollReveal();
  if (document.querySelector('[data-reveal-load]')) initLoadReveal();
  if (document.querySelector('.img:not(.no-para)')) initImageScrollEffect();
  if (document.querySelector('[data-current-year]')) initDynamicCurrentYear();
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

    const swiper = new Swiper(swiperSliderWrap, {
      slidesPerView: 1.25,
      speed: 600,
      mousewheel: true,
      grabCursor: true,
      breakpoints: {
        480: { slidesPerView: 1.8 },
        992: { slidesPerView: 3.5 }
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
// IMAGE SCROLL EFFECT //
function initImageScrollEffect() {
  gsap.utils.toArray('.img:not(.no-para)').forEach((img) => {
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
        scrub: true
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
// SCROLL SPLIT TEXT + IMG REVEAL //
const splitConfig = {
  lines: { duration: 1.0, stagger: 0.08 },
  words: { duration: 0.8, stagger: 0.06 },
  chars: { duration: 0.6, stagger: 0.01 }
};
