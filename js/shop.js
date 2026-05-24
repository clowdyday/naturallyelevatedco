/**
 * shop.js — Renders the product grid and featured drops strip.
 *
 * renderFeaturedStrip() → HTML string for the featured horizontal scroll row
 * renderShopGrid()      → HTML string for the full product grid
 *
 * Both are called by app.js when rendering the homepage view.
 * Event listeners are attached via initShopEvents() after HTML is in the DOM.
 */

/**
 * Renders the "FEATURED DROPS" horizontal scroll strip.
 * Shows only products where featured === true.
 * @returns {string} HTML string
 */
function renderFeaturedStrip() {
  const featured = PRODUCTS.filter(p => p.featured);

  const cards = featured.map(product => `
    <article class="featured-card reveal" data-product-id="${product.id}">
      <a href="/product/${product.id}" class="featured-card-img-link" data-route>
        <div class="featured-card-img-wrap">
          <img
            src="${product.images[0].url}"
            alt="${product.images[0].alt}"
            class="featured-card-img"
            loading="lazy"
            width="280"
            height="280"
          >
        </div>
      </a>
      <div class="featured-card-body">
        <a href="/product/${product.id}" class="featured-card-title" data-route>
          ${product.title}
        </a>
        <span class="featured-card-price">$${product.price}</span>
        <a href="/product/${product.id}" class="featured-card-view" data-route aria-label="View ${product.title}">
          VIEW →
        </a>
      </div>
    </article>
  `).join('');

  return `
    <section class="featured-section" aria-labelledby="featured-heading">
      <div class="section-container">
        <p class="section-label" id="featured-heading">// FEATURED DROPS</p>
        <div class="featured-strip" role="list" aria-label="Featured products">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

/**
 * Renders the full "ALL ITEMS" product grid with all 11 products.
 * @returns {string} HTML string
 */
function renderShopGrid() {
  const cards = PRODUCTS.map(product => {
    const colorSwatches = product.colors.map(color => {
      const hex = COLOR_HEX[color] || '#888';
      return `<span class="mini-swatch" style="background:${hex}" title="${color}" aria-label="${color}"></span>`;
    }).join('');

    return `
      <article class="product-card reveal" data-product-id="${product.id}">
        <a href="/product/${product.id}" class="product-card-img-link" data-route aria-label="View ${product.title}">
          <div class="product-card-img-wrap">
            <img
              src="${product.images[0].url}"
              alt="${product.images[0].alt}"
              class="product-card-img"
              loading="lazy"
              width="400"
              height="400"
            >
            <div class="product-card-hover-overlay" aria-hidden="true">
              <button
                class="btn-card-add"
                data-product-id="${product.id}"
                data-color="${product.colors[0]}"
                data-size="M"
                tabindex="-1"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </a>
        <div class="product-card-body">
          <a href="/product/${product.id}" class="product-card-title" data-route>
            ${product.title}
          </a>
          <div class="product-card-meta">
            <span class="product-card-price">$${product.price}</span>
            <div class="product-card-colors" aria-label="Available colors">
              ${colorSwatches}
            </div>
          </div>
        </div>
        <!-- Accessible add-to-cart below image for keyboard/screen reader users -->
        <button
          class="btn-card-add btn-card-add-accessible"
          data-product-id="${product.id}"
          data-color="${product.colors[0]}"
          data-size="M"
          aria-label="Add ${product.title} to cart (${product.colors[0]}, size M)"
        >
          ADD TO CART
        </button>
      </article>
    `;
  }).join('');

  return `
    <section class="shop-section" aria-labelledby="shop-heading">
      <div class="section-container">
        <p class="section-label" id="shop-heading">ALL ITEMS</p>
        <div class="product-grid" role="list" aria-label="All products">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

/**
 * Attaches event listeners to the shop grid after it's been rendered to DOM.
 * Must be called after renderShopGrid() HTML is injected into the page.
 */
function initShopEvents() {
  // Event delegation on the product grid
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  grid.addEventListener('click', e => {
    const addBtn = e.target.closest('.btn-card-add');
    if (!addBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const productId = parseInt(addBtn.dataset.productId, 10);
    const color = addBtn.dataset.color;
    const size = addBtn.dataset.size || 'M';

    CartState.addToCart(productId, color, size, 1);

    // Flash confirmation on the card
    const card = addBtn.closest('.product-card');
    if (card) {
      card.classList.add('adding');
      addBtn.textContent = 'ADDED ✓';
      setTimeout(() => {
        card.classList.remove('adding');
        addBtn.textContent = 'ADD TO CART';
      }, 1500);
    }
  });

  // Event delegation for featured strip clicks
  const strip = document.querySelector('.featured-strip');
  if (!strip) return;

  strip.addEventListener('click', e => {
    const addBtn = e.target.closest('.btn-card-add');
    if (!addBtn) return;

    e.preventDefault();
    const productId = parseInt(addBtn.dataset.productId, 10);
    const color = addBtn.dataset.color;
    CartState.addToCart(productId, color, 'M', 1);
  });
}

// ═══════════════════════════════════════════════════════════════════
// SHOP CATALOG PAGE — Filter · Sort · Search
// ═══════════════════════════════════════════════════════════════════

/** Persistent filter/sort state — survives between navigations */
const shopState = {
  search: '',
  sort: 'default',   // 'default' | 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
  sizes: [],         // active size filters (empty = all)
  colors: [],        // active color filters (empty = all)
  showFeatured: false
};

/** Returns deduplicated list of all colors in the catalog */
function getAllColors() {
  const seen = new Set();
  const out  = [];
  PRODUCTS.forEach(p => p.colors.forEach(c => { if (!seen.has(c)) { seen.add(c); out.push(c); } }));
  return out;
}

/** Applies shopState filters + sort and returns a new array */
function getFilteredSorted() {
  let items = [...PRODUCTS];

  if (shopState.showFeatured) {
    items = items.filter(p => p.featured);
  }
  if (shopState.search.trim()) {
    const q = shopState.search.trim().toLowerCase();
    items = items.filter(p =>
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (shopState.sizes.length) {
    items = items.filter(p => shopState.sizes.some(s => p.sizes.includes(s)));
  }
  if (shopState.colors.length) {
    items = items.filter(p => shopState.colors.some(c => p.colors.includes(c)));
  }

  switch (shopState.sort) {
    case 'price-asc':  items.sort((a, b) => a.price - b.price); break;
    case 'price-desc': items.sort((a, b) => b.price - a.price); break;
    case 'name-asc':   items.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'name-desc':  items.sort((a, b) => b.title.localeCompare(a.title)); break;
    case 'featured':   items.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
  }
  return items;
}

/** Renders filter-chip HTML for all currently active filters */
function _renderFilterChips() {
  const chips = [];
  if (shopState.showFeatured) {
    chips.push(`<button class="filter-chip" data-chip-clear="featured">Featured Only <span class="filter-chip-remove" aria-hidden="true">&times;</span></button>`);
  }
  if (shopState.search) {
    chips.push(`<button class="filter-chip" data-chip-clear="search">Search: &ldquo;${shopState.search}&rdquo; <span class="filter-chip-remove" aria-hidden="true">&times;</span></button>`);
  }
  shopState.sizes.forEach(s  => chips.push(`<button class="filter-chip" data-chip-clear="size"  data-chip-value="${s}">Size: ${s} <span class="filter-chip-remove" aria-hidden="true">&times;</span></button>`));
  shopState.colors.forEach(c => chips.push(`<button class="filter-chip" data-chip-clear="color" data-chip-value="${c}">${c} <span class="filter-chip-remove" aria-hidden="true">&times;</span></button>`));
  return chips.join('');
}

/** Renders product card HTML for an array of products */
function _renderProductCards(items) {
  if (!items.length) {
    return `
      <div class="shop-no-results" role="status">
        <span aria-hidden="true">🌵</span>
        <p>No products match your filters.</p>
        <small>Try clearing a filter above.</small>
      </div>`;
  }
  return items.map(product => {
    const swatches = product.colors.map(color =>
      `<span class="mini-swatch" style="background:${COLOR_HEX[color] || '#888'}" title="${color}" aria-label="${color}"></span>`
    ).join('');
    return `
      <article class="product-card reveal" data-product-id="${product.id}">
        <a href="/product/${product.id}" class="product-card-img-link" data-route aria-label="View ${product.title}">
          <div class="product-card-img-wrap">
            <img src="${product.images[0].url}" alt="${product.images[0].alt}"
              class="product-card-img" loading="lazy" width="400" height="400">
            <div class="product-card-hover-overlay" aria-hidden="true">
              <button class="btn-card-add" data-product-id="${product.id}"
                data-color="${product.colors[0]}" data-size="M" tabindex="-1">ADD TO CART</button>
            </div>
          </div>
        </a>
        <div class="product-card-body">
          <a href="/product/${product.id}" class="product-card-title" data-route>${product.title}</a>
          <div class="product-card-meta">
            <span class="product-card-price">$${product.price}</span>
            <div class="product-card-colors" aria-label="Available colors">${swatches}</div>
          </div>
        </div>
        <button class="btn-card-add btn-card-add-accessible"
          data-product-id="${product.id}" data-color="${product.colors[0]}" data-size="M"
          aria-label="Add ${product.title} to cart (${product.colors[0]}, size M)">ADD TO CART</button>
      </article>`;
  }).join('');
}

/** Re-renders just the grid, count, and chips without rebuilding the full page */
function _refreshShopGrid() {
  const items = getFilteredSorted();

  const gridEl = document.getElementById('shop-grid-results');
  if (gridEl) gridEl.innerHTML = _renderProductCards(items);

  const countEl = document.getElementById('shop-results-count');
  if (countEl) countEl.textContent = `${items.length} of ${PRODUCTS.length} products`;

  const chipsEl = document.getElementById('shop-filter-chips');
  if (chipsEl) chipsEl.innerHTML = _renderFilterChips();

  // Sync sidebar active states
  document.querySelectorAll('.sort-option').forEach(btn =>
    btn.classList.toggle('is-active', btn.dataset.sort === shopState.sort));
  document.querySelectorAll('.sidebar-size-btn').forEach(btn =>
    btn.classList.toggle('is-active', shopState.sizes.includes(btn.dataset.size)));
  document.querySelectorAll('.sidebar-color-btn').forEach(btn =>
    btn.classList.toggle('is-active', shopState.colors.includes(btn.dataset.color)));

  if (window.Transitions) Transitions.initScrollReveal();
}

/**
 * Renders the full /shop catalog page: search bar + filter chips + sidebar + product grid.
 * @returns {string} HTML string
 */
function renderShopPage() {
  const ALL_SIZES  = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const allColors  = getAllColors();
  const items      = getFilteredSorted();

  const SORT_LABELS = {
    'default':    'Default',
    'featured':   'Featured First',
    'price-asc':  'Price: Low — High',
    'price-desc': 'Price: High — Low',
    'name-asc':   'Name: A — Z',
    'name-desc':  'Name: Z — A',
  };

  const sortBtns = Object.keys(SORT_LABELS).map(key =>
    `<button class="sort-option${shopState.sort === key ? ' is-active' : ''}" data-sort="${key}">${SORT_LABELS[key]}</button>`
  ).join('');

  const sizePills = ALL_SIZES.map(size =>
    `<button class="sidebar-size-btn${shopState.sizes.includes(size) ? ' is-active' : ''}" data-size="${size}">${size}</button>`
  ).join('');

  const colorSwatches = allColors.map(color => {
    const hex = COLOR_HEX[color] || '#888';
    return `<button class="sidebar-color-btn${shopState.colors.includes(color) ? ' is-active' : ''}" data-color="${color}" style="background:${hex}" aria-label="${color}" title="${color}"></button>`;
  }).join('');

  return `
    <div class="shop-page">

      <!-- ── Top controls bar ── -->
      <div class="shop-page-header">
        <p class="shop-page-title">// ALL ITEMS</p>
        <div class="shop-controls-bar">
          <div class="shop-search-wrap">
            <span class="shop-search-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input type="search" id="shop-search-input" class="shop-search-input"
              placeholder="Search products..." value="${shopState.search}"
              autocomplete="off" aria-label="Search products">
          </div>
          <span id="shop-results-count" class="shop-results-count" aria-live="polite">
            ${items.length} of ${PRODUCTS.length} products
          </span>
        </div>
        <div id="shop-filter-chips" class="filter-chips" aria-label="Active filters">
          ${_renderFilterChips()}
        </div>
      </div>

      <!-- ── Sidebar + Grid layout ── -->
      <div class="shop-layout">

        <!-- Sidebar -->
        <aside class="shop-sidebar" aria-label="Filters and sorting">

          <div class="sidebar-section">
            <p class="sidebar-heading">Sort By</p>
            ${sortBtns}
          </div>

          <div class="sidebar-section">
            <p class="sidebar-heading">Size</p>
            <div class="filter-size-pills" role="group" aria-label="Filter by size">
              ${sizePills}
            </div>
          </div>

          <div class="sidebar-section">
            <p class="sidebar-heading">Color</p>
            <div class="filter-color-swatches" role="group" aria-label="Filter by color">
              ${colorSwatches}
            </div>
          </div>

          <button class="sidebar-clear-btn" id="sidebar-clear-btn">Clear all filters</button>
        </aside>

        <!-- Product grid -->
        <main class="shop-main">
          <div id="shop-grid-results" class="product-grid" role="list" aria-label="Products">
            ${_renderProductCards(items)}
          </div>
        </main>

      </div>
    </div>
  `;
}

/**
 * Wires all interactive controls on the /shop catalog page.
 * Must be called after renderShopPage() HTML is in the DOM.
 */
function initShopPage() {
  // ── Search (debounced 220 ms) ──────────────────────────────────────
  const searchInput = document.getElementById('shop-search-input');
  if (searchInput) {
    let timer;
    searchInput.addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        shopState.search = e.target.value;
        _refreshShopGrid();
      }, 220);
    });
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.preventDefault(); });
  }

  // ── Sort buttons ───────────────────────────────────────────────────
  document.querySelectorAll('.sort-option').forEach(btn => {
    btn.addEventListener('click', () => {
      shopState.sort = btn.dataset.sort;
      _refreshShopGrid();
    });
  });

  // ── Size pills ─────────────────────────────────────────────────────
  document.querySelectorAll('.sidebar-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const size = btn.dataset.size;
      const idx  = shopState.sizes.indexOf(size);
      if (idx === -1) shopState.sizes.push(size);
      else            shopState.sizes.splice(idx, 1);
      _refreshShopGrid();
    });
  });

  // ── Color swatches ─────────────────────────────────────────────────
  document.querySelectorAll('.sidebar-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      const idx   = shopState.colors.indexOf(color);
      if (idx === -1) shopState.colors.push(color);
      else            shopState.colors.splice(idx, 1);
      _refreshShopGrid();
    });
  });

  // ── Clear all ──────────────────────────────────────────────────────
  const clearBtn = document.getElementById('sidebar-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      shopState.search = '';
      shopState.sizes  = [];
      shopState.colors = [];
      shopState.showFeatured = false;
      const si = document.getElementById('shop-search-input');
      if (si) si.value = '';
      _refreshShopGrid();
    });
  }

  // ── Chip removal (event delegation on container) ───────────────────
  const chipsEl = document.getElementById('shop-filter-chips');
  if (chipsEl) {
    chipsEl.addEventListener('click', e => {
      const chip = e.target.closest('[data-chip-clear]');
      if (!chip) return;
      const type = chip.dataset.chipClear;
      const val  = chip.dataset.chipValue;
      if (type === 'search')        { shopState.search = ''; const si = document.getElementById('shop-search-input'); if (si) si.value = ''; }
      else if (type === 'size')     { shopState.sizes   = shopState.sizes.filter(s => s !== val); }
      else if (type === 'color')    { shopState.colors  = shopState.colors.filter(c => c !== val); }
      else if (type === 'featured') { shopState.showFeatured = false; }
      _refreshShopGrid();
    });
  }

  // ── Add-to-cart in grid (delegation survives innerHTML refreshes) ───
  const grid = document.getElementById('shop-grid-results');
  if (grid) {
    grid.addEventListener('click', e => {
      const addBtn = e.target.closest('.btn-card-add');
      if (!addBtn) return;
      e.preventDefault();
      e.stopPropagation();
      const productId = parseInt(addBtn.dataset.productId, 10);
      CartState.addToCart(productId, addBtn.dataset.color, addBtn.dataset.size || 'M', 1);
      const card = addBtn.closest('.product-card');
      if (card) {
        card.classList.add('adding');
        addBtn.textContent = 'ADDED ✓';
        setTimeout(() => { card.classList.remove('adding'); addBtn.textContent = 'ADD TO CART'; }, 1500);
      }
    });
  }
}
