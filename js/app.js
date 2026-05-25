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
    // Supports integer IDs (static catalog) and UUID strings (Printify)
    const productMatch = path.match(/^\/product\/([a-zA-Z0-9_-]+)$/);
    if (productMatch) {
      const rawId = productMatch[1];
      // Use integer for all-numeric IDs (static catalog), keep string for Printify UUIDs
      const productId = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
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

    // Route: Contact
    if (path === '/contact') {
      appEl.innerHTML = renderContactPage();
      initContactPage();
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
    if (path === '/shop' || path.match(/^\/product\/[a-zA-Z0-9_-]+$/)) {
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
      ${renderTrustBar()}
      ${renderFeaturedStrip()}
      ${renderAbout()}
      ${renderEmailCapture()}
    `;
  }

  /**
   * Hero section — full viewport height with CSS desert scene.
   * Desktop: asymmetric split (text left, logo halo right).
   * Mobile: stacked centered.
   * @returns {string} HTML string
   */
  function renderHero() {
    return `
      <section class="hero grain-overlay" aria-labelledby="hero-heading">

        <!-- Sky depth gradient (section 7 ::before handles this) -->

        <!-- Warm amber horizon glow -->
        <div class="hero-glow-warm" aria-hidden="true"></div>

        <!-- Cool violet pulse overlay -->
        <div class="hero-glow-cool" aria-hidden="true"></div>

        <!-- Aurora layer — slow drifting color bloom -->
        <div class="hero-aurora" aria-hidden="true"></div>

        <!-- Star field layer 1 -->
        <div class="hero-stars" aria-hidden="true"></div>

        <!-- Star field layer 2 — twinkling offset -->
        <div class="hero-stars-2" aria-hidden="true"></div>

        <!-- Saguaro cactus silhouettes (inline SVG) -->
        <svg class="hero-cacti" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMax slice"
             aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <!-- Cactus 1 — tall, left area -->
          <g fill="#141210">
            <rect x="108" y="40" width="18" height="140"/>
            <rect x="72"  y="80" width="36" height="14"/>
            <rect x="72"  y="56" width="14" height="38"/>
            <rect x="126" y="90" width="36" height="14"/>
            <rect x="148" y="66" width="14" height="38"/>
          </g>
          <!-- Cactus 2 — shorter, left-center -->
          <g fill="#141210">
            <rect x="318" y="70" width="13" height="110"/>
            <rect x="288" y="100" width="30" height="10"/>
            <rect x="288" y="82"  width="10" height="28"/>
            <rect x="331" y="108" width="28" height="10"/>
            <rect x="349" y="90"  width="10" height="28"/>
          </g>
          <!-- Cactus 3 — tallest, center -->
          <g fill="#141210">
            <rect x="698" y="24" width="22" height="156"/>
            <rect x="654" y="72" width="44" height="16"/>
            <rect x="654" y="44" width="16" height="44"/>
            <rect x="720" y="84" width="44" height="16"/>
            <rect x="748" y="56" width="16" height="44"/>
          </g>
          <!-- Cactus 4 — medium, right-center -->
          <g fill="#141210">
            <rect x="1040" y="55" width="15" height="125"/>
            <rect x="1010" y="88" width="30" height="11"/>
            <rect x="1010" y="68" width="11" height="30"/>
            <rect x="1055" y="96" width="28" height="11"/>
            <rect x="1072" y="76" width="11" height="30"/>
          </g>
          <!-- Cactus 5 — shorter, right -->
          <g fill="#141210">
            <rect x="1310" y="75" width="12" height="105"/>
            <rect x="1284" y="102" width="26" height="9"/>
            <rect x="1284" y="86"  width="9"  height="25"/>
            <rect x="1322" y="110" width="24" height="9"/>
            <rect x="1337" y="94"  width="9"  height="25"/>
          </g>
          <!-- Ground fill -->
          <rect x="0" y="170" width="1440" height="10" fill="#141210"/>
        </svg>

        <!-- Warm horizon glow line -->
        <div class="hero-horizon" aria-hidden="true"></div>

        <!-- Hero text content -->
        <div class="hero-content">
          <div class="hero-split">
            <div class="hero-col--text">
              <p class="hero-eyebrow">New Mexico · Est. 2024</p>

              <h1 id="hero-heading">
                <span class="hero-title-1">DESERT SKIES.</span>
                <span class="hero-title-2">ELEVATED MINDS.</span>
              </h1>

              <p class="hero-subtitle">
                New Mexico-inspired threads for the&nbsp;wandering soul.
              </p>

              <div class="hero-cta">
                <a href="/shop" class="btn-hero" data-route>
                  SHOP THE COLLECTION
                </a>
              </div>
            </div>
            <div class="hero-col--visual" aria-hidden="true">
              <!-- Zia sun — New Mexico state symbol, subtle terracotta watermark -->
              <svg class="hero-zia-watermark" viewBox="0 0 200 200" fill="none"
                   stroke="currentColor" stroke-linecap="round" stroke-width="3.5"
                   xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="16"/>
                <!-- North: 4 rays up -->
                <line x1="88"  y1="84"  x2="88"  y2="38"/>
                <line x1="94"  y1="84"  x2="94"  y2="28"/>
                <line x1="106" y1="84"  x2="106" y2="28"/>
                <line x1="112" y1="84"  x2="112" y2="38"/>
                <!-- South: 4 rays down -->
                <line x1="88"  y1="116" x2="88"  y2="162"/>
                <line x1="94"  y1="116" x2="94"  y2="172"/>
                <line x1="106" y1="116" x2="106" y2="172"/>
                <line x1="112" y1="116" x2="112" y2="162"/>
                <!-- West: 4 rays left -->
                <line x1="84"  y1="88"  x2="38"  y2="88"/>
                <line x1="84"  y1="94"  x2="28"  y2="94"/>
                <line x1="84"  y1="106" x2="28"  y2="106"/>
                <line x1="84"  y1="112" x2="38"  y2="112"/>
                <!-- East: 4 rays right -->
                <line x1="116" y1="88"  x2="162" y2="88"/>
                <line x1="116" y1="94"  x2="172" y2="94"/>
                <line x1="116" y1="106" x2="172" y2="106"/>
                <line x1="116" y1="112" x2="162" y2="112"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Marquee now lives in #announcement-bar (index.html) -->

      </section>
    `;
  }

  /**
   * About section — brand story, pullquote, pillars, grain texture.
   * @returns {string} HTML string
   */
  function renderAbout() {
    return `
      <section class="about-section grain-overlay" id="about" aria-labelledby="about-heading">
        <div class="about-inner">
          <div class="zia-rule reveal" aria-hidden="true">
            <div class="zia-rule-line"></div>
            <span class="zia-rule-symbol">✦</span>
            <div class="zia-rule-line"></div>
          </div>
          <p class="about-heading reveal" id="about-heading">ABOUT US</p>
          <blockquote class="about-pullquote reveal">"Born under desert skies."</blockquote>
          <p class="about-text reveal">
            Naturally Elevated Co. makes threads for elevated minds — designs rooted in
            Southwest mysticism, psychedelic Americana, and the frequencies that move
            between worlds. Every shirt carries a story. Born in New Mexico. Worn everywhere.
          </p>
          <p class="about-text reveal">
            Premium heavyweight cotton, printed in the US. No mass-market filler — just
            original art, real quality, and the kind of vibe you can actually feel.
          </p>
          <div class="zia-rule reveal" aria-hidden="true">
            <div class="zia-rule-line"></div>
            <span class="zia-rule-symbol">✦</span>
            <div class="zia-rule-line"></div>
          </div>
          <div class="about-features reveal">
            <div class="about-feature-card">
              <span class="about-feature-icon" aria-hidden="true">⟡</span>
              <p class="about-feature-label">Quality</p>
              <p class="about-feature-desc">Premium heavyweight cotton, printed in the US on demand.</p>
            </div>
            <div class="about-feature-card">
              <span class="about-feature-icon" aria-hidden="true">✦</span>
              <p class="about-feature-label">Story</p>
              <p class="about-feature-desc">Born under New Mexico skies. Rooted in Southwest mysticism.</p>
            </div>
            <div class="about-feature-card">
              <span class="about-feature-icon" aria-hidden="true">◈</span>
              <p class="about-feature-label">Culture</p>
              <p class="about-feature-desc">Psychedelic Americana for the wandering and the wide-awake.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Trust bar — 4 trust items between hero and featured section.
   * @returns {string} HTML string
   */
  function renderTrustBar() {
    return `
      <div class="trust-bar" role="complementary" aria-label="Why shop with us">
        <div class="trust-bar-inner">
          <div class="trust-bar-item">
            <span class="trust-bar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="var(--accent-terracotta)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <span class="trust-bar-label">Printed in the US</span>
          </div>
          <div class="trust-bar-item">
            <span class="trust-bar-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent-terracotta)"
                   stroke="none" aria-hidden="true">
                <path d="M12 2l2.09 6.26H21l-5.47 3.99 2.09 6.26L12 14.52l-5.62 4 2.09-6.27L3 8.26h6.91z"/>
              </svg>
            </span>
            <span class="trust-bar-label">Premium Heavyweight Cotton</span>
          </div>
          <div class="trust-bar-item">
            <span class="trust-bar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="var(--accent-terracotta)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </span>
            <span class="trust-bar-label">Free Shipping $50+</span>
          </div>
          <div class="trust-bar-item">
            <span class="trust-bar-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="var(--accent-terracotta)" stroke-width="1.8"
                   stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </span>
            <span class="trust-bar-label">Original Artwork</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Email capture section — between about and footer.
   * @returns {string} HTML string
   */
  function renderEmailCapture() {
    return `
      <section class="email-section" aria-labelledby="email-heading">
        <div class="email-inner">
          <h2 class="email-heading" id="email-heading">Stay in the Loop</h2>
          <p class="email-sub">New designs, limited drops. No spam.</p>
          <form class="email-form" id="email-capture-form" novalidate>
            <input
              type="email"
              class="email-input"
              placeholder="your@email.com"
              aria-label="Email address"
              autocomplete="email"
              required
            >
            <button type="submit" class="btn-primary email-submit">NOTIFY ME</button>
          </form>
          <span class="email-error-msg" id="email-error-msg" role="alert">Please enter a valid email address.</span>
        </div>
      </section>
    `;
  }

  /**
   * Success / order confirmation page.
   * @returns {string} HTML string
   */
  function renderSuccessPage() {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    const ref = sessionId ? sessionId.slice(-8).toUpperCase() : null;
    return `
      <div class="success-page">
        <div class="success-check" aria-hidden="true">✓</div>
        <h2 class="success-heading">Order Confirmed.</h2>
        ${ref ? `<p class="success-ref">Reference: <strong>#${ref}</strong></p>` : ''}
        <p class="success-body">Your drop is on its way. Check your email for tracking info.</p>
        <a href="/" class="btn-outline" data-route>← BACK TO THE COLLECTION</a>
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
          // iOS scroll lock: save scroll position, fix body in place
          const scrollY = window.scrollY;
          document.body.style.top = `-${scrollY}px`;
          document.body.classList.add('mobile-nav-is-open');

          mobileNav.hidden = false;
          hamburger.setAttribute('aria-expanded', 'true');
          hamburger.classList.add('is-open');

          // Focus first link for accessibility
          const firstLink = mobileNav.querySelector('.mobile-nav-link');
          if (firstLink) firstLink.focus();
        }
      });
    }

    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', closeMobileNav);
    }

    // Item 6: Mobile nav backdrop — click the dark area to close
    const mobileBackdrop = document.getElementById('mobile-nav-backdrop');
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileNav);
    }

    // Item 1: SHOP dropdown — chevron toggles dropdown, text link navigates
    const shopNavItem  = document.querySelector('.nav-item--shop');
    const shopChevron  = document.querySelector('.nav-shop-chevron');
    if (shopNavItem && shopChevron) {
      shopChevron.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = shopNavItem.getAttribute('aria-expanded') === 'true';
        shopNavItem.setAttribute('aria-expanded', String(!isOpen));
        shopChevron.setAttribute('aria-expanded', String(!isOpen));
      });
      // Close dropdown on outside click
      document.addEventListener('click', e => {
        if (!shopNavItem.contains(e.target)) {
          shopNavItem.setAttribute('aria-expanded', 'false');
          shopChevron.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Close mobile nav on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const mobileNav = document.getElementById('mobile-nav-overlay');
        if (mobileNav && !mobileNav.hidden) closeMobileNav();
      }
    });

    // Email capture form — basic confirmation (no backend yet)
    document.body.addEventListener('submit', e => {
      const form = e.target.closest('#email-capture-form');
      if (!form) return;
      e.preventDefault();
      const input  = form.querySelector('.email-input');
      const btn    = form.querySelector('.email-submit');
      const errMsg = document.getElementById('email-error-msg');
      if (!input || !input.value.trim().includes('@')) {
        if (input) { input.focus(); input.style.borderColor = 'var(--accent-terracotta)'; }
        if (errMsg) errMsg.classList.add('is-visible');    // Item 19: visibility toggle
        return;
      }
      if (errMsg) errMsg.classList.remove('is-visible');   // Item 19
      input.style.borderColor = '';
      const orig = btn.textContent;
      btn.textContent = 'SUBSCRIBED ✓';
      btn.disabled = true;
      input.value = '';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
      }, 3000);
    });
  }

  // ─── Init ──────────────────────────────────────────────────────────

  function init() {
    document.addEventListener('DOMContentLoaded', () => {
      initEvents();
      Transitions.initBackToTop();
      Transitions.initNavShrink();
      Transitions.initScrollProgress();
      Transitions.initCursorDot();
      Transitions.initAnnouncementBar();
      Transitions.initAnimGuard();

      // Render immediately with static catalog — no waiting on API
      const path = (location.pathname.replace(BASE_PATH, '') || '/');
      renderView(path);
      SEO.update(path);
      Transitions.initScrollReveal();

      // Background refresh — swap in live Printify data when ready
      loadProducts().then(() => {
        const p = location.pathname.replace(BASE_PATH, '') || '/';
        if (p === '/' || p === '/shop') {
          renderView(p);
          Transitions.initScrollReveal();
        }
      }).catch(() => {});
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

  // iOS scroll lock restore: unfix body and scroll back to saved position
  if (document.body.classList.contains('mobile-nav-is-open')) {
    const scrollY = Math.abs(parseInt(document.body.style.top || '0', 10));
    document.body.classList.remove('mobile-nav-is-open');
    document.body.style.top = '';
    if (scrollY) window.scrollTo(0, scrollY);
  }
}

// Boot the app
App.init();
