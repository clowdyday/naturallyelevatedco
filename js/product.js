/**
 * product.js — Single product detail view
 *
 * renderProductDetail(productId) → returns HTML string for the detail view
 * initProductDetail(productId)   → attaches event listeners after render
 *
 * Called by app.js when routing to /product/:id
 */

/**
 * Builds the HTML for a product detail page.
 * @param {number} productId
 * @returns {string} HTML string, or error HTML if product not found
 */
function renderProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return `
      <div class="product-detail">
        <a href="/" class="back-link" data-route>← BACK TO SHOP</a>
        <p style="color: var(--text-muted); padding: 3rem 0;">Product not found.</p>
      </div>
    `;
  }

  // Color swatches
  const swatches = product.colors.map((color, i) => {
    const hex = COLOR_HEX[color] || '#888';
    return `
      <button
        class="swatch-btn"
        role="radio"
        aria-checked="${i === 0 ? 'true' : 'false'}"
        aria-label="Color: ${color}"
        data-color="${color}"
        style="background-color: ${hex}; ${color === 'White' || color === 'Natural/Cream' || color === 'Natural' ? 'border: 2px solid var(--border-subtle);' : ''}"
      ></button>
    `;
  }).join('');

  // Size pills
  const sizes = product.sizes.map((size, i) => `
    <button
      class="size-btn"
      role="radio"
      aria-checked="${i === 0 ? 'true' : 'false'}"
      aria-label="Size ${size}"
      data-size="${size}"
    >${size}</button>
  `).join('');

  // Thumbnail row — use real product images, fall back to the main image
  const thumbImages = product.images.length > 1 ? product.images.slice(0, 4) : [product.images[0]];
  const thumbs = thumbImages.map((img, i) => `
    <div class="product-thumb-wrap${i === 0 ? ' active' : ''}" data-thumb="${i}" data-img-url="${img.url}" role="button" tabindex="0" aria-label="View image ${i + 1}">
      <img
        src="${img.url}"
        alt="${product.title} — view ${i + 1}"
        class="product-thumb"
        loading="lazy"
        width="72"
        height="72"
      >
    </div>
  `).join('');

  // Split description: first sentence for blockquote, remainder for body paragraph
  const descParts = product.description.split(/(?<=\.)\s+/);
  const descFirst = descParts[0] || product.description;
  const descRest  = descParts.slice(1).join(' ').trim();

  return `
    <div class="product-detail">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/" data-route>Home</a>
        <span class="breadcrumb-sep" aria-hidden="true">›</span>
        <a href="/shop" data-route>Shop</a>
        <span class="breadcrumb-sep" aria-hidden="true">›</span>
        <span class="breadcrumb-current" aria-current="page">${product.title}</span>
      </nav>
      <a href="/" class="back-link" data-route>← BACK TO SHOP</a>

      <div class="product-detail-grid">

        <!-- ── Gallery ── -->
        <div class="product-gallery">
          <div class="product-main-img-wrap">
            <img
              id="product-main-img"
              src="${product.images[0].url}"
              alt="${product.images[0].alt}"
              class="product-main-img"
              width="600"
              height="600"
            >
          </div>
          ${product.images.length > 1 ? `<div class="product-thumbnails" role="list" aria-label="Product image thumbnails">${thumbs}</div>` : ''}
        </div>

        <!-- ── Info ── -->
        <div class="product-info" data-product-id="${product.id}">
          <h1 class="product-name display-headline">${product.title}</h1>
          <span class="product-price label-xl">$${product.price}</span>
          <blockquote class="product-story">${descFirst}</blockquote>
          ${descRest ? `<p class="product-description">${descRest}</p>` : ''}

          <!-- Color selector -->
          ${product.colors.length > 0 ? `
          <div class="product-option">
            <p class="option-label">
              COLOR: <span id="selected-color-label">${product.colors[0]}</span>
            </p>
            <div class="color-swatches" role="radiogroup" aria-label="Select a color">
              ${swatches}
            </div>
          </div>
          ` : ''}

          <!-- Size selector -->
          <div class="product-option">
            <div class="option-label-row">
              <p class="option-label">
                SIZE: <span id="selected-size-label">M</span>
              </p>
              <!-- Size guide: hidden until real URL is available -->
            </div>
            <div class="size-pills" role="radiogroup" aria-label="Select a size">
              ${sizes}
            </div>
          </div>

          <!-- Add to cart -->
          <button
            class="btn-primary btn-full"
            id="product-add-btn"
            data-product-id="${product.id}"
          >
            ADD TO CART
          </button>

          <!-- Trust strip -->
          <div class="product-trust-strip" aria-label="Product assurances">
            <span class="trust-badge">
              <span class="trust-badge-icon">🇺🇸</span>
              Printed in the US
            </span>
            <span class="trust-badge">
              <span class="trust-badge-icon">♻</span>
              Sustainably sourced
            </span>
            <span class="trust-badge">
              <span class="trust-badge-icon">✦</span>
              Premium cotton
            </span>
          </div>

          <!-- Details & Care accordion -->
          <div class="accordion">
            <button
              class="accordion-trigger"
              aria-expanded="false"
              aria-controls="accordion-details-panel"
              id="accordion-details-btn"
            >
              DETAILS &amp; CARE
              <span class="accordion-icon" aria-hidden="true">+</span>
            </button>
            <div
              class="accordion-panel"
              id="accordion-details-panel"
              role="region"
              aria-labelledby="accordion-details-btn"
              hidden
            >
              <p style="margin-bottom:0.8rem; color: var(--text-muted);">
                Premium heavyweight unisex tee. 100% combed and ring-spun cotton (heather colors contain polyester).
                Printed in the US via direct-to-garment on demand.
              </p>
              <div class="care-row"><span class="care-icon">🌡</span> Machine wash cold, inside out</div>
              <div class="care-row"><span class="care-icon">✂</span> Tear-away label for clean wear</div>
              <div class="care-row"><span class="care-icon">♻</span> Sustainably sourced cotton</div>
              <div class="care-row"><span class="care-icon">🚫</span> Do not bleach or tumble dry high</div>
            </div>
          </div>

        </div><!-- /product-info -->
      </div><!-- /product-detail-grid -->

      <!-- ── Related Products ── -->
      <section class="related-products" aria-label="You may also like">
        <div class="section-container">
          <p class="section-label">YOU MAY ALSO LIKE</p>
          <div class="related-products-grid" id="related-grid"></div>
        </div>
      </section>

    </div><!-- /product-detail -->
  `;
}

