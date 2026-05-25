/**
 * GET /api/products
 * Cloudflare Pages Function — fetches the Printify catalog and returns NEC-shaped products.
 *
 * Env vars (set in Cloudflare Pages dashboard):
 *   PRINTIFY_API_KEY  — from Printify > Account > Connections > API
 *   PRINTIFY_SHOP_ID  — 27526347 (your Etsy shop)
 */

const PRINTIFY_BASE = 'https://api.printify.com/v1';
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

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
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const enabledVariants = (p.variants || []).filter(v => v.is_enabled);
  const minPriceCents = enabledVariants.length
    ? Math.min(...enabledVariants.map(v => v.price))
    : 0;
  const price = Math.round(minPriceCents / 100);

  const defaultImages = (p.images || []).filter(img => img.is_default);
  const imageSources = defaultImages.length ? defaultImages : (p.images || []).slice(0, 3);
  const images = imageSources.map(img => ({ url: img.src, alt: p.title }));

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

export async function onRequestGet(context) {
  const { env } = context;
  const { PRINTIFY_API_KEY, PRINTIFY_SHOP_ID } = env;

  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    return new Response(
      JSON.stringify({ error: 'Product API not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const res = await fetch(
      `${PRINTIFY_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('[products] Printify error:', res.status, text);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Printify' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const json = await res.json();
    const rawProducts = Array.isArray(json) ? json : (json.data || []);
    const products = rawProducts
      .filter(p => p.visible !== false)
      .map(transformProduct);

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      }
    });
  } catch (err) {
    console.error('[products] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
