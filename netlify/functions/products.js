/**
 * GET /api/products
 * Fetches the product catalog from Printify and transforms it to the NEC shape.
 *
 * Required env vars:
 *   PRINTIFY_API_KEY  — from Printify > Connections > API
 *   PRINTIFY_SHOP_ID  — numeric shop ID (visible in Printify URL)
 *
 * Response: JSON array of NEC product objects, cached 5 minutes at CDN.
 */

const PRINTIFY_BASE = 'https://api.printify.com/v1';

// Canonical size order for display
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

/**
 * Strip HTML tags and decode common HTML entities from Printify description HTML.
 * @param {string} html
 * @returns {string}
 */
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

/**
 * Transform a Printify product object into the NEC product shape.
 * @param {object} p - Printify product
 * @returns {object} NEC product
 */
function transformProduct(p) {
  // Build option-name → values map  e.g. { Color: ['Black', 'White'], Size: ['S', 'M', ...] }
  const optionMap = {};
  (p.options || []).forEach(opt => {
    optionMap[opt.name] = opt.values.map(v => v.title);
  });

  const colors = optionMap['Color'] || optionMap['color'] || [];
  const rawSizes = optionMap['Size'] || optionMap['size'] || [];
  // Sort sizes into canonical order; unknowns go to the end
  const sizes = [...rawSizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Lowest price among enabled variants (Printify stores prices in cents)
  const enabledVariants = (p.variants || []).filter(v => v.is_enabled);
  const minPriceCents = enabledVariants.length
    ? Math.min(...enabledVariants.map(v => v.price))
    : 0;
  const price = Math.round(minPriceCents / 100);

  // Prefer images marked is_default; fall back to all images
  const defaultImages = (p.images || []).filter(img => img.is_default);
  const imageSources = defaultImages.length ? defaultImages : (p.images || []).slice(0, 3);
  const images = imageSources.map(img => ({
    url: img.src,
    alt: p.title
  }));

  return {
    id: p.id,                        // Printify UUID string — used in /product/:id route
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

exports.handler = async function handler(event) {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { PRINTIFY_API_KEY, PRINTIFY_SHOP_ID } = process.env;

  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    console.error('[products] Missing PRINTIFY_API_KEY or PRINTIFY_SHOP_ID env vars');
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Product API not configured' })
    };
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
      console.error('[products] Printify API error:', res.status, text);
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Failed to fetch products from Printify' })
      };
    }

    const json = await res.json();
    // Printify returns { data: [...], current_page, last_page, ... }
    const rawProducts = Array.isArray(json) ? json : (json.data || []);
    const products = rawProducts
      .filter(p => p.visible !== false) // only published products
      .map(transformProduct);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache 5 minutes at CDN, 1 minute stale-while-revalidate
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
      },
      body: JSON.stringify(products)
    };
  } catch (err) {
    console.error('[products] Unexpected error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
