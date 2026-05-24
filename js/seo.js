/**
 * seo.js — Dynamic SEO meta updater
 * Call SEO.update(path) on every navigation from app.js.
 * Updates <title>, <meta name="description">, <link rel="canonical">,
 * Open Graph tags, Twitter Card tags, and JSON-LD structured data.
 */
const SEO = (() => {
  const BASE_URL = 'https://naturallyelevatedco.com'; // update when live
  const DEFAULT = {
    title: 'Naturally Elevated Co. | Desert Skies. Elevated Minds.',
    description: 'New Mexico-inspired threads for the wandering soul. Desert skies, elevated minds. Shop the collection.',
    image: BASE_URL + '/assets/logo.jpg'
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

  function update(path) {
    const productMatch = path.match(/^\/product\/(\d+)$/);
    let title       = DEFAULT.title;
    let description = DEFAULT.description;
    let image       = DEFAULT.image;
    let jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Naturally Elevated Co.',
      url: BASE_URL
    };

    if (productMatch) {
      const product = PRODUCTS.find(p => p.id === parseInt(productMatch[1], 10));
      if (product) {
        title       = product.title + ' | Naturally Elevated Co.';
        description = product.description.slice(0, 155);
        image       = product.images[0].url;
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          image: product.images[0].url,
          brand: { '@type': 'Brand', name: 'Naturally Elevated Co.' },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Naturally Elevated Co.' }
          }
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
    } else if (path === '/cart') {
      title       = 'Cart | Naturally Elevated Co.';
      description = 'Review your cart and checkout at Naturally Elevated Co.';
    }

    // Apply all tags
    document.title = title;
    _setMeta('description', description);
    _setCanonical(path);

    _setOG('og:type',        productMatch ? 'product' : 'website');
    _setOG('og:site_name',   'Naturally Elevated Co.');
    _setOG('og:title',       title);
    _setOG('og:description', description);
    _setOG('og:image',       image);
    _setOG('og:url',         BASE_URL + path);

    _setMeta('twitter:card',        'summary_large_image');
    _setMeta('twitter:title',       title);
    _setMeta('twitter:description', description);
    _setMeta('twitter:image',       image);

    _setJsonLd(jsonLd);
  }

  return { update };
})();
