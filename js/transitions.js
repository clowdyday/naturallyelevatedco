/**
 * transitions.js — Page fade transitions, skeleton loaders, scroll-reveal, back-to-top
 *
 * Transitions.fadeOut(el)        → fades #app out (returns Promise)
 * Transitions.fadeIn(el)         → fades #app in
 * Transitions.initScrollReveal() → IntersectionObserver on .reveal elements
 * Transitions.initBackToTop()    → shows/hides back-to-top button on scroll
 * Transitions.initNavShrink()    → shrinks #navbar after 60px scroll
 */
const Transitions = (() => {

  /** Fade #app out. Returns a Promise that resolves when animation ends. */
  function fadeOut(el) {
    return new Promise(resolve => {
      el.classList.add('page-exit');
      const done = () => {
        el.removeEventListener('animationend', done);
        resolve();
      };
      el.addEventListener('animationend', done);
      // Safety timeout in case animationend doesn't fire
      setTimeout(resolve, 320);
    });
  }

  /** Fade #app in. */
  function fadeIn(el) {
    el.classList.remove('page-exit');
    el.classList.add('page-enter');
    const done = () => {
      el.classList.remove('page-enter');
      el.removeEventListener('animationend', done);
    };
    el.addEventListener('animationend', done);
  }

  /**
   * IntersectionObserver — adds .is-visible to any .reveal element when it
   * enters the viewport. CSS handles the actual animation.
   */
  function initScrollReveal() {
    if (!window.IntersectionObserver) return; // graceful degradation

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // fire once
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  /**
   * Injects a Back-to-Top button into the DOM and shows it after 400px scroll.
   * Only called once on app init.
   */
  function initBackToTop() {
    if (document.getElementById('back-to-top')) return; // already exists

    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '↑';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 400);
    }, { passive: true });
  }

  /**
   * Nav scroll-shrink: adds .scrolled to #navbar after 60px.
   * Only called once on app init.
   */
  function initNavShrink() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /**
   * Scroll progress bar — scales the #scroll-progress element
   * from scaleX(0) → scaleX(1) as the page scrolls.
   */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? scrolled / maxScroll : 0;
      bar.style.transform = `scaleX(${ratio})`;
    }, { passive: true });
  }

  /**
   * Custom cursor dot — follows mouse on pointer (non-touch) devices.
   * The dot element (.cursor-dot) is added in index.html.
   */
  function initCursorDot() {
    // Only on devices with a precise pointer (mouse)
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.querySelector('.cursor-dot');
    if (!dot) return;

    // Activate after first mouse move
    let activated = false;
    document.addEventListener('mousemove', e => {
      if (!activated) {
        dot.classList.add('is-active');
        activated = true;
      }
      // Use left/top for position (transform handles centering in CSS)
      dot.style.left = e.clientX + 'px';
      dot.style.top  = e.clientY + 'px';
    }, { passive: true });

    document.addEventListener('mousedown', () => {
      dot.classList.add('is-clicking');
    });
    document.addEventListener('mouseup', () => {
      dot.classList.remove('is-clicking');
    });

    // Hide dot when leaving the window
    document.addEventListener('mouseleave', () => {
      dot.classList.remove('is-active');
      activated = false;
    });
    document.addEventListener('mouseenter', () => {
      if (activated) dot.classList.add('is-active');
    });
  }

  return {
    fadeOut,
    fadeIn,
    initScrollReveal,
    initBackToTop,
    initNavShrink,
    initScrollProgress,
    initCursorDot
  };
})();
