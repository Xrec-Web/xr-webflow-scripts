// Client: [Client Name]
// Project: [Project Name]
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
  if (document.querySelector('[data-reveal], [data-reveal-load]')) initReveal();
});


// ─── FUNCTIONS ───────────────────────────────────────────────────────────────

// EXAMPLE //
function initExample() {
  // ...
}

// TEXT REVEAL //
function initReveal() {
  const FROM = { y: '1rem', opacity: 0 };
  const TO   = { y: '0rem', opacity: 1, ease: 'reveal' };

  // Scroll-triggered
  document.querySelectorAll('[data-reveal]:not([data-reveal-load])').forEach(el => {
    gsap.fromTo(el, FROM, {
      ...TO,
      duration: 0.9,
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top 85%)',
        once: true
      }
    });
  });

  // Load (hero elements — no ScrollTrigger)
  document.querySelectorAll('[data-reveal-load]').forEach((el, i) => {
    gsap.fromTo(el, FROM, {
      ...TO,
      duration: 0.9,
      delay: 0.1 + i * 0.08
    });
  });
}
