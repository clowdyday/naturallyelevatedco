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

    // Item 29: respect prefers-reduced-motion — skip observer, make all reveals visible immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
      return;
    }

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

  /**
   * Announcement bar marquee — driven by requestAnimationFrame.
   * Uses neutral ID/class names (#site-topbar / .topbar-ticker) to avoid
   * EasyList cosmetic filters that target "announcement" selectors.
   * Clones the .topbar-ticker so the scroll loops seamlessly.
   */
  function initAnnouncementBar() {
    const bar   = document.getElementById('site-topbar');
    if (!bar) return;

    // Item 30: respect prefers-reduced-motion — keep text static, skip animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const track = bar.querySelector('.topbar-ticker');
    if (!track) return;

    // Clone for seamless loop
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    bar.appendChild(clone);

    // Measure content width (position:absolute means offsetWidth = real content width)
    const trackW = track.offsetWidth;
    if (!trackW) return;

    const SPEED  = 55;   // pixels per second
    let   offset = 0;
    let   lastTs = 0;
    // Item 30: pause on hover
    let   paused = false;
    bar.addEventListener('mouseenter', () => { paused = true; });
    bar.addEventListener('mouseleave', () => { paused = false; });

    function tick(ts) {
      if (!lastTs) lastTs = ts;
      // Cap delta to 50 ms — handles tab switch / background suspend
      const dt = Math.min((ts - lastTs) / 1000, 0.05);
      lastTs = ts;

      if (!paused) {
        offset = (offset + SPEED * dt) % trackW;
        track.style.transform = `translateX(${-offset}px)`;
        clone.style.transform  = `translateX(${trackW - offset}px)`;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /**
   * Animation Guard — detects when a browser extension (ad blocker, "stop animations"
   * extension, etc.) is suppressing CSS animations/transitions and re-applies critical
   * ones as inline styles with !important, which always wins over extension-injected
   * author-level CSS regardless of specificity.
   *
   * Two threat models handled:
   *   1. Cosmetic CSS injection:  * { animation: none !important; transition: none !important; }
   *   2. EasyList element hiding: #site-topbar { display: none !important; }
   *      (mitigated by renaming away from "announcement" patterns)
   */
  function initAnimGuard() {
    // ── Step 1: detect if CSS animations are being blocked ────────────
    const testStyle = document.createElement('style');
    testStyle.id = '_nec-ags';
    testStyle.textContent =
      '._nec-agt{animation:_nec-agk 1s linear!important}' +
      '@keyframes _nec-agk{to{opacity:0}}';
    document.head.appendChild(testStyle);

    const testEl = document.createElement('div');
    testEl.className = '_nec-agt';
    testEl.setAttribute('aria-hidden', 'true');
    testEl.style.cssText = 'position:fixed;width:0;height:0;pointer-events:none;';
    document.body.appendChild(testEl);

    const detectedName = window.getComputedStyle(testEl).animationName;
    const animsBlocked = !detectedName || detectedName === 'none';

    testEl.remove();
    testStyle.remove();

    if (!animsBlocked) return; // animations work — nothing to do

    // ── Step 2: compile critical animation + transition overrides ─────
    // These are the keyframe names defined in style.css
    const ANIMS = [
      ['.hero-stars',     'starField 80s linear infinite'],
      ['.hero-stars-2',   'twinkle 4s ease-in-out infinite alternate'],
      ['.hero-aurora',    'aurora 12s ease-in-out infinite alternate'],
      ['.hero-glow-warm', 'warmPulse 8s ease-in-out infinite alternate'],
      ['.hero-glow-cool', 'coolPulse 10s ease-in-out infinite alternate'],
      ['.hero-horizon',   'horizonGlow 6s ease-in-out infinite alternate'],
      ['#site-topbar',    'none'],  // marquee is JS-driven — just ensure visibility
    ];

    const TRANSITIONS = [
      ['.featured-card',  'transform 0.28s ease, box-shadow 0.28s ease'],
      ['.product-card',   'transform 0.28s ease, box-shadow 0.28s ease'],
      ['.btn-primary',    'background 0.2s ease, transform 0.15s ease'],
      ['.btn-outline',    'background 0.2s ease, color 0.2s ease'],
      ['.nav-link',       'color 0.2s ease, letter-spacing 0.2s ease'],
    ];

    function _applyOverrides() {
      // Force hero CSS animations
      ANIMS.forEach(([sel, val]) => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.setProperty('animation', val, 'important');
          el.style.setProperty('animation-play-state', 'running', 'important');
        });
      });

      // Force transitions on interactive elements
      TRANSITIONS.forEach(([sel, val]) => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.setProperty('transition', val, 'important');
        });
      });

      // .reveal elements: if transitions are blocked they stay opacity:0 forever
      // Make them immediately visible
      document.querySelectorAll('.reveal').forEach(el => {
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('transform', 'none', 'important');
        el.style.setProperty('transition', 'none', 'important');
      });

      // Page-enter/exit: ensure animations run so navigation doesn't hang
      document.querySelectorAll('.page-enter, .page-exit').forEach(el => {
        el.style.setProperty('animation-play-state', 'running', 'important');
      });
    }

    _applyOverrides();

    // ── Step 3: re-apply when router swaps content into #app ──────────
    let _debounce;
    const appEl = document.getElementById('app');
    if (appEl) {
      new MutationObserver(() => {
        clearTimeout(_debounce);
        _debounce = setTimeout(_applyOverrides, 80);
      }).observe(appEl, { childList: true });
    }

    // ── Step 4: re-apply if extension injects a new <style> later ─────
    new MutationObserver(mutations => {
      const hasNewStyle = mutations.some(m =>
        [...m.addedNodes].some(n => n.nodeName === 'STYLE' && n.id !== '_nec-ags')
      );
      if (hasNewStyle) setTimeout(_applyOverrides, 20);
    }).observe(document.head, { childList: true });

    // Mark so CSS can optionally target this state
    document.documentElement.setAttribute('data-anims-forced', '1');
  }

  return {
    fadeOut,
    fadeIn,
    initScrollReveal,
    initBackToTop,
    initNavShrink,
    initScrollProgress,
    initCursorDot,
    initAnnouncementBar,
    initAnimGuard
  };
})();
