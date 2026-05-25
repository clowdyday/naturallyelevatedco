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
import ADMIN_HTML from './admin-page.js';

const PRINTIFY_BASE = 'https://api.printify.com/v1';
const CF_GRAPHQL   = 'https://api.cloudflare.com/client/v4/graphql';
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

const STATIC_PRODUCT_IDS = [
  '6a08d78574d5c75c190409e6',
  '6a08d157b7acc2cf2206b880',
  '6a08cf7f4b43cb78f60f27a0',
  '6a08c9e82c5d71edb90f1020',
  '6a05eaf367059491f90663d9',
  '6a05e55b05d63cc97f0583de',
  '6a04b9645540b782e103ca06',
  '6a04b6e1963577f6d9075545',
  '6a04b59fd54e5aa2fa00f786',
  '6a04b2f4963577f6d90752bb',
  '6a04b0d14261b0d2ea07e77e',
  '6a04ae98b14e025c990e8102'
];

async function handleSitemap(env) {
  const BASE = 'https://naturallyelevated.co';
  const today = new Date().toISOString().slice(0, 10);
  const STATIC = [
    { loc: '/',        priority: '1.0', freq: 'weekly'  },
    { loc: '/shop',    priority: '0.9', freq: 'weekly'  },
    { loc: '/contact', priority: '0.6', freq: 'monthly' },
    { loc: '/faq',     priority: '0.6', freq: 'monthly' },
    { loc: '/tos',     priority: '0.3', freq: 'yearly'  },
    { loc: '/privacy', priority: '0.3', freq: 'yearly'  }
  ];

  let productIds = [...STATIC_PRODUCT_IDS];
  try {
    const PRINTIFY_API_KEY = (env.PRINTIFY_API_KEY || '').trim();
    const PRINTIFY_SHOP_ID = (env.PRINTIFY_SHOP_ID || '').trim();
    if (PRINTIFY_API_KEY && PRINTIFY_SHOP_ID) {
      const res = await fetch(
        `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`,
        { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
      );
      if (res.ok) {
        const body = await res.json();
        const raw = Array.isArray(body) ? body : (body.data || []);
        const live = raw.filter(p => p.visible !== false).map(p => p.id);
        if (live.length > 0) productIds = live;
      }
    }
  } catch {}

  const urls = [
    ...STATIC.map(p =>
      `  <url><loc>${BASE}${p.loc}</loc><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority><lastmod>${today}</lastmod></url>`
    ),
    ...productIds.map(id =>
      `  <url><loc>${BASE}/product/${id}</loc><changefreq>monthly</changefreq><priority>0.8</priority><lastmod>${today}</lastmod></url>`
    )
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'content-type': 'application/xml;charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=300'
    }
  });
}

async function handleAdminStats(request, env) {
  const key = request.headers.get('x-admin-key') || '';
  const ADMIN_PASSWORD = (env.ADMIN_PASSWORD || '').trim();
  if (!ADMIN_PASSWORD || key !== ADMIN_PASSWORD)
    return json({ error: 'Unauthorized' }, 401);

  const stripe = new Stripe((env.STRIPE_SECRET_KEY || '').trim(), {
    httpClient: Stripe.createFetchHttpClient()
  });

  const [sessionsRes, balanceRes, printifyRes] = await Promise.allSettled([
    stripe.checkout.sessions.list({ limit: 20 }),
    stripe.balance.retrieve(),
    fetch(`${PRINTIFY_BASE}/shops/${(env.PRINTIFY_SHOP_ID || '').trim()}/orders.json?limit=10`, {
      headers: { 'Authorization': `Bearer ${(env.PRINTIFY_API_KEY || '').trim()}` }
    })
  ]);

  const now = Date.now() / 1000;
  const todayTs = new Date().setHours(0, 0, 0, 0) / 1000;
  const monthTs = now - 30 * 86400;
  let revenueToday = 0, revenueMonth = 0, revenueTotal = 0;
  const orders = [];

  if (sessionsRes.status === 'fulfilled') {
    for (const s of sessionsRes.value.data.filter(s => s.payment_status === 'paid')) {
      const amt = (s.amount_total || 0) / 100;
      let items = '—';
      try { items = JSON.parse(s.metadata?.items || '[]').map(i => `${i.title} (${i.size}/${i.color})`).join(', '); } catch {}
      revenueTotal += amt;
      if (s.created >= monthTs) revenueMonth += amt;
      if (s.created >= todayTs) revenueToday += amt;
      orders.push({ id: s.id.slice(-8).toUpperCase(), customer: s.customer_details?.name || s.customer_details?.email || 'Customer', amount: amt, created: s.created, items });
    }
  }

  let printifyOrders = [];
  if (printifyRes.status === 'fulfilled' && printifyRes.value.ok) {
    const body = await printifyRes.value.json();
    const raw = Array.isArray(body) ? body : (body.data || []);
    printifyOrders = raw.slice(0, 10).map(o => ({
      label: o.label || ('ORD-' + String(o.id).slice(-6).toUpperCase()),
      status: o.status || 'pending',
      created: o.created_at || null
    }));
  }

  const balance = balanceRes.status === 'fulfilled' ? {
    available: balanceRes.value.available.reduce((s, b) => s + b.amount, 0) / 100,
    pending:   balanceRes.value.pending.reduce((s, b) => s + b.amount, 0) / 100
  } : { available: 0, pending: 0 };

  return json({ revenue: { today: revenueToday, month: revenueMonth, total: revenueTotal }, orderCount: orders.length, orders: orders.slice(0, 10), printifyOrders, balance });
}

