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
      setTimeout(resolve, 220);
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

  return { fadeOut, fadeIn, initScrollReveal, initBackToTop, initNavShrink };
})();
