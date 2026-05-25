/**
 * cf-worker/worker.js — Naturally Elevated Co. Cloudflare Worker
 *
 * Handles all API routes, then falls back to static assets (ASSETS binding).
 * Mirrors the DeeplyDeranged worker pattern.
 *
 * Env vars (set via `wrangler secret put` or Cloudflare dashboard):
 *   PRINTIFY_API_KEY        — Printify > Account > Connections > API
 *   PRINTIFY_SHOP_ID        — 27526347
 *   STRIPE_SECRET_KEY       — sk_live_...
 *   STRIPE_WEBHOOK_SECRET   — whsec_...
 */

import Stripe from 'stripe';

const PRINTIFY_BASE = 'https://api.printify.com/v1';
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

// ── Helpers ────────────────────────────────────────────────────────────────────

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json;charset=utf-8' }
  });
}

function text(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain;charset=utf-8' }
  });
}

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function transformProduct(p) {
  const optionMap = {};
  (p.options || []).forEach(opt => {
    optionMap[opt.name] = opt.values.map(v => v.title);
  });
  const colors = optionMap['Color'] || optionMap['color'] || [];
  const rawSizes = optionMap['Size'] || optionMap['size'] || [];
  const sizes = [...rawSizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a), bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  const enabled = (p.variants || []).filter(v => v.is_enabled);
  const price = enabled.length ? Math.round(Math.min(...enabled.map(v => v.price)) / 100) : 0;
  const defaultImgs = (p.images || []).filter(i => i.is_default);
  const images = (defaultImgs.length ? defaultImgs : (p.images || []).slice(0, 3))
    .map(i => ({ url: i.src, alt: p.title }));
  return {
    id: p.id,
    title: p.title,
    description: stripHtml(p.description),
    price,
    colors,
    sizes,
    images,
    tags: p.tags || [],
    featured: (p.tags || []).map(t => t.toLowerCase()).includes('featured')
  };
}

// ── API route handlers ─────────────────────────────────────────────────────────

async function handleProducts(env) {
  const PRINTIFY_API_KEY = (env.PRINTIFY_API_KEY || '').trim();
  const PRINTIFY_SHOP_ID = (env.PRINTIFY_SHOP_ID || '').trim();
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID)
    return json({ error: 'Product API not configured' }, 503);

  const res = await fetch(
    `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`,
    { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}`, 'Content-Type': 'application/json' } }
  );
  if (!res.ok) {
    const errText = await res.text();
    console.error('[products] Printify error:', res.status, errText);
    return json({ error: 'Failed to fetch from Printify', status: res.status, detail: errText }, 502);
  }

  const body = await res.json();
  const raw = Array.isArray(body) ? body : (body.data || []);
  const products = raw.filter(p => p.visible !== false).map(transformProduct);

  return new Response(JSON.stringify(products), {
    status: 200,
    headers: {
      'content-type': 'application/json;charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
    }
  });
}

async function handleCheckout(request, env) {
  const STRIPE_SECRET_KEY = (env.STRIPE_SECRET_KEY || '').trim();
  const origin = (env.PUBLIC_SITE_ORIGIN || '').trim() || new URL(request.url).origin;

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid request body' }, 400); }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0)
    return json({ error: 'Cart is empty' }, 400);

  for (const item of items) {
    if (!item.title || typeof item.price !== 'number' || item.price <= 0 ||
        !Number.isInteger(item.qty) || item.qty <= 0)
      return json({ error: 'Invalid item in cart' }, 400);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient()
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.title,
          description: `${item.color} / ${item.size}`,
          images: item.imageUrl ? [item.imageUrl] : []
        }
      },
      quantity: item.qty
    })),
    shipping_address_collection: { allowed_countries: ['US'] },
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
    metadata: { items: JSON.stringify(items) }
  });

  return json({ url: session.url });
}

async function handleWebhook(request, env) {
  const STRIPE_SECRET_KEY = (env.STRIPE_SECRET_KEY || '').trim();
  const STRIPE_WEBHOOK_SECRET = (env.STRIPE_WEBHOOK_SECRET || '').trim();
  const PRINTIFY_API_KEY = (env.PRINTIFY_API_KEY || '').trim();
  const PRINTIFY_SHOP_ID = (env.PRINTIFY_SHOP_ID || '').trim();
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient()
    });
    event = await stripe.webhooks.constructEventAsync(
      rawBody, sig, STRIPE_WEBHOOK_SECRET, undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    return text(`Webhook error: ${err.message}`, 400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let items = [];
    try { items = JSON.parse(session.metadata?.items || '[]'); } catch {}

    if (items.length > 0) {
      const addr = session.shipping_details?.address || {};
      const name = session.shipping_details?.name || 'Customer';
      const [firstName, ...rest] = name.split(' ');
      const lineItems = [];

      for (const item of items) {
        const pRes = await fetch(
          `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${item.productId}.json`,
          { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
        );
        if (!pRes.ok) continue;
        const product = await pRes.json();
        const targetA = `${item.size} / ${item.color}`;
        const targetB = `${item.color} / ${item.size}`;
        const variant = (product.variants || []).find(v =>
          v.is_enabled && (v.title === targetA || v.title === targetB)
        );
        if (!variant) continue;
        lineItems.push({ product_id: item.productId, variant_id: variant.id, quantity: item.qty });
      }

      if (lineItems.length > 0) {
        await fetch(`${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/orders.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            label: `Order-${session.id.slice(-8).toUpperCase()}`,
            line_items: lineItems,
            shipping_method: 1,
            send_shipping_notification: true,
            address_to: {
              first_name: firstName,
              last_name: rest.join(' ') || firstName,
              email: session.customer_details?.email || '',
              address1: addr.line1 || '',
              address2: addr.line2 || '',
              city: addr.city || '',
              region: addr.state || '',
              zip: addr.postal_code || '',
              country: 'US'
            }
          })
        });
      }
    }
  }

  return json({ received: true });
}

// ── Main export ────────────────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    // Propagate Worker env bindings → process.env for any modules that read it
    for (const [k, v] of Object.entries(env)) {
      if (typeof v === 'string' && !(k in process.env)) {
        process.env[k] = v;
      }
    }

    const url = new URL(request.url);

    // www → apex redirect
    if (url.hostname === 'www.naturallyelevated.co') {
      const canonical = new URL(request.url);
      canonical.hostname = 'naturallyelevated.co';
      return Response.redirect(canonical.toString(), 301);
    }

    // API routes
    try {
      if (url.pathname === '/api/products' && request.method === 'GET')
        return await handleProducts(env);

      if (url.pathname === '/api/create-checkout-session' && request.method === 'POST')
        return await handleCheckout(request, env);

      if ((url.pathname === '/api/webhook' || url.pathname === '/api/stripe-webhook') && request.method === 'POST')
        return await handleWebhook(request, env);

      if (url.pathname.startsWith('/api/'))
        return json({ error: 'Not found' }, 404);
    } catch (err) {
      console.error('[worker] API error:', err);
      return json({ error: 'Internal server error' }, 500);
    }

    // Everything else → static assets (SPA fallback handles unknown routes)
    return env.ASSETS.fetch(request);
  }
};
