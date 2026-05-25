/**
 * POST /api/create-checkout-session
 * Cloudflare Pages Function — creates a Stripe Checkout session and returns the redirect URL.
 *
 * Env vars (set in Cloudflare Pages dashboard):
 *   STRIPE_SECRET_KEY  — sk_live_... from Stripe dashboard
 *   URL                — https://naturallyelevated.co (auto-set by Cloudflare, or set manually)
 */

import Stripe from 'stripe';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { STRIPE_SECRET_KEY } = env;

  // Derive origin from the incoming request so success/cancel URLs are always correct
  const origin = env.URL || new URL(request.url).origin;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { items } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Cart is empty' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate each item
  for (const item of items) {
    if (!item.title || typeof item.price !== 'number' || item.price <= 0 ||
        !Number.isInteger(item.qty) || item.qty <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid item in cart' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    // Use fetch-based HTTP client — required for Cloudflare Workers
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

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
