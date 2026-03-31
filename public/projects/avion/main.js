function initDirectionalButtonHover() {
  if (!document.querySelector('[data-btn-hover]')) return;

  // Button hover animation
  document.querySelectorAll('[data-btn-hover]').forEach(button => {
    button.addEventListener('mouseenter', handleHover);
    button.addEventListener('mouseleave', handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;
    const buttonCenterY = buttonRect.top + buttonHeight / 2;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    // Offset from the center in percentage
    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

    // Convert to absolute values
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    // Update position and size of .btn__circle
    const circle = button.querySelector('.btn__circle');
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

// Initialize Directional Button Hover
document.addEventListener('DOMContentLoaded', function() {
  initDirectionalButtonHover();
});

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);
  
function initProgressNavigation() {
  if (!document.querySelector('[data-progress-nav-list]')) return;

  // Cache the parent container
  let navProgress = document.querySelector('[data-progress-nav-list]');

  // Create or select the moving indicator
  let indicator = navProgress.querySelector('.progress-nav__indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'progress-nav__indicator';
    navProgress.appendChild(indicator);
  }
  
  // Function to update the indicator based on the active nav link
  function updateIndicator(activeLink) {
    let parentWidth = navProgress.offsetWidth;
    let parentHeight = navProgress.offsetHeight;
    
    // Get the active link's position relative to the parent
    let parentRect = navProgress.getBoundingClientRect();
    let linkRect = activeLink.getBoundingClientRect();
    let linkPos = {
      left: linkRect.left - parentRect.left,
      top: linkRect.top - parentRect.top
    };
    
    let linkWidth = activeLink.offsetWidth;
    let linkHeight = activeLink.offsetHeight;
    
    // Calculate percentage values relative to parent dimensions
    let leftPercent = (linkPos.left / parentWidth) * 100;
    let topPercent = (linkPos.top / parentHeight) * 100;
    let widthPercent = (linkWidth / parentWidth) * 100;
    let heightPercent = (linkHeight / parentHeight) * 100;
       
    // Update the indicator with a smooth CSS transition (set in your CSS)
    indicator.style.left = leftPercent + '%';
    indicator.style.top = topPercent + '%';
    indicator.style.width = widthPercent + '%';
    indicator.style.height = heightPercent + '%';
  }
  
  // Get all anchor sections
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
        // Remove 'is--active' class from sibling links
        let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
        siblings.forEach((sib) => {
          if (sib !== activeLink) {
            sib.classList.remove('is--active');
          }
        });
        updateIndicator(activeLink);
      },
      onEnterBack: () => {
        let activeLink = navProgress.querySelector('[data-progress-nav-target="#' + anchorID + '"]');
        activeLink.classList.add('is--active');
        // Remove 'is--active' class from sibling links
        let siblings = navProgress.querySelectorAll('[data-progress-nav-target]');
        siblings.forEach((sib) => {
          if (sib !== activeLink) {
            sib.classList.remove('is--active');
          }
        });
        updateIndicator(activeLink);
      }
    });
  });
}

// Initialize One Page Progress Navigation
document.addEventListener('DOMContentLoaded', () => {
  initProgressNavigation();
});


gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".u-theme-dark, .u-theme-light");
  const progressNav = document.querySelector(".progress-nav");

  if (!sections.length || !progressNav) return;

  let currentTheme = null;

  function resetTheme() {
    progressNav.classList.remove("u-theme-dark", "u-theme-light");
  }

  function animateThemeChange(themeClass) {
    // Don't re-animate if already on this theme
    if (themeClass === currentTheme) return;
    currentTheme = themeClass;

    const tl = gsap.timeline({ defaults: { duration: 0.05, ease: "power3.out" } });

    tl.to(progressNav, {
      autoAlpha: 0,
      overwrite: "auto"
    })
    .add(() => {
      resetTheme();
      progressNav.classList.add(themeClass);
    })
    .fromTo(
      progressNav,
      { autoAlpha: 0 },
      { autoAlpha: 1 }
    );
  }

  sections.forEach((section) => {
    const isDark = section.classList.contains("u-theme-dark");
    const themeClass = isDark ? "u-theme-dark" : "u-theme-light";

    ScrollTrigger.create({
      trigger: section,
      start: "top 5%",   // theme flips just before it reaches the top-ish
      end: "bottom 5%",
      onToggle: (self) => {
        if (self.isActive) {
          animateThemeChange(themeClass);
        }
      }
      // markers: true // uncomment to debug
    });
  });
});