/**
 * Attaches all interactive event listeners to the product detail view.
 * Must be called AFTER renderProductDetail() HTML is in the DOM.
 * @param {number} productId
 */
function initProductDetail(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Track selected state — default to first available size (not hardcoded M)
  let selectedColor = product.colors[0] || '';
  let selectedSize = product.sizes[0] || null;

  // ── Color swatch selection ────────────────────────────────────────
  const swatchGroup = document.querySelector('.color-swatches');
  const colorLabel = document.getElementById('selected-color-label');

  if (swatchGroup) {
    swatchGroup.addEventListener('click', e => {
      const btn = e.target.closest('.swatch-btn');
      if (!btn) return;

      // Deselect all
      swatchGroup.querySelectorAll('.swatch-btn').forEach(b => {
        b.setAttribute('aria-checked', 'false');
      });
      // Select clicked
      btn.setAttribute('aria-checked', 'true');
      selectedColor = btn.dataset.color;
      if (colorLabel) colorLabel.textContent = selectedColor;
    });

    // Keyboard support for swatch group
    swatchGroup.addEventListener('keydown', e => {
      const swatches = [...swatchGroup.querySelectorAll('.swatch-btn')];
      const current = swatches.findIndex(b => b.getAttribute('aria-checked') === 'true');
      let next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % swatches.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + swatches.length) % swatches.length;
      }
      if (next >= 0) {
        e.preventDefault();
        swatches[next].click();
        swatches[next].focus();
      }
    });
  }

  // ── Size pill selection ───────────────────────────────────────────
  const sizeGroup = document.querySelector('.size-pills');
  const sizeLabel = document.getElementById('selected-size-label');

  if (sizeGroup) {
    sizeGroup.addEventListener('click', e => {
      const btn = e.target.closest('.size-btn');
      if (!btn) return;

      sizeGroup.querySelectorAll('.size-btn').forEach(b => {
        b.setAttribute('aria-checked', 'false');
      });
      btn.setAttribute('aria-checked', 'true');
      selectedSize = btn.dataset.size;
      if (sizeLabel) sizeLabel.textContent = selectedSize;
    });
  }

  // ── Thumbnail selection ───────────────────────────────────────────
  const thumbContainer = document.querySelector('.product-thumbnails');
  const mainImg = document.getElementById('product-main-img');

  if (thumbContainer && mainImg) {
    thumbContainer.addEventListener('click', e => {
      const thumb = e.target.closest('.product-thumb-wrap');
      if (!thumb) return;

      thumbContainer.querySelectorAll('.product-thumb-wrap').forEach(t => {
        t.classList.remove('active');
      });
      thumb.classList.add('active');
      // Load the real image URL from the data attribute
      const imgUrl = thumb.dataset.imgUrl;
      if (imgUrl) {
        mainImg.style.opacity = '0';
        mainImg.style.transition = 'opacity 0.25s ease';
        setTimeout(() => {
          mainImg.src = imgUrl;
          mainImg.onload = () => { mainImg.style.opacity = '1'; };
        }, 120);
      }
    });

    // Keyboard support for thumbnails
    thumbContainer.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        const thumb = e.target.closest('.product-thumb-wrap');
        if (thumb) { e.preventDefault(); thumb.click(); }
      }
    });
  }

  // ── Add to cart button ────────────────────────────────────────────
  const addBtn = document.getElementById('product-add-btn');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      // Guard: require size selection
      if (!selectedSize) {
        if (sizeGroup) {
          sizeGroup.classList.remove('shake');
          void sizeGroup.offsetWidth; // reflow to restart animation
          sizeGroup.classList.add('shake');
          sizeGroup.addEventListener('animationend', () => sizeGroup.classList.remove('shake'), { once: true });
        }
        return;
      }
      CartState.addToCart(productId, selectedColor, selectedSize, 1);

      // Success state feedback
      const originalText = addBtn.textContent;
      addBtn.textContent = 'ADDED ✓';
      addBtn.classList.add('success-state');
      addBtn.disabled = true;

      setTimeout(() => {
        addBtn.textContent = originalText;
        addBtn.classList.remove('success-state');
        addBtn.disabled = false;
      }, 1500);
    });
  }

  // ── Accordion ─────────────────────────────────────────────────────
  const accordionTrigger = document.getElementById('accordion-details-btn');
  const accordionPanel = document.getElementById('accordion-details-panel');

  if (accordionTrigger && accordionPanel) {
    accordionTrigger.addEventListener('click', () => {
      const isExpanded = accordionTrigger.getAttribute('aria-expanded') === 'true';
      accordionTrigger.setAttribute('aria-expanded', !isExpanded);
      accordionPanel.hidden = isExpanded;
    });
  }

  // ── Back link ─────────────────────────────────────────────────────
  // Navigation is handled by the global [data-route] click delegate in app.js.
  // No custom handler needed — it navigates to href="/" automatically.

  // ── Related products ──────────────────────────────────────────────
  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    const productTags = product.tags || [];
    let related = PRODUCTS.filter(p =>
      p.id !== product.id &&
      (p.tags || []).some(t => productTags.includes(t))
    ).slice(0, 3);

    // Fallback: any other products if no tag matches
    if (related.length < 3) {
      const extras = PRODUCTS.filter(p => p.id !== product.id && !related.find(r => r.id === p.id));
      related = [...related, ...extras].slice(0, 3);
    }

    relatedGrid.innerHTML = related.map(p => `
      <article class="related-card">
        <a href="/product/${p.id}" class="related-card-img-link" data-route aria-label="View ${p.title}">
          <div class="related-card-img-wrap">
            <img src="${p.images[0].url}" alt="${p.images[0].alt}"
              class="related-card-img" loading="lazy" width="220" height="293">
          </div>
        </a>
        <div class="related-card-body">
          <a href="/product/${p.id}" class="related-card-title" data-route>${p.title}</a>
          <span class="related-card-price">$${p.price}</span>
        </div>
      </article>
    `).join('');
  }
}
