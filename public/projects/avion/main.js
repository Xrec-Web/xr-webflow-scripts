// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger, SplitText);

// Lenis — Smooth Scrolling
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Initialize all functions on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-btn-hover]'))             initDirectionalButtonHover();
  if (document.querySelector('[data-progress-nav-list]'))    initProgressNavigation();
  if (document.querySelector('.progress-nav'))               initProgressNavTheme();
  if (document.querySelector('[data-accordion-css-init]'))   initAccordionCSS();
  if (document.querySelector('[data-footer-parallax]'))      initFooterParallax();
  if (document.querySelector('[data-button-animate-chars]')) initButtonCharacterStagger();
  if (document.querySelector('[data-reveal-group]'))         initContentRevealScroll();
  if (document.querySelector('[data-sticky-title="wrap"]'))  initStickyTitleScroll();
  if (document.querySelector('.process_item'))               initProcessItemsScroll();
  if (document.querySelector('[data-logo-wall-cycle-init]')) initLogoWallCycle();
  if (document.querySelector('.swiper'))                     initSwiperTestimonials();
});


// ─── Functions ────────────────────────────────────────────────────────────────

function initDirectionalButtonHover() {
  if (!document.querySelector('[data-btn-hover]')) return;

  document.querySelectorAll('[data-btn-hover]').forEach(button => {
    button.addEventListener('mouseenter', handleHover);
    button.addEventListener('mouseleave', handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    const circle = button.querySelector('.btn__circle');
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

function initProgressNavigation() {
  if (!document.querySelector('[data-progress-nav-list]')) return;

  let navProgress = document.querySelector('[data-progress-nav-list]');

  let indicator = navProgress.querySelector('.progress-nav__indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'progress-nav__indicator';
    navProgress.appendChild(indicator);
  }

  function updateIndicator(activeLink) {
    let parentWidth = navProgress.offsetWidth;
    let parentHeight = navProgress.offsetHeight;

    let parentRect = navProgress.getBoundingClientRect();
    let linkRect = activeLink.getBoundingClientRect();
    let linkPos = {
      left: linkRect.left - parentRect.left,
      top: linkRect.top - parentRect.top
    };

    let linkWidth = activeLink.offsetWidth;
    let linkHeight = activeLink.offsetHeight;

    let leftPercent = (linkPos.left / parentWidth) * 100;
    let topPercent = (linkPos.top / parentHeight) * 100;
    let widthPercent = (linkWidth / parentWidth) * 100;
    let heightPercent = (linkHeight / parentHeight) * 100;

    indicator.style.left = leftPercent + '%';
    indicator.style.top = topPercent + '%';
    indicator.style.width = widthPercent + '%';
    indicator.style.height = heightPercent + '%';
  }

  let progressAnchors = gsap.utils.toArray('[data-progress-nav-anchor]');

  progressAnchors.forEach((progressAnchor) => {
    let anchorID = progressAnchor.getAttribute('id');

    ScrollTrigger.create({
      trigger: progressAnchor,
      start: '0% 50%',
      end: '100% 50%',
      onEnter: () => {
        let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
        activeLink.classList.add('is--active');
        let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
        siblings.forEach((sib) => {
          if (sib !== activeLink) sib.classList.remove('is--active');
        });
        updateIndicator(activeLink);
      },
      onEnterBack: () => {
        let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
        activeLink.classList.add('is--active');
        let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
        siblings.forEach((sib) => {
          if (sib !== activeLink) sib.classList.remove('is--active');
        });
        updateIndicator(activeLink);
      }
    });
  });
}

function initProgressNavTheme() {
  if (!document.querySelector('.progress-nav')) return;

  const progressNav = document.querySelector('.progress-nav');
  let currentTheme = null;

  function animateThemeChange(themeClass) {
    if (themeClass === currentTheme) return;
    currentTheme = themeClass;

    const tl = gsap.timeline({ defaults: { duration: 0.05, ease: 'power3.out' } });

    tl.to(progressNav, { autoAlpha: 0, overwrite: 'auto' })
      .add(() => {
        progressNav.classList.remove('u-theme-dark', 'u-theme-light');
        progressNav.classList.add(themeClass);
      })
      .fromTo(progressNav, { autoAlpha: 0 }, { autoAlpha: 1 });
  }

  // Trigger theme switch at 15% scroll depth
  ScrollTrigger.create({
    start: 'top+=15% top',
    end: 'top+=15% top',
    onEnter:     () => animateThemeChange('u-theme-light'),
    onLeaveBack: () => animateThemeChange('u-theme-dark'),
  });
}

function initAccordionCSS() {
  if (!document.querySelector('[data-accordion-css-init]')) return;

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

function initFooterParallax() {
  if (!document.querySelector('[data-footer-parallax]')) return;

  document.querySelectorAll('[data-footer-parallax]').forEach(el => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top bottom)',
        end: 'clamp(top top)',
        scrub: true
      }
    });

    const inner = el.querySelector('[data-footer-parallax-inner]');
    const dark  = el.querySelector('[data-footer-parallax-dark]');

    if (inner) {
      tl.from(inner, { yPercent: -25, ease: 'linear' });
    }

    if (dark) {
      tl.from(dark, { opacity: 0.5, ease: 'linear' }, '<');
    }
  });
}

