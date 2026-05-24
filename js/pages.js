/**
 * pages.js — Informational pages: FAQ, Privacy Policy, Terms of Service
 * All render functions return HTML strings consumed by app.js router.
 * initFAQPage() wires accordion interactivity after the FAQ renders.
 */

/** ── FAQ ──────────────────────────────────────────────────────────── */
function renderFAQPage() {
  const sections = [
    {
      heading: 'Orders & Shipping',
      slug: 'shipping',
      items: [
        {
          q: 'How long does shipping take?',
          a: 'Most orders ship within 2–4 business days and arrive within 3–7 business days for US domestic shipments. You\'ll receive a tracking email when your order ships.'
        },
        {
          q: 'Do you ship internationally?',
          a: 'We\'re US-only right now. International shipping is on the roadmap — follow us on Instagram for updates.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'All major credit and debit cards (Visa, Mastercard, Amex, Discover) via our secure Stripe checkout.'
        },
        {
          q: 'Can I cancel or change my order?',
          a: 'Reach out within 24 hours at hello@naturallyelevatedco.com. After that, your tee is likely already in production and we can\'t make changes.'
        }
      ]
    },
    {
      heading: 'Products',
      slug: 'products',
      items: [
        {
          q: 'What sizes are available?',
          a: 'Every design comes in S, M, L, XL, 2XL, and 3XL. Check the size chart on each product page for exact measurements.'
        },
        {
          q: 'What are the shirts made of?',
          a: 'We use premium heavyweight unisex cotton (6.1 oz). Thick, soft, and built to last — not the see-through stuff. Printed and shipped from US-based facilities.'
        },
        {
          q: 'How do colors look in person?',
          a: 'We do our best to show accurate colors, but monitor calibration varies. Screen-printed designs may have a slightly different vibrancy than your display. These differences are not considered defects.'
        },
        {
          q: 'Do you offer custom designs or bulk orders?',
          a: 'Not currently — every piece is from our original catalog. Slide into our Instagram DMs if you have something in mind.'
        }
      ]
    },
    {
      heading: 'Returns & Exchanges',
      slug: 'returns',
      items: [
        {
          q: 'What is your return policy?',
          a: 'We accept exchanges within 14 days for items that are unworn, unwashed, and in original condition. We don\'t offer cash refunds for sizing errors, but we\'ll make it work for you.'
        },
        {
          q: 'What if my shirt arrives damaged or with a print defect?',
          a: 'That\'s on us — we\'ll replace it free of charge. Email hello@naturallyelevatedco.com with a photo of the issue and your order number, and we\'ll sort it out within 48 hours.'
        }
      ]
    }
  ];

  var sectionsHTML = sections.map(function(section) {
    var items = section.items.map(function(item, i) {
      var panelId = 'faq-panel-' + section.slug + '-' + i;
      var btnId   = 'faq-btn-'   + section.slug + '-' + i;
      return (
        '<div class="accordion-item">' +
          '<button class="accordion-trigger" aria-expanded="false"' +
            ' aria-controls="' + panelId + '" id="' + btnId + '">' +
            item.q +
            '<span class="accordion-icon" aria-hidden="true">+</span>' +
          '</button>' +
          '<div class="accordion-panel" id="' + panelId + '"' +
            ' role="region" aria-labelledby="' + btnId + '" hidden>' +
            '<p>' + item.a + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<div class="faq-section reveal">' +
        '<h2 class="faq-section-heading">' + section.heading + '</h2>' +
        '<div class="accordion" role="list">' + items + '</div>' +
      '</div>'
    );
  }).join('');

  return (
    '<div class="policy-page faq-page">' +
      '<div class="policy-inner">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="/" data-route>Home</a>' +
          '<span class="breadcrumb-sep" aria-hidden="true">›</span>' +
          '<span class="breadcrumb-current" aria-current="page">FAQ</span>' +
        '</nav>' +
        '<header class="policy-header reveal">' +
          '<p class="section-label">// Frequently Asked</p>' +
          '<h1 class="policy-title">Questions &amp; Answers</h1>' +
          '<p class="policy-subtitle">Can\'t find your answer? Email us at ' +
            '<a href="mailto:hello@naturallyelevatedco.com" class="policy-link">hello@naturallyelevatedco.com</a>' +
          '</p>' +
        '</header>' +
        '<div class="zia-rule reveal" aria-hidden="true">' +
          '<div class="zia-rule-line"></div>' +
          '<span class="zia-rule-symbol">✦</span>' +
          '<div class="zia-rule-line"></div>' +
        '</div>' +
        sectionsHTML +
      '</div>' +
    '</div>'
  );
}

/** Wire FAQ accordion — call after renderFAQPage() HTML is in the DOM */
function initFAQPage() {
  document.querySelectorAll('.accordion-trigger').forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) {
        panel.hidden = expanded; // collapse if was open, open if was closed
      }
    });
  });
}

