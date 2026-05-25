/**
 * POST /api/webhook
 * Handles Stripe webhook events.
 * On checkout.session.completed: creates a Printify production order.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY       — from Stripe dashboard > API keys
 *   STRIPE_WEBHOOK_SECRET   — from Stripe dashboard > Webhooks > signing secret
 *   PRINTIFY_API_KEY        — from Printify > Connections > API
 *   PRINTIFY_SHOP_ID        — numeric shop ID
 *
 * Stripe setup:
 *   Endpoint URL:  https://naturallyelevatedco.com/api/webhook
 *   Events to send: checkout.session.completed
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PRINTIFY_BASE = 'https://api.printify.com/v1';

/**
 * Finds the Printify variant_id for a given product + color + size.
 * Printify variant titles are like "S / Black" or "Black / S" — we match both orders.
 *
 * @param {string} productId  - Printify product UUID
 * @param {string} color
 * @param {string} size
 * @returns {Promise<number|null>} variantId or null if not found
 */
async function findVariantId(productId, color, size) {
  const { PRINTIFY_API_KEY, PRINTIFY_SHOP_ID } = process.env;

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
    {
      headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` }
    }
  );

  if (!res.ok) {
    console.error(`[webhook] Could not fetch Printify product ${productId}:`, res.status);
    return null;
  }

  const product = await res.json();
  const variants = (product.variants || []).filter(v => v.is_enabled);

  // Try both "Size / Color" and "Color / Size" title patterns
  const patterns = [
    `${size} / ${color}`,
    `${color} / ${size}`,
    size,  // single-option products
    color
  ];

  for (const pat of patterns) {
    const match = variants.find(v =>
      v.title.toLowerCase() === pat.toLowerCase()
    );
    if (match) return match.id;
  }

  // Partial match fallback — find variant containing both color and size
  const partial = variants.find(v => {
    const t = v.title.toLowerCase();
    return t.includes(color.toLowerCase()) && t.includes(size.toLowerCase());
  });

  if (partial) return partial.id;

  console.warn(`[webhook] No variant found for product ${productId} color="${color}" size="${size}"`);
  return null;
}

/**
 * Creates a Printify production order for the completed Stripe session.
 * @param {object} session - Stripe checkout session object
 */
async function createPrintifyOrder(session) {
  const { PRINTIFY_SHOP_ID, PRINTIFY_API_KEY } = process.env;

  // Parse cart items stored in Stripe session metadata
  let items;
  try {
    items = JSON.parse(session.metadata.items || '[]');
  } catch {
    console.error('[webhook] Could not parse session.metadata.items');
    return;
  }

  if (!items.length) {
    console.error('[webhook] Empty cart in session metadata');
    return;
  }

  // Extract shipping address from Stripe session
  const shipping = session.shipping_details || {};
  const address = shipping.address || {};
  const name = (shipping.name || session.customer_details?.name || '').trim();
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || firstName;

  const email = session.customer_details?.email || '';

  // Build Printify line items — one per cart item (respecting qty via multiple entries or quantity field)
  const lineItems = [];

  for (const item of items) {
    if (!item.productId) {
      console.warn('[webhook] Skipping item with no productId:', item);
      continue;
    }

    const variantId = await findVariantId(item.productId, item.color || '', item.size || '');
    if (!variantId) {
      console.error(`[webhook] Skipping item — no variant found: ${item.title} ${item.color}/${item.size}`);
      continue;
    }

    lineItems.push({
      product_id: item.productId,
      variant_id: variantId,
      quantity: item.qty || 1
    });
  }

  if (!lineItems.length) {
    console.error('[webhook] No valid line items — Printify order not created');
    return;
  }

  const orderPayload = {
    label:          `Order-${session.id.slice(-8).toUpperCase()}`,
    line_items:     lineItems,
    shipping_method: 1,              // standard shipping (1 = economy/standard for most blueprints)
    send_shipping_notification: true,
    address_to: {
      first_name:   firstName || 'Customer',
      last_name:    lastName  || '',
      email:        email,
      address1:     address.line1        || '',
      address2:     address.line2        || '',
      city:         address.city         || '',
      state:        address.state        || '',
      zip:          address.postal_code  || '',
      country:      address.country      || 'US'
    }
  };

  const orderRes = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(orderPayload)
    }
  );

  if (!orderRes.ok) {
    const errText = await orderRes.text();
    console.error('[webhook] Printify order creation failed:', orderRes.status, errText);
    return;
  }

  const order = await orderRes.json();
  console.log('[webhook] Printify order created:', order.id, 'for Stripe session:', session.id);
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const { STRIPE_WEBHOOK_SECRET } = process.env;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] Missing STRIPE_WEBHOOK_SECRET env var');
    return { statusCode: 503, body: 'Webhook not configured' };
  }

  // Stripe signature verification requires the raw (unparsed) body as a Buffer
  const rawBody = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle the event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    // Fire-and-forget: Stripe expects a fast 200; log any errors internally
    createPrintifyOrder(session).catch(err =>
      console.error('[webhook] createPrintifyOrder threw:', err)
    );
  }

  // Always return 200 immediately — Stripe retries on failure
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true })
  };
};