async function handleAdminTraffic(request, env) {
  const key = request.headers.get('x-admin-key') || '';
  if (!((env.ADMIN_PASSWORD || '').trim()) || key !== (env.ADMIN_PASSWORD || '').trim())
    return json({ error: 'Unauthorized' }, 401);

  const cfToken = (env.CF_ANALYTICS_TOKEN || '').trim();
  const zoneId  = (env.CF_ZONE_ID || '').trim();
  if (!cfToken || !zoneId) return json({ today: null, week: null, month: null, lastHour: null, topPaths: [] });

  const now   = new Date();
  const d = s => new Date(now - s * 864e5).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const gql = (query) => fetch(CF_GRAPHQL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  try {
    const [dayRes, weekRes, monthRes, hourRes, pathRes] = await Promise.all([
      gql(`{ viewer { zones(filter:{zoneTag:"${zoneId}"}) { httpRequests1dGroups(limit:1,filter:{date_geq:"${today}",date_leq:"${today}"}) { sum{requests pageViews} uniq{uniques} } } } }`),
      gql(`{ viewer { zones(filter:{zoneTag:"${zoneId}"}) { httpRequests1dGroups(limit:7,filter:{date_geq:"${d(7)}",date_leq:"${today}"}) { sum{requests pageViews} uniq{uniques} } } } }`),
      gql(`{ viewer { zones(filter:{zoneTag:"${zoneId}"}) { httpRequests1dGroups(limit:30,filter:{date_geq:"${d(30)}",date_leq:"${today}"}) { sum{requests pageViews} uniq{uniques} } } } }`),
      gql(`{ viewer { zones(filter:{zoneTag:"${zoneId}"}) { httpRequests1hGroups(limit:1,orderBy:[datetime_DESC]) { sum{requests pageViews} uniq{uniques} } } } }`),
      gql(`{ viewer { zones(filter:{zoneTag:"${zoneId}"}) { httpRequestsAdaptiveGroups(limit:10,filter:{date_geq:"${d(7)}",date_leq:"${today}"},orderBy:[count_DESC]) { count dimensions{clientRequestPath} } } } }`)
    ]);

    const agg = async (r) => {
      if (!r.ok) return { requests: 0, pageViews: 0, uniques: 0 };
      const b = await r.json();
      const rows = b?.data?.viewer?.zones?.[0];
      const key = Object.keys(rows || {})[0];
      const groups = rows?.[key] || [];
      return groups.reduce((a, g) => ({
        requests:  a.requests  + (g.sum?.requests  || 0),
        pageViews: a.pageViews + (g.sum?.pageViews || 0),
        uniques:   a.uniques   + (g.uniq?.uniques  || 0)
      }), { requests: 0, pageViews: 0, uniques: 0 });
    };

    const [today_, week_, month_, hour_] = await Promise.all([agg(dayRes), agg(weekRes), agg(monthRes), agg(hourRes)]);

    let topPaths = [];
    if (pathRes.ok) {
      const pb = await pathRes.json();
      const rows = pb?.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
      topPaths = rows.map(r => ({ path: r.dimensions?.clientRequestPath || '/', uniques: r.count }))
        .filter(p => !p.path.startsWith('/api/') && !p.path.startsWith('/assets/'))
        .slice(0, 8);
    }

    return json({ today: today_, week: week_, month: month_, lastHour: hour_, topPaths });
  } catch {
    return json({ today: null, week: null, month: null, lastHour: null, topPaths: [] });
  }
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

      if (url.pathname === '/sitemap.xml')
        return await handleSitemap(env);

      if (url.pathname === '/admin' || url.pathname === '/admin/')
        return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });

      if (url.pathname === '/api/admin/stats' && request.method === 'GET')
        return await handleAdminStats(request, env);

      if (url.pathname === '/api/admin/traffic' && request.method === 'GET')
        return await handleAdminTraffic(request, env);

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
