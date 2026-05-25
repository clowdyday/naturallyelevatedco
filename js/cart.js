/**
 * cart.js — Cart state management + drawer UI
 *
 * CartState is the single source of truth for cart data.
 * All mutations go through CartState methods, which persist to localStorage
 * and trigger a re-render of the cart drawer UI.
 *
 * Cart item shape (stored in localStorage as nec_cart):
 * { productId, title, color, size, price, qty, imageUrl }
 */

const CartState = (() => {
  const STORAGE_KEY = 'nec_cart';

  // ─── Private state ───────────────────────────────────────────────
  let _items = [];

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _items = raw ? JSON.parse(raw) : [];
    } catch (e) {
      _items = [];
    }
  }

  function _save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_items));
    _updateBadge();
    renderCartDrawer();
  }

  function _itemKey(productId, color, size) {
    return `${productId}__${color}__${size}`;
  }

  // ─── Badge update ─────────────────────────────────────────────────
  function _updateBadge() {
    const count = getCartCount();
    const badge = document.getElementById('cart-count');
    const mobileBadge = document.getElementById('mobile-cart-count');

    if (badge) {
      badge.textContent = count;
      badge.hidden = count === 0;
    }
    if (mobileBadge) {
      mobileBadge.textContent = count;
      mobileBadge.hidden = count === 0;
    }
  }

  // ─── Public API ───────────────────────────────────────────────────

  function addToCart(productId, color, size, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = _items.find(
      i => i.productId === productId && i.color === color && i.size === size
    );

    if (existing) {
      existing.qty += qty;
    } else {
      _items.push({
        productId,
        title: product.title,
        color,
        size,
        price: product.price,
        qty,
        imageUrl: product.images[0]?.url || ''
      });
    }

    _save();
    openCartDrawer();
  }

  function removeFromCart(productId, color, size) {
    _items = _items.filter(
      i => !(i.productId === productId && i.color === color && i.size === size)
    );
    _save();
  }

  function updateQty(productId, color, size, delta) {
    const item = _items.find(
      i => i.productId === productId && i.color === color && i.size === size
    );
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId, color, size);
    } else {
      _save();
    }
  }

  function getCart() { return [..._items]; }

  function getCartCount() {
    return _items.reduce((sum, i) => sum + i.qty, 0);
  }

  function getSubtotal() {
    return _items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function clearCart() {
    _items = [];
    _save();
  }

  // ─── Drawer UI ────────────────────────────────────────────────────

  function renderCartDrawer() {
    const container = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal');

    if (!container) return;

    if (_items.length === 0) {
      if (emptyState) emptyState.style.display = '';
      if (footer) footer.hidden = true;
      // Remove any dynamically added item rows
      container.querySelectorAll('.cart-item').forEach(el => el.remove());
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (footer) footer.hidden = false;

    // Free shipping progress bar
    const subtotal = getSubtotal();
    if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
    const shippingBar = document.getElementById('cart-shipping-bar');
    if (shippingBar) {
      const pct = Math.min((subtotal / 50) * 100, 100);
      const msg = subtotal >= 50
        ? '🎉 Free shipping unlocked!'
        : `Add $${(50 - subtotal).toFixed(2)} more for free shipping`;
      shippingBar.innerHTML = `
        <div class="cart-shipping-bar-track">
          <div class="cart-shipping-fill" style="width: ${pct}%"></div>
        </div>
        <p class="cart-shipping-msg">${msg}</p>
      `;
    }

    // Rebuild item list
    const existingItems = container.querySelectorAll('.cart-item');
    existingItems.forEach(el => el.remove());

    const fragment = document.createDocumentFragment();
    _items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.dataset.productId = item.productId;
      el.dataset.color = item.color;
      el.dataset.size = item.size;
      el.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-img" width="60" height="60">
        <div class="cart-item-info">
          <p class="cart-item-title">${item.title}</p>
          <p class="cart-item-variant">${item.color} / ${item.size}</p>
          <div class="cart-item-controls">
            <div class="qty-stepper" role="group" aria-label="Quantity">
              <button class="qty-btn qty-minus" aria-label="Decrease quantity" data-pid="${item.productId}" data-color="${item.color}" data-size="${item.size}">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn qty-plus" aria-label="Increase quantity" data-pid="${item.productId}" data-color="${item.color}" data-size="${item.size}">+</button>
            </div>
            <span class="cart-item-price">$${item.price * item.qty}</span>
          </div>
        </div>
        <button class="cart-item-remove" aria-label="Remove ${item.title} from cart" data-pid="${item.productId}" data-color="${item.color}" data-size="${item.size}">✕</button>
      `;
      fragment.appendChild(el);
    });
    container.insertBefore(fragment, emptyState);
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');

    // Focus the close button for accessibility
    const closeBtn = document.getElementById('cart-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (!drawer || !overlay) return;

    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');

    // Return focus to cart button
    const cartBtn = document.getElementById('nav-cart-btn');
    if (cartBtn) cartBtn.focus();
  }

  // ─── Event delegation for drawer buttons ─────────────────────────
  function _initDrawerEvents() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    const closeBtn = document.getElementById('cart-close-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', closeCartDrawer);
    }
    if (overlay) {
      overlay.addEventListener('click', closeCartDrawer);
    }

    // Delegate qty and remove button clicks inside drawer
    if (drawer) {
      drawer.addEventListener('click', e => {
        const btn = e.target.closest('[data-pid]');
        if (!btn) return;

        // Support both integer IDs (static catalog) and UUID strings (Printify)
        const rawPid = btn.dataset.pid;
        const pid = /^\d+$/.test(rawPid) ? parseInt(rawPid, 10) : rawPid;
        const color = btn.dataset.color;
        const size = btn.dataset.size;

        if (btn.classList.contains('qty-minus')) {
          updateQty(pid, color, size, -1);
        } else if (btn.classList.contains('qty-plus')) {
          updateQty(pid, color, size, 1);
        } else if (btn.classList.contains('cart-item-remove')) {
          removeFromCart(pid, color, size);
        }
      });
    }

    // Nav cart button
    const navCartBtn = document.getElementById('nav-cart-btn');
    const mobileCartBtn = document.getElementById('mobile-cart-btn');
    if (navCartBtn) navCartBtn.addEventListener('click', openCartDrawer);
    if (mobileCartBtn) mobileCartBtn.addEventListener('click', () => {
      closeMobileNav();
      openCartDrawer();
    });

    // Keyboard trap in drawer
    if (drawer) {
      drawer.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeCartDrawer();
      });
    }
  }

  // ─── Init ─────────────────────────────────────────────────────────
  function init() {
    _load();
    _updateBadge();
    document.addEventListener('DOMContentLoaded', () => {
      _initDrawerEvents();
      renderCartDrawer();
    });
  }

  return {
    init,
    addToCart,
    removeFromCart,
    updateQty,
    getCart,
    getCartCount,
    getSubtotal,
    clearCart,
    renderCartDrawer,
    openCartDrawer,
    closeCartDrawer
  };
})();

CartState.init();