// Initialize a new Lenis instance for smooth scrolling
const lenis = new Lenis();

// Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
// This ensures Lenis's smooth scroll animation updates on each GSAP tick
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Convert time from seconds to milliseconds
});

// Disable lag smoothing in GSAP to prevent any delay in scroll animations
gsap.ticker.lagSmoothing(0);


function initAccordionCSS() {
  if (!document.querySelector('[data-accordion-css-init]')) return;

  document.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';

    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return; // Exit if the clicked element is not a toggle

      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return; // Exit if no accordion container is found

      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
      
      // When [data-accordion-close-siblings="true"]
      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
  });
}

// Initialize Accordion CSS
document.addEventListener('DOMContentLoaded', () => {
  initAccordionCSS();
});

gsap.registerPlugin(ScrollTrigger);

function initFooterParallax(){
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
      tl.from(inner, {
        yPercent: -25,
        ease: 'linear'
      });
    }
  
    if (dark) {
      tl.from(dark, {
        opacity: 0.5,
        ease: 'linear'
      }, '<');
    }
  });
}
// Initialize Footer with Parallax Effect
document.addEventListener('DOMContentLoaded', () => {
  initFooterParallax();
});

function initButtonCharacterStagger() {
  if (!document.querySelector('[data-button-animate-chars]')) return;

  const offsetIncrement = 0.01; // Transition offset increment in seconds
  const buttons = document.querySelectorAll('[data-button-animate-chars]');

  buttons.forEach(button => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ''; // Clear the original content

    [...text].forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      // Handle spaces explicitly
      if (char === ' ') {
        span.style.whiteSpace = 'pre'; // Preserve space width
      }

      button.appendChild(span);
    });
  });
}

// Initialize Button Character Stagger Animation
document.addEventListener('DOMContentLoaded', () => {
  initButtonCharacterStagger();
});

gsap.registerPlugin(ScrollTrigger);

