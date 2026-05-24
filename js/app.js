// ARCHITECTURE NOTE:
// This frontend is designed to run standalone (open index.html) or served by
// a Node/Express server. When the backend is ready:
//   - All API calls are isolated to data.js and checkout.js
//   - Cloudflare Worker will proxy public HTTPS → localhost:3000
//   - No other files need to change for full integration

/**
 * App — Client-side router + view controller
 *
 * Routes:
 *   /              → Homepage (hero + featured + shop grid + about)
 *   /product/:id   → Product detail view
 *   /cart          → Opens cart drawer (redirects to / first)
 *   /success       → Post-checkout success page
 *
 * All views render into <main id="app">.
 * Navbar and footer are persistent in index.html.
 */

const App = (() => {

  // ─── Base path (GitHub Pages project-page prefix) ──────────────────
  // On GitHub Pages: clowdyday.github.io/naturallyelevatedco → base = '/naturallyelevatedco'
  // On localhost or custom domain: base = ''
  const BASE_PATH = (() => {
    if (!window.location.hostname.includes('github.io')) return '';
    const seg = window.location.pathname.split('/').filter(Boolean)[0];
    return seg ? '/' + seg : '';
  })();

  // ─── Router ────────────────────────────────────────────────────────

  /**
   * Navigate to a path using History API (no page reload).
   * @param {string} path
   */
  function navigate(path) {
    const appEl = document.getElementById('app');

    if (appEl) {
      Transitions.fadeOut(appEl).then(() => {
        history.pushState(null, '', BASE_PATH + path);
        renderView(path);
        SEO.update(path);
        Transitions.fadeIn(appEl);
        Transitions.initScrollReveal();
      });
    } else {
      history.pushState(null, '', BASE_PATH + path);
      renderView(path);
      SEO.update(path);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Match a URL path against the route table and render the appropriate view.
   * @param {string} path
   */
  function renderView(path) {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    updateNavbarActive(path);

    // Route: shop catalog
    if (path === '/shop') {
      appEl.innerHTML = renderShopPage();
      initShopPage();
      Transitions.initScrollReveal();
      return;
    }

    // Route: homepage
    if (path === '/' || path === '') {
      appEl.innerHTML = renderHomepage();
      initShopEvents();
      Transitions.initScrollReveal();
      return;
    }

    // Route: product detail  /product/:id
    const productMatch = path.match(/^\/product\/(\d+)$/);
    if (productMatch) {
      const productId = parseInt(productMatch[1], 10);
      appEl.innerHTML = renderProductDetail(productId);
      initProductDetail(productId);
      Transitions.initScrollReveal();
      return;
    }

    // Route: cart — open cart drawer on current page (navigate to / first if needed)
    if (path === '/cart') {
      if (document.querySelector('.hero') === null) {
        // Not on homepage yet — go there first, then open
        appEl.innerHTML = renderHomepage();
        initShopEvents();
      }
      CartState.openCartDrawer();
      return;
    }

    // Route: success page
    if (path === '/success') {
      appEl.innerHTML = renderSuccessPage();
      return;
    }

    // Route: FAQ
    if (path === '/faq') {
      appEl.innerHTML = renderFAQPage();
      initFAQPage();
      Transitions.initScrollReveal();
      return;
    }

    // Route: Privacy Policy
    if (path === '/privacy') {
      appEl.innerHTML = renderPrivacyPage();
      Transitions.initScrollReveal();
      return;
    }

    // Route: Terms of Service
    if (path === '/tos') {
      appEl.innerHTML = renderTOSPage();
      Transitions.initScrollReveal();
      return;
    }

    // Fallback — 404-style, redirect home
    appEl.innerHTML = renderHomepage();
    initShopEvents();
  }

  /**
   * Highlights the active nav link based on current path.
   * @param {string} path
   */
  function updateNavbarActive(path) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    if (path === '/') {
      const homeLink = document.querySelector('.nav-link[href="/"]');
      if (homeLink) homeLink.classList.add('active');
    }
    if (path === '/shop' || path.match(/^\/product\/\d+$/)) {
      const shopLink = document.querySelector('.nav-link[href="/shop"]');
      if (shopLink) shopLink.classList.add('active');
    }
  }

  // ─── View Renderers ────────────────────────────────────────────────

  /**
   * Renders the full homepage: hero + featured strip + shop grid + about section.
   * @returns {string} HTML string
   */
  function renderHomepage() {
    return `
      ${renderHero()}
      ${renderFeaturedStrip()}
      ${renderAbout()}
    `;
  }

  /**
   * Hero section — full viewport height with CSS desert scene.
   * @returns {string} HTML string
   */
  function renderHero() {
    return `
      <section class="hero grain-overlay" aria-labelledby="hero-heading">

        <!-- Warm amber horizon glow (base) -->
        <div class="hero-glow-warm" aria-hidden="true"></div>

        <!-- Cool dusty rose overlay — pulses via CSS animation -->
        <div class="hero-glow-cool" aria-hidden="true"></div>

        <!-- Aurora layer — slow drifting color bloom -->
        <div class="hero-aurora" aria-hidden="true"></div>

        <!-- Star field (~30 dots via CSS box-shadow) -->
        <div class="hero-stars" aria-hidden="true"></div>

        <!-- Second star layer — twinkling offset -->
        <div class="hero-stars-2" aria-hidden="true"></div>

        <!-- Saguaro cactus silhouettes (inline SVG, 5 cacti) -->
        <svg class="hero-cacti" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMax slice"
             aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <!-- Cactus 1 — tall, left area -->
          <g fill="#1a1915">
            <rect x="108" y="40" width="18" height="140"/>
            <rect x="72"  y="80" width="36" height="14"/>
            <rect x="72"  y="56" width="14" height="38"/>
            <rect x="126" y="90" width="36" height="14"/>
            <rect x="148" y="66" width="14" height="38"/>
          </g>
          <!-- Cactus 2 — shorter, left-center -->
          <g fill="#1a1915">
            <rect x="318" y="70" width="13" height="110"/>
            <rect x="288" y="100" width="30" height="10"/>
            <rect x="288" y="82"  width="10" height="28"/>
            <rect x="331" y="108" width="28" height="10"/>
            <rect x="349" y="90"  width="10" height="28"/>
          </g>
          <!-- Cactus 3 — tallest, center -->
          <g fill="#1a1915">
            <rect x="698" y="24" width="22" height="156"/>
            <rect x="654" y="72" width="44" height="16"/>
            <rect x="654" y="44" width="16" height="44"/>
            <rect x="720" y="84" width="44" height="16"/>
            <rect x="748" y="56" width="16" height="44"/>
          </g>
          <!-- Cactus 4 — medium, right-center -->
          <g fill="#1a1915">
            <rect x="1040" y="55" width="15" height="125"/>
            <rect x="1010" y="88" width="30" height="11"/>
            <rect x="1010" y="68" width="11" height="30"/>
            <rect x="1055" y="96" width="28" height="11"/>
            <rect x="1072" y="76" width="11" height="30"/>
          </g>
          <!-- Cactus 5 — shorter, right -->
          <g fill="#1a1915">
            <rect x="1310" y="75" width="12" height="105"/>
            <rect x="1284" y="102" width="26" height="9"/>
            <rect x="1284" y="86"  width="9"  height="25"/>
            <rect x="1322" y="110" width="24" height="9"/>
            <rect x="1337" y="94"  width="9"  height="25"/>
          </g>
          <!-- Ground fill -->
          <rect x="0" y="170" width="1440" height="10" fill="#1a1915"/>
        </svg>

        <!-- Centered hero content -->
        <div class="hero-content">
          <div class="logo-circle logo-circle--hero hero-logo">
            <img src="assets/logo.jpg" alt="Naturally Elevated Co. logo" width="96" height="96">
          </div>

          <h1 id="hero-heading">
            <span class="hero-title-1">DESERT SKIES.</span>
            <br>
            <span class="hero-title-2">ELEVATED MINDS.</span>
          </h1>

          <p class="hero-subtitle">
            New Mexico-inspired threads for the wandering soul.
          </p>

          <div class="hero-cta">
            <a href="/shop" class="btn-hero" data-route>
              SHOP THE COLLECTION
            </a>
          </div>
        </div>

      </section>
    `;
  }

  /**
   * About section — brand story, grain texture, Zia divider.
   * @returns {string} HTML string
   */
  function renderAbout() {
    return `
      <section class="about-section grain-overlay" id="about" aria-labelledby="about-heading">
        <div class="about-inner">
          <div class="logo-circle logo-circle--about about-logo">
            <img src="assets/logo.jpg" alt="Naturally Elevated Co. logo" width="64" height="64">
          </div>
          <div class="zia-rule" aria-hidden="true">
            <div class="zia-rule-line"></div>
            <span class="zia-rule-symbol">✦</span>
            <div class="zia-rule-line"></div>
          </div>
          <p class="about-heading" id="about-heading">// ABOUT US</p>
          <p class="about-text">
            Born under desert skies in New Mexico. Naturally Elevated Co. makes tees for
            elevated minds — designs rooted in Southwest mysticism, psychedelic Americana,
            and the frequencies that move between worlds. Every shirt carries a story.
            Wear it like you mean it.
          </p>
          <div class="zia-rule" aria-hidden="true">
            <div class="zia-rule-line"></div>
            <span class="zia-rule-symbol">✦</span>
            <div class="zia-rule-line"></div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Success / order confirmation page.
   * @returns {string} HTML string
   */
  function renderSuccessPage() {
    return `
      <div class="success-page">
        <div class="success-check" aria-hidden="true">✓</div>
        <h2 class="success-heading">ORDER RECEIVED.</h2>
        <p class="success-body">Your tee is on its way. Keep it elevated.</p>
        <a href="/" class="btn-outline" data-route>← BACK TO SHOP</a>
      </div>
    `;
  }

  // ─── Event Listeners ───────────────────────────────────────────────

  /**
   * Sets up all global event listeners:
   * - Intercept data-route link clicks for SPA navigation
   * - Handle browser back/forward (popstate)
   * - Mobile nav hamburger
   * - Hero CTA smooth scroll
   */
  function initEvents() {
    // Intercept all [data-route] link clicks
    document.body.addEventListener('click', e => {
      const link = e.target.closest('[data-route]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto')) return;

      e.preventDefault();
      closeMobileNav();

      // Anchor links on same page (like #about)
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }

      // Pre-filter for shop dropdown links
      if (link.hasAttribute('data-filter') && href === '/shop') {
        const filter = link.getAttribute('data-filter');
        shopState.search = '';
        shopState.sizes  = [];
        shopState.colors = [];
        shopState.sort   = 'default';
        shopState.showFeatured = (filter === 'featured');
      }

      navigate(href);
    });

    // Smooth-scroll for #about nav link (non-data-route)
    document.body.addEventListener('click', e => {
      const scrollLink = e.target.closest('.nav-link-scroll, .mobile-nav-scroll');
      if (!scrollLink) return;
      e.preventDefault();
      closeMobileNav();
      const href = scrollLink.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Browser back/forward
    window.addEventListener('popstate', () => {
      const path = location.pathname.replace(BASE_PATH, '') || '/';
      renderView(path);
      SEO.update(path);
    });

    // Button ripple effect
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary, .btn-hero, .btn-outline');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });

    // Mobile nav hamburger
    const hamburger = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');

    if (hamburger && mobileNav) {
      hamburger.addEventListener('click', () => {
        const isOpen = !mobileNav.hidden;
        if (isOpen) {
          closeMobileNav();
        } else {
          mobileNav.hidden = false;
          hamburger.setAttribute('aria-expanded', 'true');
          hamburger.classList.add('is-open');
          document.body.style.overflow = 'hidden';
          // Focus first link for accessibility
          const firstLink = mobileNav.querySelector('.mobile-nav-link');
          if (firstLink) firstLink.focus();
        }
      });
    }

    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', closeMobileNav);
    }

    // Close mobile nav on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const mobileNav = document.getElementById('mobile-nav-overlay');
        if (mobileNav && !mobileNav.hidden) closeMobileNav();
      }
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      initEvents();
      Transitions.initBackToTop();
      Transitions.initNavShrink();
      const path = (location.pathname.replace(BASE_PATH, '') || '/');
      renderView(path);
      SEO.update(path);
      Transitions.initScrollReveal();
    });
  }

  return {
    init,
    navigate,
    renderView
  };
})();

/**
 * Close the mobile navigation overlay.
 * Exposed globally so cart.js can call it when opening the cart from mobile nav.
 */
function closeMobileNav() {
  const mobileNav = document.getElementById('mobile-nav-overlay');
  const hamburger = document.getElementById('hamburger-btn');

  if (mobileNav) {
    mobileNav.hidden = true;
  }
  if (hamburger) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('is-open');
  }
  document.body.style.overflow = '';
}

// Boot the app
App.init();