function initButtonCharacterStagger() {
  if (!document.querySelector('[data-button-animate-chars]')) return;

  const offsetIncrement = 0.01;
  const buttons = document.querySelectorAll('[data-button-animate-chars]');

  buttons.forEach(button => {
    const text = button.textContent;
    button.innerHTML = '';

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      if (char === ' ') {
        span.style.whiteSpace = 'pre';
      }

      button.appendChild(span);
    });
  });
}

function initContentRevealScroll() {
  if (!document.querySelector('[data-reveal-group]')) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {

    document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000;
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      const animDuration = 0.8;
      const animEase = 'power4.inOut';

      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
        return;
      }

      const directChildren = Array.from(groupEl.children).filter(el => el.nodeType === 1);
      if (!directChildren.length) {
        gsap.set(groupEl, { y: groupDistance, autoAlpha: 0 });
        ScrollTrigger.create({
          trigger: groupEl,
          start: triggerStart,
          once: true,
          onEnter: () => gsap.to(groupEl, {
            y: 0,
            autoAlpha: 1,
            duration: animDuration,
            ease: animEase,
            onComplete: () => gsap.set(groupEl, { clearProps: 'all' })
          })
        });
        return;
      }

      const slots = [];
      directChildren.forEach(child => {
        const nestedGroup = child.matches('[data-reveal-group-nested]')
          ? child
          : child.querySelector(':scope [data-reveal-group-nested]');

        if (nestedGroup) {
          const includeParent = child.getAttribute('data-ignore') === 'false' || nestedGroup.getAttribute('data-ignore') === 'false';
          slots.push({ type: 'nested', parentEl: child, nestedEl: nestedGroup, includeParent });
        } else {
          slots.push({ type: 'item', el: child });
        }
      });

      slots.forEach(slot => {
        if (slot.type === 'item') {
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const d = isNestedSelf ? groupDistance : (slot.el.getAttribute('data-distance') || groupDistance);
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
          Array.from(slot.nestedEl.children).forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
        }
      });

      slots.forEach(slot => {
        if (slot.type === 'nested' && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance });
        }
      });

      ScrollTrigger.create({
        trigger: groupEl,
        start: triggerStart,
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();

          slots.forEach((slot, slotIndex) => {
            const slotTime = slotIndex * groupStaggerSec;

            if (slot.type === 'item') {
              tl.to(slot.el, {
                y: 0,
                autoAlpha: 1,
                duration: animDuration,
                ease: animEase,
                onComplete: () => gsap.set(slot.el, { clearProps: 'all' })
              }, slotTime);
            } else {
              if (slot.includeParent) {
                tl.to(slot.parentEl, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
                }, slotTime);
              }
              const nestedMs = parseFloat(slot.nestedEl.getAttribute('data-stagger'));
              const nestedStaggerSec = isNaN(nestedMs) ? groupStaggerSec : nestedMs / 1000;
              Array.from(slot.nestedEl.children).forEach((nestedChild, nestedIndex) => {
                tl.to(nestedChild, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(nestedChild, { clearProps: 'all' })
                }, slotTime + nestedIndex * nestedStaggerSec);
              });
            }
          });
        }
      });
    });

  });

  return () => ctx.revert();
}

function initStickyTitleScroll() {
  if (!document.querySelector('[data-sticky-title="wrap"]')) return;

  const wraps = document.querySelectorAll('[data-sticky-title="wrap"]');

  wraps.forEach(wrap => {
    const headings = Array.from(wrap.querySelectorAll('[data-sticky-title="heading"]'));

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: 'top 40%',
        end: 'bottom bottom',
        scrub: true,
      }
    });

    const revealDuration = 0.7,
          fadeOutDuration = 0.7,
          overlapOffset = 0.15;

    headings.forEach((heading, index) => {
      heading.setAttribute('aria-label', heading.textContent);

      const split = new SplitText(heading, { type: 'words,chars' });
      split.words.forEach(word => word.setAttribute('aria-hidden', 'true'));

      gsap.set(heading, { visibility: 'visible' });

      const headingTl = gsap.timeline();
      headingTl.from(split.chars, {
        autoAlpha: 0,
        stagger: { amount: revealDuration, from: 'start' },
        duration: revealDuration
      });

      if (index < headings.length - 1) {
        headingTl.to(split.chars, {
          autoAlpha: 0,
          stagger: { amount: fadeOutDuration, from: 'end' },
          duration: fadeOutDuration
        });
      }

      if (index === 0) {
        masterTl.add(headingTl);
      } else {
        masterTl.add(headingTl, `-=${overlapOffset}`);
      }
    });
  });
}