function initContentRevealScroll(){
  if (!document.querySelector('[data-reveal-group]')) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ctx = gsap.context(() => {

    document.querySelectorAll('[data-reveal-group]').forEach(groupEl => {
      // Config from attributes or defaults (group-level)
      const groupStaggerSec = (parseFloat(groupEl.getAttribute('data-stagger')) || 100) / 1000; // ms → sec
      const groupDistance = groupEl.getAttribute('data-distance') || '2em';
      const triggerStart = groupEl.getAttribute('data-start') || 'top 80%';

      const animDuration = 0.8;
      const animEase = "power4.inOut";

      // Reduced motion: show immediately
      if (prefersReduced) {
        gsap.set(groupEl, { clearProps: 'all', y: 0, autoAlpha: 1 });
        return;
      }

      // If no direct children, animate the group element itself
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

      // Build animation slots: item or nested (deep layers allowed)
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

      // Initial hidden state
      slots.forEach(slot => {
        if (slot.type === 'item') {
          // If the element itself is a nested group, force group distance (prevents it from using its own data-distance)
          const isNestedSelf = slot.el.matches('[data-reveal-group-nested]');
          const d = isNestedSelf ? groupDistance : (slot.el.getAttribute('data-distance') || groupDistance);
          gsap.set(slot.el, { y: d, autoAlpha: 0 });
        } else {
          // Parent follows the group's distance when included, regardless of nested's data-distance
          if (slot.includeParent) gsap.set(slot.parentEl, { y: groupDistance, autoAlpha: 0 });
          // Children use nested group's own distance (fallback to group distance)
          const nestedD = slot.nestedEl.getAttribute('data-distance') || groupDistance;
          Array.from(slot.nestedEl.children).forEach(target => gsap.set(target, { y: nestedD, autoAlpha: 0 }));
        }
      });

      // Extra safety: if a nested parent is included, re-assert its distance to the group's value
      slots.forEach(slot => {
        if (slot.type === 'nested' && slot.includeParent) {
          gsap.set(slot.parentEl, { y: groupDistance }); 
        }
      });

      // Reveal sequence
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
              // Optionally include the parent at the same slot time (parent uses group distance)
              if (slot.includeParent) {
                tl.to(slot.parentEl, {
                  y: 0,
                  autoAlpha: 1,
                  duration: animDuration,
                  ease: animEase,
                  onComplete: () => gsap.set(slot.parentEl, { clearProps: 'all' })
                }, slotTime);
              }
              // Nested children use nested stagger (ms → sec); fallback to group stagger
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

// Initialize Elements Reveal on Scroll
document.addEventListener("DOMContentLoaded", () =>{
  initContentRevealScroll();
})

gsap.registerPlugin(ScrollTrigger, SplitText)

function initStickyTitleScroll() {
  if (!document.querySelector('[data-sticky-title="wrap"]')) return;

  const wraps = document.querySelectorAll('[data-sticky-title="wrap"]');
  
  wraps.forEach(wrap => {
    const headings = Array.from(wrap.querySelectorAll('[data-sticky-title="heading"]'));
    
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top 40%",
        end: "bottom bottom",
        scrub: true,
      }
    });
    
    const revealDuration = 0.7,
          fadeOutDuration = 0.7,
          overlapOffset = 0.15;
    
    headings.forEach((heading, index) => {
      // Save original heading content for screen readers
      heading.setAttribute("aria-label", heading.textContent);
      
      const split = new SplitText(heading, { type: "words,chars" });
      
      // Hide all the separate words from screenreader
      split.words.forEach(word => word.setAttribute("aria-hidden", "true"));
      
      // Reset visibility on the 'stacked' headings
      gsap.set(heading, { visibility: "visible" });
      
      const headingTl = gsap.timeline();
      headingTl.from(split.chars, {
        autoAlpha: 0,
        stagger: { amount: revealDuration, from: "start" },
        duration: revealDuration
      });
      
      // Animate fade-out for every heading except the last one.
      if (index < headings.length - 1) {
        headingTl.to(split.chars, {
          autoAlpha: 0,
          stagger: { amount: fadeOutDuration, from: "end" },
          duration: fadeOutDuration
        });
      }
      
      // Overlap the start of fade-in of the new heading a little bit
      if (index === 0) {
        masterTl.add(headingTl);
      } else {
        masterTl.add(headingTl, `-=${overlapOffset}`);
      }
    });
  });
}

// Initialize Sticky Title Scroll Effect
document.addEventListener("DOMContentLoaded", () => {
  initStickyTitleScroll();
});

function initDirectionalButtonHover() {
  if (!document.querySelector('[data-btn-hover]')) return;

  // Button hover animation
  document.querySelectorAll('[data-btn-hover]').forEach(button => {
    button.addEventListener('mouseenter', handleHover);
    button.addEventListener('mouseleave', handleHover);
  });

  function handleHover(event) {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();

    // Get the button's dimensions and center
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;
    const buttonCenterX = buttonRect.left + buttonWidth / 2;
    const buttonCenterY = buttonRect.top + buttonHeight / 2;

    // Calculate mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Offset from the top-left corner in percentage
    const offsetXFromLeft = ((mouseX - buttonRect.left) / buttonWidth) * 100;
    const offsetYFromTop = ((mouseY - buttonRect.top) / buttonHeight) * 100;

    // Offset from the center in percentage
    let offsetXFromCenter = ((mouseX - buttonCenterX) / (buttonWidth / 2)) * 50;

    // Convert to absolute values
    offsetXFromCenter = Math.abs(offsetXFromCenter);

    // Update position and size of .btn__circle
    const circle = button.querySelector('.btn__circle');
    if (circle) {
      circle.style.left = `${offsetXFromLeft.toFixed(1)}%`;
      circle.style.top = `${offsetYFromTop.toFixed(1)}%`;
      circle.style.width = `${115 + offsetXFromCenter.toFixed(1) * 2}%`;
    }
  }
}

// Initialize Directional Button Hover
document.addEventListener('DOMContentLoaded', function() {
  initDirectionalButtonHover();
});