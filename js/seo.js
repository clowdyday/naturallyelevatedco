/**
 * seo.js — Dynamic SEO meta updater
 * Call SEO.update(path) on every navigation from app.js.
 * Updates <title>, <meta name="description">, <link rel="canonical">,
 * Open Graph tags, Twitter Card tags, and JSON-LD structured data.
 */
const SEO = (() => {
  const BASE_URL = 'https://naturallyelevated.co';
  const OG_IMAGE = BASE_URL + '/assets/og-image.svg';
  const OG_IMAGE_W = '1200';
  const OG_IMAGE_H = '630';
  const DEFAULT = {
    title: 'Naturally Elevated Co. | Desert Skies. Elevated Minds.',
    description: 'New Mexico-inspired threads for the wandering soul. Desert skies, elevated minds. Shop the collection.',
    image: OG_IMAGE
  };

  function _setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function _setOG(property, content) {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function _setCanonical(path) {
    let el = document.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      document.head.appendChild(el);
    }
    el.setAttribute('href', BASE_URL + (path === '/' ? '' : path));
  }

  function _setJsonLd(data) {
    let el = document.getElementById('json-ld');
    if (!el) {
      el = document.createElement('script');
      el.id = 'json-ld';
      el.type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function _setRobots(content) {
    let el = document.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function update(path) {
    const productMatch = path.match(/^\/product\/([a-zA-Z0-9_-]+)$/);
    let title       = DEFAULT.title;
    let description = DEFAULT.description;
    let image       = DEFAULT.image;
    let noindex     = false;
    let jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Naturally Elevated Co.',
      url: BASE_URL,
      logo: BASE_URL + '/assets/logo.png',
      description: DEFAULT.description,
      sameAs: [
        'https://www.instagram.com/naturally_elevated_co/',
        'https://www.etsy.com/shop/naturallyelevatedco'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@naturallyelevated.co'
      }
    };

    if (productMatch) {
      const rawId = productMatch[1];
      const productId = /^\d+$/.test(rawId) ? parseInt(rawId, 10) : rawId;
      const product = PRODUCTS.find(p => p.id === productId);
      if (product) {
        title       = product.title + ' | Naturally Elevated Co.';
        description = product.description.slice(0, 155);
        image       = product.images[0].url;
        jsonLd = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Product',
              name: product.title,
              description: product.description,
              image: product.images.map(i => i.url),
              sku: rawId,
              brand: { '@type': 'Brand', name: 'Naturally Elevated Co.' },
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: BASE_URL + path,
                seller: { '@type': 'Organization', name: 'Naturally Elevated Co.' }
              }
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: BASE_URL + '/shop' },
                { '@type': 'ListItem', position: 3, name: product.title, item: BASE_URL + path }
              ]
            }
          ]
        };
      }
    } else if (path === '/shop') {
      title       = 'Shop All Products | Naturally Elevated Co.';
      description = 'Browse the full collection of New Mexico-inspired threads. Filter by size, color, and more. Desert skies, elevated minds.';
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Shop All Products — Naturally Elevated Co.',
        description: description,
        url: BASE_URL + '/shop'
      };
    } else if (path === '/success') {
      title       = 'Order Received | Naturally Elevated Co.';
      description = 'Your order has been placed. Thank you for shopping with Naturally Elevated Co.';
      noindex     = true;
    } else if (path === '/cart') {
      title       = 'Cart | Naturally Elevated Co.';
      description = 'Review your cart and checkout at Naturally Elevated Co.';
      noindex     = true;
    } else if (path === '/faq') {
      title       = 'FAQ | Naturally Elevated Co.';
      description = 'Answers to common questions about orders, shipping, sizing, returns, and our New Mexico-inspired apparel.';
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Where do you ship?', acceptedAnswer: { '@type': 'Answer', text: 'We ship across the United States. Free shipping on orders over $50.' } },
          { '@type': 'Question', name: 'How long does shipping take?', acceptedAnswer: { '@type': 'Answer', text: 'Orders typically ship within 3–7 business days and arrive within 5–10 business days.' } },
          { '@type': 'Question', name: 'What sizes do you carry?', acceptedAnswer: { '@type': 'Answer', text: 'We carry XS through 5XL on most styles. We recommend sizing up for an oversized fit.' } },
          { '@type': 'Question', name: 'What is your return policy?', acceptedAnswer: { '@type': 'Answer', text: 'All items are printed on demand. We accept returns for defective or misprinted items within 30 days. Contact hello@naturallyelevated.co.' } },
          { '@type': 'Question', name: 'Where are your shirts printed?', acceptedAnswer: { '@type': 'Answer', text: 'All apparel is printed and shipped from the United States via direct-to-garment printing.' } }
        ]
      };
    } else if (path === '/privacy') {
      title       = 'Privacy Policy | Naturally Elevated Co.';
      description = 'How Naturally Elevated Co. collects, uses, and protects your personal information.';
    } else if (path === '/tos') {
      title       = 'Terms of Service | Naturally Elevated Co.';
      description = 'Terms and conditions for purchasing from Naturally Elevated Co.';
    } else if (path === '/contact') {
      title       = 'Contact | Naturally Elevated Co.';
      description = 'Get in touch with Naturally Elevated Co. Questions about orders, shipping, or anything else — we\'re here.';
    }

    // Apply all tags
    document.title = title;
    _setMeta('description', description);
    _setRobots(noindex ? 'noindex, nofollow' : 'index, follow');
    _setCanonical(path);

    _setOG('og:type',         productMatch ? 'product' : 'website');
    _setOG('og:site_name',    'Naturally Elevated Co.');
    _setOG('og:title',        title);
    _setOG('og:description',  description);
    _setOG('og:image',        image);
    _setOG('og:image:width',  image === OG_IMAGE ? OG_IMAGE_W : '');
    _setOG('og:image:height', image === OG_IMAGE ? OG_IMAGE_H : '');
    _setOG('og:url',          BASE_URL + path);
    _setOG('og:locale',       'en_US');

    _setMeta('twitter:card',        'summary_large_image');
    _setMeta('twitter:title',       title);
    _setMeta('twitter:description', description);
    _setMeta('twitter:image',       image);

    _setJsonLd(jsonLd);
  }

  return { update };
})();