function initProcessItemsScroll() {
  if (!document.querySelector('.process_item')) return;

  const items = gsap.utils
    .toArray('.process_item')
    .filter(item => !item.classList.contains('last'));

  if (!items.length) return;

  items.forEach((item) => {
    gsap.fromTo(
      item,
      {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)'
      },
      {
        scale: 0.9,
        opacity: 0,
        filter: 'blur(12px)',
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top top+=10%',
          end: 'top top-=20%',
          scrub: true,
          // markers: true,
        }
      }
    );
  });
}

function initLogoWallCycle() {
  if (!document.querySelector('[data-logo-wall-cycle-init]')) return;

  const loopDelay = 1.5;
  const duration  = 0.9;

  document.querySelectorAll('[data-logo-wall-cycle-init]').forEach(root => {
    const list   = root.querySelector('[data-logo-wall-list]');
    const items  = Array.from(list.querySelectorAll('[data-logo-wall-item]'));

    const shuffleFront = root.getAttribute('data-logo-wall-shuffle') !== 'false';
    const originalTargets = items
      .map(item => item.querySelector('[data-logo-wall-target]'))
      .filter(Boolean);

    let visibleItems  = [];
    let visibleCount  = 0;
    let pool          = [];
    let pattern       = [];
    let patternIndex  = 0;
    let tl;

    function isVisible(el) {
      return window.getComputedStyle(el).display !== 'none';
    }

    function shuffleArray(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function setup() {
      if (tl) tl.kill();

      visibleItems = items.filter(isVisible);
      visibleCount = visibleItems.length;

      pattern = shuffleArray(Array.from({ length: visibleCount }, (_, i) => i));
      patternIndex = 0;

      items.forEach(item => {
        item.querySelectorAll('[data-logo-wall-target]').forEach(old => old.remove());
      });

      pool = originalTargets.map(n => n.cloneNode(true));

      let front, rest;
      if (shuffleFront) {
        const shuffledAll = shuffleArray(pool);
        front = shuffledAll.slice(0, visibleCount);
        rest  = shuffleArray(shuffledAll.slice(visibleCount));
      } else {
        front = pool.slice(0, visibleCount);
        rest  = shuffleArray(pool.slice(visibleCount));
      }
      pool = front.concat(rest);

      for (let i = 0; i < visibleCount; i++) {
        const parent =
          visibleItems[i].querySelector('[data-logo-wall-target-parent]') ||
          visibleItems[i];
        parent.appendChild(pool.shift());
      }

      tl = gsap.timeline({ repeat: -1, repeatDelay: loopDelay });
      tl.call(swapNext);
      tl.play();
    }

    function swapNext() {
      const nowCount = items.filter(isVisible).length;
      if (nowCount !== visibleCount) {
        setup();
        return;
      }
      if (!pool.length) return;

      const idx = pattern[patternIndex % visibleCount];
      patternIndex++;

      const container = visibleItems[idx];
      const parent =
        container.querySelector('[data-logo-wall-target-parent]') ||
        container.querySelector('*:has(> [data-logo-wall-target])') ||
        container;
      const existing = parent.querySelectorAll('[data-logo-wall-target]');
      if (existing.length > 1) return;

      const current  = parent.querySelector('[data-logo-wall-target]');
      const incoming = pool.shift();

      gsap.set(incoming, { yPercent: 50, autoAlpha: 0 });
      parent.appendChild(incoming);

      if (current) {
        gsap.to(current, {
          yPercent: -50,
          autoAlpha: 0,
          duration,
          ease: 'expo.inOut',
          onComplete: () => {
            current.remove();
            pool.push(current);
          }
        });
      }

      gsap.to(incoming, {
        yPercent: 0,
        autoAlpha: 1,
        duration,
        delay: 0.1,
        ease: 'expo.inOut'
      });
    }

    setup();

    ScrollTrigger.create({
      trigger: root,
      start: 'top bottom',
      end: 'bottom top',
      onEnter:     () => tl.play(),
      onLeave:     () => tl.pause(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.pause()
    });

    document.addEventListener('visibilitychange', () =>
      document.hidden ? tl.pause() : tl.play()
    );
  });
}

function initSwiperTestimonials() {
  if (!document.querySelector('.swiper')) return;

  const swiperEl = document.querySelector('.swiper');
  const originalSlideCount = swiperEl
    ? swiperEl.querySelectorAll('.swiper-wrapper > .swiper-slide').length
    : 0;

  const splitCache = new Map();

  function initSplits(slides) {
    slides.forEach(function (slide) {
      if (splitCache.has(slide)) return;

      const quoteEl   = slide.querySelector('[data-split="quote"]');
      const nameEl    = slide.querySelector('[data-split="name"]');
      const roleEl    = slide.querySelector('[data-split="role"]');
      const profileEl = slide.querySelector('.test_profile_wrap');

      const splits = { profileEl };

      if (quoteEl) {
        splits.quote = new SplitText(quoteEl, { type: 'lines,words' });
        gsap.set(quoteEl, { opacity: 1 });
        gsap.set(splits.quote.words, { opacity: 0, y: 30 });
      }

      if (nameEl) {
        splits.name = new SplitText(nameEl, { type: 'chars' });
        gsap.set(nameEl, { opacity: 1 });
        gsap.set(splits.name.chars, { opacity: 0, y: 10 });
      }

      if (roleEl) {
        splits.role = new SplitText(roleEl, { type: 'words' });
        gsap.set(roleEl, { opacity: 1 });
        gsap.set(splits.role.words, { opacity: 0, y: 10 });
      }

      if (profileEl) {
        gsap.set(profileEl, { opacity: 0, y: 20, scale: 0.95 });
      }

      splitCache.set(slide, splits);
    });
  }

  function animateIn(slide) {
    const splits = splitCache.get(slide);
    if (!splits) return;

    const killTargets = [];
    if (splits.profileEl) killTargets.push(splits.profileEl);
    if (splits.quote) killTargets.push(splits.quote.words);
    if (splits.name) killTargets.push(splits.name.chars);
    if (splits.role) killTargets.push(splits.role.words);
    gsap.killTweensOf(killTargets);

    const tl = gsap.timeline({ defaults: { duration: 0.6, ease: 'power3.out' } });

    if (splits.profileEl) {
      tl.fromTo(splits.profileEl, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1 }, 0);
    }

    if (splits.quote) {
      tl.fromTo(splits.quote.words, { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.02 }, 0.05);
    }

    if (splits.name) {
      tl.fromTo(splits.name.chars, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.01 }, '-=0.3');
    }

    if (splits.role) {
      tl.fromTo(splits.role.words, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.03 }, '-=0.3');
    }
  }

  function animateOut(slide) {
    const splits = splitCache.get(slide);
    if (!splits) return;

    const killTargets = [];
    if (splits.profileEl) killTargets.push(splits.profileEl);
    if (splits.quote) killTargets.push(splits.quote.words);
    if (splits.name) killTargets.push(splits.name.chars);
    if (splits.role) killTargets.push(splits.role.words);
    gsap.killTweensOf(killTargets);

    const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power3.in' } });

    if (splits.role) {
      tl.to(splits.role.words, { opacity: 0, y: 10, stagger: { each: 0.03, from: 'end' } }, 0);
    }

    if (splits.name) {
      tl.to(splits.name.chars, { opacity: 0, y: 10, stagger: { each: 0.01, from: 'end' } }, 0.05);
    }

    if (splits.quote) {
      tl.to(splits.quote.words, { opacity: 0, y: 30, stagger: { each: 0.02, from: 'end' } }, 0.1);
    }

    if (splits.profileEl) {
      tl.to(splits.profileEl, { opacity: 0, y: 20, scale: 0.95 }, '-=0.2');
    }
  }

  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    loop: true,
    speed: 600,
    on: {
      init: function () {
        initSplits(this.slides);
        animateIn(this.slides[this.activeIndex]);

        const currentEl = document.querySelector('[data-swiper-current]');
        const totalEl   = document.querySelector('[data-swiper-total]');
        if (currentEl && totalEl) {
          currentEl.textContent = this.realIndex + 1;
          totalEl.textContent = originalSlideCount;
        }
      },
      slideChangeTransitionStart: function () {
        const currentEl = document.querySelector('[data-swiper-current]');
        const totalEl   = document.querySelector('[data-swiper-total]');
        if (currentEl && totalEl) {
          currentEl.textContent = this.realIndex + 1;
          totalEl.textContent = originalSlideCount;
        }

        const prevSlide = this.slides[this.previousIndex];
        if (prevSlide) animateOut(prevSlide);

        const activeSlide = this.slides[this.activeIndex];
        if (activeSlide) animateIn(activeSlide);
      }
    }
  });

  const nextBtn = document.querySelector('.swiper-navigation__button--next');
  const prevBtn = document.querySelector('.swiper-navigation__button--prev');

  if (nextBtn) nextBtn.addEventListener('click', () => swiper.slideNext());
  if (prevBtn) prevBtn.addEventListener('click', () => swiper.slidePrev());
}
