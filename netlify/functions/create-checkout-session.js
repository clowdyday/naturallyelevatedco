/**
 * POST /api/create-checkout-session
 * Creates a Stripe Checkout session from the cart and returns the session URL.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY  — from Stripe dashboard > API keys
 *   URL                — auto-injected by Netlify in production; set manually for local dev
 *
 * Request body: { items: [{ productId, title, color, size, price, qty, imageUrl }] }
 * Response:     { url: string }  — redirect browser to this URL to start Stripe Checkout
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[checkout] Missing STRIPE_SECRET_KEY env var');
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Checkout not configured' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const { items } = body;

  // Validate cart
  if (!Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Cart is empty' })
    };
  }

  for (const item of items) {
    if (!item.title || typeof item.price !== 'number' || item.price <= 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid cart item: ' + JSON.stringify(item) })
      };
    }
    if (!Number.isInteger(item.qty) || item.qty < 1) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid quantity for: ' + item.title })
      };
    }
  }

  // Determine base URL for success/cancel redirects
  const siteUrl = (process.env.URL || 'https://naturallyelevatedco.com').replace(/\/$/, '');

  try {
    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(item.price * 100), // cents
        product_data: {
          name: item.title,
          description: [item.color, item.size].filter(Boolean).join(' / '),
          // Stripe accepts up to 8 images; skip if URL is a placeholder
          images: item.imageUrl && !item.imageUrl.includes('picsum.photos')
            ? [item.imageUrl]
            : []
        }
      },
      quantity: item.qty
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      // Collect US shipping address during checkout
      shipping_address_collection: {
        allowed_countries: ['US']
      },
      // Store cart items in metadata so the webhook can create the Printify order
      metadata: {
        items: JSON.stringify(
          items.map(i => ({
            productId: i.productId,
            title:     i.title,
            color:     i.color,
            size:      i.size,
            qty:       i.qty,
            imageUrl:  i.imageUrl
          }))
        )
      },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};
