// Product data — sourced from Printify shop 27526347 (Etsy/production store)
// IDs are real Printify product UUIDs; images are Printify CDN (public)
// loadProducts() below replaces this at runtime when /api/products is available

const COLOR_HEX = {
  // Core brand palette
  'Black':              '#1a1a1a',
  'White':              '#FAFAFA',
  'Charcoal':           '#3a3a3a',
  'Dark Chocolate':     '#2C1A0E',
  'Natural':            '#F2EAD6',
  'Natural/Cream':      '#F2EAD6',
  // Extended palette
  'Navy':               '#1B2A4A',
  'Dark Heather':       '#4A4A4A',
  'Dark Heather Grey':  '#4A4A4A',
  'Sport Grey':         '#9E9E9E',
  'Sand':               '#D4C09A',
  'Cornsilk':           '#F5EDD8',
  'Ice Grey':           '#C8C8C8',
  'Gold':               '#C9A227',
  'Daisy':              '#E8D44D',
  'Orange':             '#D4602A',
  'Heather Orange':     '#D87C54',
  'Coral Silk':         '#E8A090',
  'Maroon':             '#6B2737',
  'Heather Maroon':     '#7A3A48',
  'Berry':              '#7A2A5A',
  'Military Green':     '#556B3A',
  'Heather Military Green': '#6A7A50',
  'Forest Green':       '#2A4A2A',
  'Heather Forest Green': '#4A6A4A',
  'Kelly Green':        '#3A7A3A',
  'Sage':               '#8A9E78',
  'Lime':               '#7AC23A',
  'Mint Green':         '#A0D8C0',
  'Royal':              '#2A52A0',
  'Heather Royal':      '#4A6AB0',
  'Sapphire':           '#1A4A8A',
  'Indigo Blue':        '#2A2A6A',
  'Sky':                '#7AB8D8',
  'Light Blue':         '#A0C8E8',
  'Carolina Blue':      '#6AAAD4',
  'Tropical Blue':      '#3A8AB0',
  'Stone Blue':         '#5A7A9A',
  'Metro Blue':         '#2A4A6A',
  'Heather Navy':       '#2A3A5A',
  'Purple':             '#5A2A7A',
  'Heather Purple':     '#7A4A9A',
  'Heather Radiant Orchid': '#8A5AA0',
  'Light Pink':         '#F0B8C8',
  'Azalea':             '#E87890',
  'Heliconia':          '#D44878',
  'Heather Heliconia':  '#D87090',
  'Heather Berry':      '#904068',
  'Red':                '#C83030',
  'Heather Red':        '#D05050',
  'Cherry Red':         '#B02020',
  'Antique Cherry Red': '#8A1818',
  'Cardinal Red':       '#9A1828',
  'Heather Cardinal':   '#B03040',
  'Graphite Heather':   '#5A5A5A',
  'Pistachio':          '#A8C890',
  'Antique Sapphire':   '#2A5A8A',
  'Antique Heliconia':  '#B84870',
  'Jade Dome':          '#2A8A7A',
  'Kiwi':               '#7AB040',
  'Heather Galapagos Blue': '#3A7A9A',
  'Heather Sapphire':   '#3A6AA0',
  'Heather Indigo':     '#3A3A7A',
  'Irish Green':        '#2A7A3A',
  'Heather Irish Green':'#4A8A5A',
  'Paragon':            '#4A6A8A',
  'Iris':               '#5A6AB0',
  // Tri-blend
  'Navy TriBlend':      '#1F2B4C',
  'True Royal TriBlend':'#5270C7',
  'Red TriBlend':       '#d25046',
  'Charcoal Black TriBlend': '#3A3A3A',
  'Athletic Heather':   '#BDBDBD',
  'Aqua TriBlend':      '#6ABCB8',
  // Tanks
  'Dark Grey':          '#555555',
  'Leaf':               '#5A7A3A'
};

// Curated brand-fit color sets per design theme
const BRAND_COLORS_DARK   = ['Black', 'Charcoal', 'Dark Heather', 'Navy', 'Dark Heather Grey'];
const BRAND_COLORS_WARM   = ['Black', 'Natural', 'Sand', 'Cornsilk', 'Gold', 'Maroon'];
const BRAND_COLORS_DESERT = ['Natural', 'Sand', 'Cornsilk', 'Black', 'Gold', 'Daisy'];
const BRAND_COLORS_RASTA  = ['Dark Chocolate', 'Black', 'Military Green', 'Maroon', 'Forest Green', 'Gold'];
const BRAND_COLORS_TANK   = ['Black', 'White', 'Navy', 'Sand', 'Charcoal Black TriBlend', 'Athletic Heather'];

