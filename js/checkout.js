// INTEGRATION NOTE: Replace initiateCheckout() below with a fetch() POST to
// /api/create-checkout-session (Stripe). The payload shape is already structured
// to match what the backend will expect: { items: cart[] }
//
// Each item in the cart array has the shape:
// { productId, title, color, size, price, qty, imageUrl }
//
// When the backend is ready, the flow will be:
// 1. POST /api/create-checkout-session → returns { url: stripeCheckoutUrl }
// 2. Redirect browser to stripeCheckoutUrl
// 3. Stripe handles payment, redirects to /success on completion
// 4. /success page confirms the order

/**
 * Initiates the checkout flow.
 * Currently: shows a stub alert and logs the cart payload.
 * TODO: Replace with POST /api/create-checkout-session (Stripe)
 */
function initiateCheckout() {
  // TODO: Replace with POST /api/create-checkout-session (Stripe)
  const cart = CartState.getCart();

  if (!cart.length) {
    showCheckoutError('Your cart is empty. Add some items before checking out.');
    return;
  }

  const payload = {
    items: cart.map(item => ({
      productId: item.productId,
      title: item.title,
      color: item.color,
      size: item.size,
      price: item.price,
      qty: item.qty,
      imageUrl: item.imageUrl
    }))
  };

  // Show loading state on the checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'PROCESSING...';
  }

  fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      if (data.url) {
        CartState.clearCart();
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        throw new Error('No checkout URL returned');
      }
    })
    .catch(err => {
      console.error('[Checkout] Error:', err);
      showCheckoutError('A network error occurred. Please try again.');
      // Restore button state on error
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'CHECKOUT';
      }
    });
}

/**
 * Displays an error message in the cart drawer near the checkout button.
 * Auto-dismisses after 4 seconds.
 * @param {string} message - The error message to display
 */
function showCheckoutError(message) {
  const existing = document.getElementById('checkout-error');
  if (existing) existing.remove();

  const errorEl = document.createElement('p');
  errorEl.id = 'checkout-error';
  errorEl.className = 'checkout-error';
  errorEl.textContent = message;

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.insertAdjacentElement('beforebegin', errorEl);
  }

  setTimeout(() => {
    if (errorEl.parentNode) errorEl.remove();
  }, 4000);
}
