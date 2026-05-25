// INTEGRATION NOTE: Replace the PRODUCTS array below with a fetch() call to
// GET /api/products once the Node/Express + Printify backend is running.
// The object shape is already matched to Printify's product response format.
// TODO: Replace with GET /api/products (Printify)

const COLOR_HEX = {
  'Black':         '#1a1a1a',
  'Charcoal':      '#3a3a3a',
  'Dark Chocolate':'#2C1A0E',
  'Natural':       '#F2EAD6',
  'Natural/Cream': '#F2EAD6',
  'White':         '#FAFAFA'
};

let PRODUCTS = [
  {
    id: 1,
    title: 'What Lives Underground Graphic Tee',
    description: 'New Mexico dark graphic tee — roots twist through ancient stone, water, and desert silence. Something deep underground has been waiting a long time. Heavyweight unisex cotton, printed in the US via direct-to-garment on demand. Wear it for the nights you spend digging through layers no one else can see.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec1/600/600', alt: 'What Lives Underground dark gothic graphic tee on black — cave and root illustration' }],
    tags: ['dark-fantasy', 'cave', 'underground', 'mystic', 'new-mexico'],
    featured: true
  },
  {
    id: 2,
    title: 'Pass the Sunshine Retro Desert Tee',
    description: 'Retro psychedelic New Mexico graphic tee — this one hits like July in the desert. Cacti swaying, sun grinning, everything slow and golden and alive. Heavyweight unisex cotton printed in the US. Some energy travels by touch — spread it. Available in Black.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec2/600/600', alt: 'Pass the Sunshine retro psychedelic desert tee on black — cactus and sun graphic' }],
    tags: ['psychedelic', 'retro', 'sunshine', 'desert', 'new-mexico'],
    featured: false
  },
  {
    id: 3,
    title: 'Alien with Fedora & Sunglasses Tee',
    description: 'Roswell UFO graphic tee — he came from past the last radio signal, landed in New Mexico, and never left. The fedora was his idea. Premium heavyweight unisex cotton, US-printed. Available in Black and White. For the ones who\'ve always suspected this planet is just a rest stop on a much longer trip.',
    price: 25,
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec3/600/600', alt: 'Alien with fedora and sunglasses Roswell UFO graphic tee — available in black or white' }],
    tags: ['alien', 'retro', 'ufo', 'roswell', 'new-mexico'],
    featured: false
  },
  {
    id: 4,
    title: 'The Frequency Nightscape Desert Tee',
    description: 'Desert night sky graphic tee — campfire at the edge of everything, the moon patient above it, stars indifferent and perfect. Some frequencies don\'t travel through speakers. Heavyweight unisex cotton, US-printed. You have to be out under the real New Mexico sky to catch them.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec4/600/600', alt: 'The Frequency Nightscape desert campfire moon graphic tee on black' }],
    tags: ['frequency', 'nightscape', 'campfire', 'cosmic', 'new-mexico'],
    featured: true
  },
  {
    id: 5,
    title: 'Peace Love Reggae Roots Graphic Tee',
    description: 'Roots Rasta graphic tee on dark chocolate — three words that rewired civilization. The rhythm moves through red clay soil, through mountain air, through anyone willing to slow down. Heavyweight unisex cotton, US-printed. Roots run across continents, across frequencies, into you.',
    price: 30,
    colors: ['Dark Chocolate'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec5/600/600', alt: 'Peace Love Reggae roots Rasta graphic tee on dark chocolate' }],
    tags: ['rasta', 'reggae', 'peace', 'roots', 'southwest'],
    featured: false
  },
  {
    id: 6,
    title: 'Mystic Pyramid Temple Sacred Geometry Tee',
    description: 'Sacred geometry graphic tee — stone aligned to star, angle cut to catch one perfect light per year, as if someone always knew you\'d be watching. Heavyweight unisex cotton, US-printed. New Mexico mystic art. The moon confirms the message. You were meant to be here.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec6/600/600', alt: 'Mystic Pyramid Temple sacred geometry cosmic graphic tee on black' }],
    tags: ['pyramid', 'mystic', 'cosmic', 'sacred-geometry', 'new-mexico'],
    featured: false
  },
  {
    id: 7,
    title: 'Psychedelic Cosmic Vortex Galaxy Tee',
    description: 'Surreal psychedelic galaxy graphic tee — the edge of the cosmos bends into itself, and somehow the center is wherever you\'re standing. New Mexico psychedelia on premium heavyweight unisex cotton, US-printed. The most honest view of the universe is the one that doesn\'t try to make sense of it.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec7/600/600', alt: 'Psychedelic Cosmic Vortex surreal galaxy graphic tee on black' }],
    tags: ['psychedelic', 'cosmic', 'vortex', 'galaxy', 'surreal'],
    featured: false
  },
  {
    id: 8,
    title: 'Naturally Elevated Desert Sunset Tee',
    description: 'Southwest desert sunset tee on natural cream — the last light turns everything gold, cactus arms wide open, New Mexico horizon burning. Our signature design. Heavyweight unisex cotton, US-printed. This is what naturally elevated looks like. No altitude required. Just the right sky at the right moment.',
    price: 30,
    colors: ['Natural/Cream'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec8/600/600', alt: 'Naturally Elevated Desert Sunset retro western tee on natural cream — signature design' }],
    tags: ['desert', 'sunset', 'western', 'southwest', 'new-mexico', 'signature'],
    featured: true
  },
  {
    id: 9,
    title: 'Rasta Alien Head Interstellar Tee',
    description: 'Interstellar roots graphic tee on charcoal — he arrived through the frequency and never left. Rasta alien with dreadlock beanie, shades up, vibes from beyond the atmosphere. Heavyweight unisex cotton, US-printed. For the travelers who carry their culture across every border, including the ones past the stratosphere.',
    price: 25,
    colors: ['Charcoal'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec9/600/600', alt: 'Rasta Alien Head interstellar roots graphic tee on charcoal' }],
    tags: ['rasta', 'alien', 'cosmic', 'reggae', 'interstellar'],
    featured: false
  },
  {
    id: 10,
    title: 'Desert Night Silhouette Cowboy Tee',
    description: 'Desert cowboy moonlight graphic tee — a lone figure plays under a New Mexico moon, saguaros keeping watch, warm amber light cutting through dark. Heavyweight unisex cotton, US-printed. Some nights you don\'t need a stage. Just open sky and the right frequency.',
    price: 25,
    colors: ['Black'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec10/600/600', alt: 'Desert Night Silhouette cowboy moon cactus graphic tee on black' }],
    tags: ['desert', 'silhouette', 'cowboy', 'night', 'new-mexico'],
    featured: false
  },
  {
    id: 11,
    title: 'Desert Skies Contact Highs Retro Tee',
    description: 'Retro 70s Southwest psychedelic tee on natural cream — turquoise sky, tan earth, a New Mexico horizon that goes on forever in that particular 1970s way. Our best-seller. Heavyweight unisex cotton, US-printed. Contact high: no contact required. The vibe travels.',
    price: 30,
    colors: ['Natural/Cream'],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    images: [{ url: 'https://picsum.photos/seed/nec11/600/600', alt: 'Desert Skies Contact Highs retro 70s Southwest psychedelic tee on natural cream' }],
    tags: ['psychedelic', 'retro-70s', 'desert', 'contact-high', 'new-mexico', 'bestseller'],
    featured: true
  }
];

/**
 * Fetches live product data from /api/products (Printify via Netlify Function).
 * Mutates the PRODUCTS array in-place so shop.js and product.js keep working
 * without any changes — they reference the same global array.
 *
 * Falls back silently to the static PRODUCTS above if the API is unavailable
 * (local dev without keys, network error, etc.).
 *
 * Called once during app init (app.js) before the first view renders.
 */
async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('Empty response');
    // Mutate in place — all existing references to PRODUCTS stay valid
    PRODUCTS.length = 0;
    data.forEach(p => PRODUCTS.push(p));
  } catch (err) {
    console.warn('[Data] Using static product fallback:', err.message);
    // Static PRODUCTS array is already populated — nothing to do
  }
}

// PRODUCTS, COLOR_HEX, and loadProducts() are available globally
// (loaded via <script> tag before other JS files)