/** ── Privacy Policy ───────────────────────────────────────────────── */
function renderPrivacyPage() {
  return (
    '<div class="policy-page">' +
      '<div class="policy-inner">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="/" data-route>Home</a>' +
          '<span class="breadcrumb-sep" aria-hidden="true">›</span>' +
          '<span class="breadcrumb-current" aria-current="page">Privacy Policy</span>' +
        '</nav>' +
        '<header class="policy-header reveal">' +
          '<p class="section-label">// Legal</p>' +
          '<h1 class="policy-title">Privacy Policy</h1>' +
          '<p class="policy-meta">Last updated: May 24, 2026</p>' +
        '</header>' +
        '<div class="zia-rule reveal" aria-hidden="true">' +
          '<div class="zia-rule-line"></div>' +
          '<span class="zia-rule-symbol">✦</span>' +
          '<div class="zia-rule-line"></div>' +
        '</div>' +
        '<div class="policy-body reveal">' +

          '<h2 class="policy-section-heading">What We Collect</h2>' +
          '<p>When you place an order, we collect your name, shipping address, email address, and payment information. Payment details are processed securely by Stripe — we never see or store your full card number.</p>' +
          '<p>Your shopping cart is stored locally in your browser (localStorage). This data never leaves your device until checkout.</p>' +

          '<h2 class="policy-section-heading">How We Use Your Information</h2>' +
          '<p>We use your information solely to fulfill your order: process payment, arrange printing, and ship your tee. We do not sell, rent, or trade your personal data to any third party for marketing purposes.</p>' +
          '<p>We may send a transactional email (order confirmation, shipping notification) to the address you provide at checkout. We do not send marketing emails without explicit opt-in.</p>' +

          '<h2 class="policy-section-heading">Third-Party Services</h2>' +
          '<p><strong>Stripe</strong> — Handles all payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" class="policy-link">Stripe\'s Privacy Policy</a>.</p>' +
          '<p><strong>Print Provider</strong> — Your name and shipping address are shared with our US-based print-on-demand partner to fulfill and ship your order.</p>' +
          '<p><strong>GitHub Pages</strong> — This site is hosted on GitHub Pages. Standard server logs (IP address, browser type) may be collected by GitHub per <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer" class="policy-link">their privacy policy</a>.</p>' +

          '<h2 class="policy-section-heading">Cookies &amp; Tracking</h2>' +
          '<p>We do not use tracking cookies or third-party analytics scripts. The only browser storage we use is localStorage for your cart, which contains no personally identifiable information.</p>' +

          '<h2 class="policy-section-heading">Data Retention</h2>' +
          '<p>Order data is retained for a minimum of 3 years to comply with accounting and tax obligations. You may request deletion of your personal data (except where legally required to retain it) by emailing us.</p>' +

          '<h2 class="policy-section-heading">Your Rights</h2>' +
          '<p>You have the right to access, correct, or delete personal data we hold about you. To exercise these rights, contact us at <a href="mailto:hello@naturallyelevatedco.com" class="policy-link">hello@naturallyelevatedco.com</a>.</p>' +

          '<h2 class="policy-section-heading">Contact</h2>' +
          '<p>Questions about this policy? Reach us at <a href="mailto:hello@naturallyelevatedco.com" class="policy-link">hello@naturallyelevatedco.com</a>.</p>' +

        '</div>' +
      '</div>' +
    '</div>'
  );
}