let PRODUCTS = [
  {
    id: '6a08d78574d5c75c190409e6',
    title: 'What Lives Underground Graphic Tee',
    description: 'New Mexico dark graphic tee — roots twist through ancient stone, water, and desert silence. Something deep underground has been waiting a long time. Heavyweight unisex cotton, printed in the US via direct-to-garment on demand. Wear it for the nights you spend digging through layers no one else can see.',
    price: 25,
    colors: BRAND_COLORS_DARK,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a08d78574d5c75c190409e6/38192/97992/what-lives-underground-t-shirt-dark-fantasy-cave-illustration.jpg?camera_label=front', alt: 'What Lives Underground dark gothic graphic tee — cave and root illustration' }],
    tags: ['dark-fantasy', 'cave', 'underground', 'mystic', 'new-mexico'],
    featured: true
  },
  {
    id: '6a08d157b7acc2cf2206b880',
    title: 'Pass the Sunshine Retro Desert Tee',
    description: 'Retro psychedelic New Mexico graphic tee — this one hits like July in the desert. Cacti swaying, sun grinning, everything slow and golden and alive. Heavyweight unisex cotton printed in the US. Some energy travels by touch — spread it.',
    price: 25,
    colors: BRAND_COLORS_WARM,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a08d157b7acc2cf2206b880/38192/97992/pass-the-sunshine-t-shirt-retro-psychedelic-sun-cactus-graphic.jpg?camera_label=front', alt: 'Pass the Sunshine retro psychedelic desert tee — cactus and sun graphic' }],
    tags: ['psychedelic', 'retro', 'sunshine', 'desert', 'new-mexico'],
    featured: false
  },
  {
    id: '6a08cf7f4b43cb78f60f27a0',
    title: 'Alien with Fedora & Sunglasses Tee',
    description: "Roswell UFO graphic tee — he came from past the last radio signal, landed in New Mexico, and never left. The fedora was his idea. Premium heavyweight unisex cotton, US-printed. For the ones who've always suspected this planet is just a rest stop on a much longer trip.",
    price: 25,
    colors: ['Black', 'White', 'Natural', 'Sand', 'Dark Heather', 'Charcoal'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a08cf7f4b43cb78f60f27a0/38191/97992/alien-with-fedora-and-sunglasses-t-shirt-retro-ufo-skull-illustration.jpg?camera_label=front', alt: 'Alien with fedora and sunglasses Roswell UFO graphic tee' }],
    tags: ['alien', 'retro', 'ufo', 'roswell', 'new-mexico'],
    featured: false
  },
  {
    id: '6a08c9e82c5d71edb90f1020',
    title: 'The Frequency Nightscape Desert Tee',
    description: "Desert night sky graphic tee — campfire at the edge of everything, the moon patient above it, stars indifferent and perfect. Some frequencies don't travel through speakers. Heavyweight unisex cotton, US-printed. You have to be out under the real New Mexico sky to catch them.",
    price: 25,
    colors: BRAND_COLORS_DARK,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a08c9e82c5d71edb90f1020/38192/97992/the-frequency-nightscape-t-shirt-moon-stars-campfire-scene.jpg?camera_label=front', alt: 'The Frequency Nightscape desert campfire moon graphic tee' }],
    tags: ['frequency', 'nightscape', 'campfire', 'cosmic', 'new-mexico'],
    featured: true
  },
  {
    id: '6a05eaf367059491f90663d9',
    title: 'Desert Vibes Unisex Tank Top',
    description: 'Cut for movement, built for heat. This lightweight unisex tank goes everywhere the tees do — trails, festivals, open-window drives through the high desert. Ultra-soft jersey, US-printed. Wear the vibe without the sleeves.',
    price: 25,
    colors: BRAND_COLORS_TANK,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a05eaf367059491f90663d9/24621/101889/unisex-jersey-tank.jpg?camera_label=front', alt: 'Desert Vibes unisex jersey tank top' }],
    tags: ['tank', 'desert', 'summer', 'festival', 'new-mexico'],
    featured: false
  },
  {
    id: '6a05e55b05d63cc97f0583de',
    title: 'Peace Love Reggae Roots Graphic Tee',
    description: 'Roots Rasta graphic tee — three words that rewired civilization. The rhythm moves through red clay soil, through mountain air, through anyone willing to slow down. Heavyweight unisex cotton, US-printed. Roots run across continents, across frequencies, into you.',
    price: 30,
    colors: BRAND_COLORS_RASTA,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a05e55b05d63cc97f0583de/38183/97993/peace-love-reggae-t-shirt-retro-rasta-typography.jpg?camera_label=back', alt: 'Peace Love Reggae roots Rasta graphic tee — back print' }],
    tags: ['rasta', 'reggae', 'peace', 'roots', 'southwest'],
    featured: false
  },
  {
    id: '6a04b9645540b782e103ca06',
    title: 'Rasta Alien Head Interstellar Tee',
    description: 'Interstellar roots graphic tee — he arrived through the frequency and never left. Rasta alien with dreadlock beanie, shades up, vibes from beyond the atmosphere. Heavyweight unisex cotton, US-printed. For the travelers who carry their culture across every border, including the ones past the stratosphere.',
    price: 24,
    colors: ['Charcoal', 'Black', 'Sage', 'Military Green', 'Dark Chocolate', 'Natural'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04b9645540b782e103ca06/63300/97992/rasta-alien-head-t-shirt-sunglasses-dreadlock-beanie-smoking.jpg?camera_label=front', alt: 'Rasta Alien Head interstellar roots graphic tee' }],
    tags: ['rasta', 'alien', 'cosmic', 'reggae', 'interstellar'],
    featured: false
  },
  {
    id: '6a04b6e1963577f6d9075545',
    title: 'Naturally Elevated Desert Sunset Tee',
    description: 'Southwest desert sunset tee — the last light turns everything gold, cactus arms wide open, New Mexico horizon burning. Our signature design. Heavyweight unisex cotton, US-printed. This is what naturally elevated looks like. No altitude required. Just the right sky at the right moment.',
    price: 30,
    colors: BRAND_COLORS_DESERT,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04b6e1963577f6d9075545/63303/97993/naturally-elevated-desert-sunset-t-shirt-cactus-landscape-retro-western-vibe.jpg?camera_label=back', alt: 'Naturally Elevated Desert Sunset retro western tee — signature back print' }],
    tags: ['desert', 'sunset', 'western', 'southwest', 'new-mexico', 'signature'],
    featured: true
  },
  {
    id: '6a04b59fd54e5aa2fa00f786',
    title: 'Mystic Pyramid Temple Sacred Geometry Tee',
    description: "Sacred geometry graphic tee — stone aligned to star, angle cut to catch one perfect light per year, as if someone always knew you'd be watching. Heavyweight unisex cotton, US-printed. New Mexico mystic art. The moon confirms the message. You were meant to be here.",
    price: 25,
    colors: ['Black', 'Dark Heather', 'Natural', 'Navy', 'Charcoal', 'Sand'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04b59fd54e5aa2fa00f786/38192/97992/mystic-pyramid-temple-t-shirt-cosmic-moon-tribal-geometric-illustration.jpg?camera_label=front', alt: 'Mystic Pyramid Temple sacred geometry cosmic graphic tee' }],
    tags: ['pyramid', 'mystic', 'cosmic', 'sacred-geometry', 'new-mexico'],
    featured: false
  },
  {
    id: '6a04b2f4963577f6d90752bb',
    title: 'Desert Night Silhouette Cowboy Tee',
    description: "Desert cowboy moonlight graphic tee — a lone figure plays under a New Mexico moon, saguaros keeping watch, warm amber light cutting through dark. Heavyweight unisex cotton, US-printed. Some nights you don't need a stage. Just open sky and the right frequency.",
    price: 25,
    colors: ['Black', 'Navy', 'Dark Heather', 'Charcoal', 'Maroon', 'Dark Chocolate'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04b2f4963577f6d90752bb/38192/97992/desert-night-silhouette-t-shirt-cactus-moon-cowboy-scene.jpg?camera_label=front', alt: 'Desert Night Silhouette cowboy moon cactus graphic tee' }],
    tags: ['desert', 'silhouette', 'cowboy', 'night', 'new-mexico'],
    featured: false
  },
  {
    id: '6a04b0d14261b0d2ea07e77e',
    title: 'Psychedelic Cosmic Vortex Galaxy Tee',
    description: "Surreal psychedelic galaxy graphic tee — the edge of the cosmos bends into itself, and somehow the center is wherever you're standing. New Mexico psychedelia on premium heavyweight unisex cotton, US-printed. The most honest view of the universe is the one that doesn't try to make sense of it.",
    price: 25,
    colors: BRAND_COLORS_DARK,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04b0d14261b0d2ea07e77e/38192/97992/psychedelic-cosmic-vortex-t-shirt-surreal-galaxy-landscape.jpg?camera_label=front', alt: 'Psychedelic Cosmic Vortex surreal galaxy graphic tee' }],
    tags: ['psychedelic', 'cosmic', 'vortex', 'galaxy', 'surreal'],
    featured: false
  },
  {
    id: '6a04ae98b14e025c990e8102',
    title: 'Desert Skies Contact Highs Retro Tee',
    description: "Retro 70s Southwest psychedelic tee — turquoise sky, tan earth, a New Mexico horizon that goes on forever in that particular 1970s way. Our best-seller. Heavyweight unisex cotton, US-printed. Contact high: no contact required. The vibe travels.",
    price: 30,
    colors: BRAND_COLORS_DESERT,
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
    images: [{ url: 'https://images.printify.com/mockup/6a04ae98b14e025c990e8102/63303/97993/desert-skies-contact-highs-t-shirt-retro-70s-psychedelic-desert-design.jpg?camera_label=back', alt: 'Desert Skies Contact Highs retro 70s Southwest psychedelic tee — back print' }],
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
 * (local dev without keys, GitHub Pages, network error, etc.).
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
