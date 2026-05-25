/**
 * POST /api/webhook
 * Cloudflare Pages Function — verifies Stripe webhook and creates a Printify order.
 *
 * Env vars (set in Cloudflare Pages dashboard):
 *   STRIPE_SECRET_KEY       — sk_live_...
 *   STRIPE_WEBHOOK_SECRET   — whsec_... (from Stripe Webhooks dashboard)
 *   PRINTIFY_API_KEY        — your Printify API token
 *   PRINTIFY_SHOP_ID        — 27526347
 */

import Stripe from 'stripe';

const PRINTIFY_BASE = 'https://api.printify.com/v1';

async function createPrintifyOrder(items, session, env) {
  const { PRINTIFY_API_KEY, PRINTIFY_SHOP_ID } = env;
  const addr = session.shipping_details?.address || {};
  const name = session.shipping_details?.name || 'Customer';
  const [firstName, ...rest] = name.split(' ');
  const lastName = rest.join(' ') || firstName;

  // Group items by productId
  const lineItems = [];

  for (const item of items) {
    // Fetch the Printify product to find the correct variant ID
    const productRes = await fetch(
      `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${item.productId}.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
    );

    if (!productRes.ok) {
      console.error(`[webhook] Could not fetch product ${item.productId}`);
      continue;
    }

    const product = await productRes.json();

    // Find variant matching size + color
    // Printify variant titles can be "Color / Size" or "Size / Color"
    const targetA = `${item.size} / ${item.color}`;
    const targetB = `${item.color} / ${item.size}`;
    const variant = product.variants?.find(v =>
      v.is_enabled && (v.title === targetA || v.title === targetB)
    );

    if (!variant) {
      console.error(`[webhook] No variant found for ${item.color} / ${item.size} on product ${item.productId}`);
      continue;
    }

    lineItems.push({
      product_id: item.productId,
      variant_id: variant.id,
      quantity: item.qty
    });
  }

  if (lineItems.length === 0) {
    console.error('[webhook] No valid line items — skipping Printify order');
    return;
  }

  const orderPayload = {
    label: `Order-${session.id.slice(-8).toUpperCase()}`,
    line_items: lineItems,
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: firstName,
      last_name: lastName,
      email: session.customer_details?.email || '',
      phone: session.customer_details?.phone || '',
      address1: addr.line1 || '',
      address2: addr.line2 || '',
      city: addr.city || '',
      region: addr.state || '',
      zip: addr.postal_code || '',
      country: addr.country || 'US'
    }
  };

  const orderRes = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    }
  );

  if (!orderRes.ok) {
    const text = await orderRes.text();
    console.error('[webhook] Printify order failed:', orderRes.status, text);
  } else {
    const order = await orderRes.json();
    console.log('[webhook] Printify order created:', order.id);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = env;

  const sig = request.headers.get('stripe-signature');
  // Must read raw text — signature verification requires the exact bytes Stripe sent
  const rawBody = await request.text();

  let event;
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient()
    });
    // constructEventAsync + SubtleCryptoProvider is required in Workers (no Node crypto)
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let items = [];

    try {
      items = JSON.parse(session.metadata?.items || '[]');
    } catch {
      console.error('[webhook] Could not parse items metadata');
    }

    if (items.length > 0) {
      // Fire-and-forget — we already returned 200, Stripe won't retry
      context.waitUntil(createPrintifyOrder(items, session, env));
    }
  }

  // Always return 200 immediately — Stripe retries on non-200
  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