/** ── Terms of Service ─────────────────────────────────────────────── */
function renderTOSPage() {
  return (
    '<div class="policy-page">' +
      '<div class="policy-inner">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="/" data-route>Home</a>' +
          '<span class="breadcrumb-sep" aria-hidden="true">›</span>' +
          '<span class="breadcrumb-current" aria-current="page">Terms of Service</span>' +
        '</nav>' +
        '<header class="policy-header reveal">' +
          '<p class="section-label">// Legal</p>' +
          '<h1 class="policy-title">Terms of Service</h1>' +
          '<p class="policy-meta">Last updated: May 24, 2026</p>' +
        '</header>' +
        '<div class="zia-rule reveal" aria-hidden="true">' +
          '<div class="zia-rule-line"></div>' +
          '<span class="zia-rule-symbol">✦</span>' +
          '<div class="zia-rule-line"></div>' +
        '</div>' +
        '<div class="policy-body reveal">' +

          '<h2 class="policy-section-heading">Acceptance of Terms</h2>' +
          '<p>By accessing and using naturallyelevatedco.com, you agree to these Terms of Service. If you do not agree, please do not use this site.</p>' +

          '<h2 class="policy-section-heading">Products &amp; Orders</h2>' +
          '<p>All products are printed on demand specifically for you. We reserve the right to refuse or cancel any order for any reason, including suspected fraud or errors in product listings.</p>' +
          '<p><strong>Color disclaimer:</strong> Screen colors may differ slightly from the printed result due to monitor calibration and the nature of the printing process. These variations are not considered defects.</p>' +
          '<p><strong>Sizing:</strong> We provide size charts on each product page. Please review them before ordering — we cannot exchange items due to incorrect size selections beyond our standard exchange window.</p>' +

          '<h2 class="policy-section-heading">Shipping</h2>' +
          '<p>Estimated delivery times are not guaranteed. We are not responsible for delays caused by carriers, customs, or circumstances beyond our control. Risk of loss passes to you upon delivery to the carrier.</p>' +

          '<h2 class="policy-section-heading">Returns &amp; Exchanges</h2>' +
          '<p>We accept exchanges within 14 days of delivery for unworn, unwashed items in their original condition. Contact us at <a href="mailto:hello@naturallyelevatedco.com" class="policy-link">hello@naturallyelevatedco.com</a> before sending anything back.</p>' +
          '<p>We do not offer cash refunds for change-of-mind purchases. Defective or damaged items will be replaced at no cost — please photograph and email us within 7 days of delivery.</p>' +

          '<h2 class="policy-section-heading">Intellectual Property</h2>' +
          '<p>All designs, graphics, text, and branding on this site are the exclusive property of Naturally Elevated Co. You may not reproduce, distribute, or create derivative works without written permission.</p>' +

          '<h2 class="policy-section-heading">Limitation of Liability</h2>' +
          '<p>To the fullest extent permitted by law, Naturally Elevated Co. shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or purchase of our products. Our maximum liability is limited to the amount you paid for the specific product at issue.</p>' +

          '<h2 class="policy-section-heading">Changes to Terms</h2>' +
          '<p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance. The “Last updated” date at the top of this page reflects the most recent revision.</p>' +

          '<h2 class="policy-section-heading">Contact</h2>' +
          '<p>Questions? <a href="mailto:hello@naturallyelevatedco.com" class="policy-link">hello@naturallyelevatedco.com</a></p>' +

        '</div>' +
      '</div>' +
    '</div>'
  );
}
