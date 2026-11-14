require('dotenv').config();
const connectDB = require('./db/db');
const User = require('./models/User');
const { Category } = require('./models/Category');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Order = require('./models/Order');
const StoreSettings = require('./models/StoreSettings');
const HomepageSection = require('./models/HomepageSection');
const InventoryMovement = require('./models/InventoryMovement');
const slugify = require('slugify');

// Curated high quality fashion imagery for clothing categories and products
const sampleImages = {
  hero: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop',
  promo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
  categories: {
    men: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
    women: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
    tshirts: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    shirts: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    bottoms: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    newArrivals: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
  },
  products: [
    {
      img1: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop',
    },
    {
      img1: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
      img2: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop',
    },
  ],
};

const seed = async () => {
  try {
    await connectDB();
    console.log('[Seed] Starting database initialization...');

    // 1. Initial Admin User
    const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@amberk.com';
    const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AmberkAdmin@2026';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Amberk Master Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'owner',
        phone: '+977 9801122334',
        isActive: true,
      });
      console.log(`[Seed] Initial Admin user created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
    }

    // 2. Demo Customer
    let customer = await User.findOne({ email: 'customer@amberk.com' });
    if (!customer) {
      customer = await User.create({
        name: 'Aayush Shrestha',
        email: 'customer@amberk.com',
        password: 'Customer@2026',
        role: 'customer',
        phone: '+977 9842011223',
        addresses: [
          {
            fullName: 'Aayush Shrestha',
            phone: '+977 9842011223',
            province: 'Koshi Province',
            district: 'Morang',
            municipality: 'Biratnagar Metropolitan City',
            area: 'Traffic Chowk',
            address: 'Ward No. 7, Near Central Bank',
            landmark: 'Opposite City Mart',
            label: 'Home',
            isDefault: true,
          },
        ],
      });
      console.log('[Seed] Demo customer created: customer@amberk.com (password: Customer@2026)');
    }

    // 3. Categories
    const categoriesData = [
      {
        name: "Men's Wear",
        slug: 'mens-wear',
        description: 'Modern essentials, sharp shirts, and everyday silhouettes engineered for effortless style.',
        image: { url: sampleImages.categories.men, publicId: 'cat_men', provider: 'external' },
        displayOrder: 1,
        isFeatured: true,
      },
      {
        name: "Women's Wear",
        slug: 'womens-wear',
        description: 'Contemporary feminine silhouettes, relaxed co-ords, and tailored separates.',
        image: { url: sampleImages.categories.women, publicId: 'cat_women', provider: 'external' },
        displayOrder: 2,
        isFeatured: true,
      },
      {
        name: 'T-Shirts & Tops',
        slug: 't-shirts',
        description: 'Heavyweight oversized cotton tees, boxy fits, and minimal graphic prints.',
        image: { url: sampleImages.categories.tshirts, publicId: 'cat_tshirts', provider: 'external' },
        displayOrder: 3,
        isFeatured: true,
      },
      {
        name: 'Shirts & Overshirts',
        slug: 'shirts',
        description: 'Breathable linen resort shirts, structured poplins, and timeless overshirts.',
        image: { url: sampleImages.categories.shirts, publicId: 'cat_shirts', provider: 'external' },
        displayOrder: 4,
        isFeatured: true,
      },
      {
        name: 'Bottom Wear',
        slug: 'bottom-wear',
        description: 'Tailored pleated trousers, relaxed chinos, and everyday utility bottoms.',
        image: { url: sampleImages.categories.bottoms, publicId: 'cat_bottoms', provider: 'external' },
        displayOrder: 5,
        isFeatured: true,
      },
      {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        description: 'The latest drops, fresh seasonal arrivals, and trend-setting fashion cuts.',
        image: { url: sampleImages.categories.newArrivals, publicId: 'cat_new', provider: 'external' },
        displayOrder: 6,
        isFeatured: true,
      },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let doc = await Category.findOne({ slug: cat.slug });
      if (!doc) {
        doc = await Category.create(cat);
      }
      categoryMap[cat.slug] = doc;
    }
    console.log('[Seed] Categories initialized.');

    // 4. Products
    const productsData = [
      {
        name: 'Heavyweight Oversized Cotton T-Shirt',
        slug: 'oversized-cotton-tshirt',
        shortDescription: '260 GSM organic cotton with dropped shoulders and a boxy, modern silhouette.',
        description:
          'Constructed from heavyweight 260 GSM combed cotton, this oversized t-shirt delivers the perfect structured drape. Featuring reinforced ribbed collar, dropped shoulder seams, and pre-shrunk fabric that holds its shape wash after wash.',
        category: categoryMap['t-shirts']._id,
        price: 1450,
        compareAtPrice: 1850,
        sku: 'AMB-TSH-01',
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'published',
        images: [
          { url: sampleImages.products[0].img1, publicId: 'p1_1', provider: 'external', alt: 'Oversized Tee Front' },
          { url: sampleImages.products[0].img2, publicId: 'p1_2', provider: 'external', alt: 'Oversized Tee Detail' },
        ],
        options: [
          { name: 'Size', values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }, { value: 'XL' }] },
          {
            name: 'Color',
            values: [
              { value: 'Warm Ivory', swatch: '#F8F7F3' },
              { value: 'Charcoal Black', swatch: '#24231F' },
            ],
          },
        ],
        variants: [
          { sku: 'AMB-TSH-01-IV-S', optionValues: { Size: 'S', Color: 'Warm Ivory' }, stock: 15, isActive: true },
          { sku: 'AMB-TSH-01-IV-M', optionValues: { Size: 'M', Color: 'Warm Ivory' }, stock: 25, isActive: true },
          { sku: 'AMB-TSH-01-IV-L', optionValues: { Size: 'L', Color: 'Warm Ivory' }, stock: 20, isActive: true },
          { sku: 'AMB-TSH-01-IV-XL', optionValues: { Size: 'XL', Color: 'Warm Ivory' }, stock: 10, isActive: true },
          { sku: 'AMB-TSH-01-CH-S', optionValues: { Size: 'S', Color: 'Charcoal Black' }, stock: 12, isActive: true },
          { sku: 'AMB-TSH-01-CH-M', optionValues: { Size: 'M', Color: 'Charcoal Black' }, stock: 18, isActive: true },
          { sku: 'AMB-TSH-01-CH-L', optionValues: { Size: 'L', Color: 'Charcoal Black' }, stock: 15, isActive: true },
          { sku: 'AMB-TSH-01-CH-XL', optionValues: { Size: 'XL', Color: 'Charcoal Black' }, stock: 8, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: '100% Combed Heavyweight Cotton' },
          { label: 'Fabric Weight', value: '260 GSM' },
          { label: 'Fit', value: 'Boxy Oversized' },
          { label: 'Care', value: 'Machine wash cold, tumble dry low' },
        ],
        tags: ['oversized', 'tshirt', 'cotton', 'unisex', 'minimal'],
        salesCount: 42,
      },
      {
        name: 'Relaxed Resort Linen Shirt',
        slug: 'relaxed-resort-linen-shirt',
        shortDescription: 'Lightweight pure flax linen shirt with an open camp collar for warm weather elegance.',
        description:
          'Crafted from washed European flax linen, this shirt keeps you cool and refined in the Biratnagar climate. Features subtle natural horn buttons, a relaxed camp collar, and curved hem suitable for untucked styling.',
        category: categoryMap['shirts']._id,
        price: 2450,
        compareAtPrice: 2950,
        sku: 'AMB-SHR-02',
        featured: true,
        bestSeller: true,
        newArrival: false,
        status: 'published',
        images: [
          { url: sampleImages.products[1].img1, publicId: 'p2_1', provider: 'external', alt: 'Linen Shirt Front' },
          { url: sampleImages.products[1].img2, publicId: 'p2_2', provider: 'external', alt: 'Linen Shirt Texture' },
        ],
        options: [
          { name: 'Size', values: [{ value: 'M' }, { value: 'L' }, { value: 'XL' }] },
          {
            name: 'Color',
            values: [
              { value: 'Natural Sand', swatch: '#EAD9BA' },
              { value: 'Olive Muted', swatch: '#707A65' },
            ],
          },
        ],
        variants: [
          { sku: 'AMB-SHR-02-SD-M', optionValues: { Size: 'M', Color: 'Natural Sand' }, stock: 12, isActive: true },
          { sku: 'AMB-SHR-02-SD-L', optionValues: { Size: 'L', Color: 'Natural Sand' }, stock: 15, isActive: true },
          { sku: 'AMB-SHR-02-SD-XL', optionValues: { Size: 'XL', Color: 'Natural Sand' }, stock: 7, isActive: true },
          { sku: 'AMB-SHR-02-OL-M', optionValues: { Size: 'M', Color: 'Olive Muted' }, stock: 10, isActive: true },
          { sku: 'AMB-SHR-02-OL-L', optionValues: { Size: 'L', Color: 'Olive Muted' }, stock: 8, isActive: true },
          { sku: 'AMB-SHR-02-OL-XL', optionValues: { Size: 'XL', Color: 'Olive Muted' }, stock: 5, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: '100% Washed Linen' },
          { label: 'Collar', value: 'Camp / Cuban Collar' },
          { label: 'Fit', value: 'Relaxed Regular' },
        ],
        tags: ['linen', 'shirt', 'summer', 'minimalist'],
        salesCount: 35,
      },
      {
        name: 'Pleated Straight-Leg Tailored Chinos',
        slug: 'pleated-straight-chinos',
        shortDescription: 'Double-pleated cotton twill trousers with a relaxed taper and comfortable mid-rise.',
        description:
          'A modern staple that balances tailoring with casual ease. Made with soft yet durable 280 GSM cotton twill with added stretch for everyday mobility.',
        category: categoryMap['bottom-wear']._id,
        price: 2650,
        compareAtPrice: 3200,
        sku: 'AMB-BOT-03',
        featured: false,
        bestSeller: true,
        newArrival: true,
        status: 'published',
        images: [
          { url: sampleImages.products[7].img1, publicId: 'p3_1', provider: 'external', alt: 'Chinos' },
          { url: sampleImages.products[7].img2, publicId: 'p3_2', provider: 'external', alt: 'Chinos Waist' },
        ],
        options: [
          { name: 'Size', values: [{ value: '30' }, { value: '32' }, { value: '34' }] },
          {
            name: 'Color',
            values: [
              { value: 'Warm Khaki', swatch: '#C5A982' },
              { value: 'Espresso Brown', swatch: '#453528' },
            ],
          },
        ],
        variants: [
          { sku: 'AMB-BOT-03-KH-30', optionValues: { Size: '30', Color: 'Warm Khaki' }, stock: 10, isActive: true },
          { sku: 'AMB-BOT-03-KH-32', optionValues: { Size: '32', Color: 'Warm Khaki' }, stock: 16, isActive: true },
          { sku: 'AMB-BOT-03-KH-34', optionValues: { Size: '34', Color: 'Warm Khaki' }, stock: 12, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: '98% Cotton, 2% Spandex Twill' },
          { label: 'Fit', value: 'Straight Leg with Single Pleat' },
        ],
        tags: ['pants', 'chinos', 'bottoms', 'trousers'],
        salesCount: 28,
      },
      {
        name: 'Classic Abstract Printed Resort Shirt',
        slug: 'classic-printed-shirt',
        shortDescription: 'Soft viscose short-sleeve shirt with an artistic earth-tone geometric print.',
        description:
          'Lightweight and fluid, this printed resort shirt brings subtle personality to casual gatherings. Cut with a relaxed silhouette and breathable drape.',
        category: categoryMap['shirts']._id,
        price: 1950,
        compareAtPrice: 2400,
        sku: 'AMB-SHR-04',
        featured: true,
        bestSeller: false,
        newArrival: true,
        status: 'published',
        images: [
          { url: sampleImages.products[3].img1, publicId: 'p4_1', provider: 'external', alt: 'Printed Shirt' },
          { url: sampleImages.products[3].img2, publicId: 'p4_2', provider: 'external', alt: 'Printed Texture' },
        ],
        options: [{ name: 'Size', values: [{ value: 'M' }, { value: 'L' }, { value: 'XL' }] }],
        variants: [
          { sku: 'AMB-SHR-04-M', optionValues: { Size: 'M' }, stock: 14, isActive: true },
          { sku: 'AMB-SHR-04-L', optionValues: { Size: 'L' }, stock: 19, isActive: true },
          { sku: 'AMB-SHR-04-XL', optionValues: { Size: 'XL' }, stock: 9, isActive: true },
        ],
        specifications: [{ label: 'Material', value: '100% Breathable Rayon Viscose' }],
        tags: ['printed', 'shirt', 'vacation', 'summer'],
        salesCount: 22,
      },
      {
        name: "Women's Wide-Leg Pleated Trousers",
        slug: 'womens-wide-leg-pleated-trousers',
        shortDescription: 'High-waisted flowing trousers with double knife pleats and clean front closure.',
        description:
          'Elegant, comfortable, and versatile. Crafted with an airy drape that pairs seamlessly from daytime coffee to evening dinners.',
        category: categoryMap['womens-wear']._id,
        price: 2750,
        compareAtPrice: 3300,
        sku: 'AMB-W-BOT-05',
        featured: true,
        bestSeller: true,
        newArrival: true,
        status: 'published',
        images: [
          { url: sampleImages.products[4].img1, publicId: 'p5_1', provider: 'external', alt: 'Wide Leg Trousers' },
          { url: sampleImages.products[4].img2, publicId: 'p5_2', provider: 'external', alt: 'Wide Leg Detail' },
        ],
        options: [
          { name: 'Size', values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }] },
          {
            name: 'Color',
            values: [
              { value: 'Ivory Cream', swatch: '#F0EEE7' },
              { value: 'Muted Mocha', swatch: '#6F4C24' },
            ],
          },
        ],
        variants: [
          { sku: 'AMB-W-BOT-05-CR-S', optionValues: { Size: 'S', Color: 'Ivory Cream' }, stock: 11, isActive: true },
          { sku: 'AMB-W-BOT-05-CR-M', optionValues: { Size: 'M', Color: 'Ivory Cream' }, stock: 14, isActive: true },
          { sku: 'AMB-W-BOT-05-CR-L', optionValues: { Size: 'L', Color: 'Ivory Cream' }, stock: 7, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: '70% Polyester, 26% Rayon, 4% Spandex' },
          { label: 'Rise', value: 'High Rise' },
        ],
        tags: ['womens', 'trousers', 'wide-leg', 'chic'],
        salesCount: 31,
      },
      {
        name: 'Structured Canvas Chore Overshirt',
        slug: 'structured-canvas-chore-overshirt',
        shortDescription: 'Durable heavyweight cotton duck canvas jacket with deep front patch pockets.',
        description:
          'Designed as the ultimate transitional layering piece. Features utility triple-needle stitching, vintage brass snap buttons, and relaxed layering room.',
        category: categoryMap['mens-wear']._id,
        price: 3200,
        compareAtPrice: 3800,
        sku: 'AMB-M-OVR-06',
        featured: false,
        bestSeller: false,
        newArrival: true,
        status: 'published',
        images: [
          { url: sampleImages.products[5].img1, publicId: 'p6_1', provider: 'external', alt: 'Chore Jacket' },
          { url: sampleImages.products[5].img2, publicId: 'p6_2', provider: 'external', alt: 'Chore Detail' },
        ],
        options: [{ name: 'Size', values: [{ value: 'M' }, { value: 'L' }, { value: 'XL' }] }],
        variants: [
          { sku: 'AMB-M-OVR-06-M', optionValues: { Size: 'M' }, stock: 8, isActive: true },
          { sku: 'AMB-M-OVR-06-L', optionValues: { Size: 'L' }, stock: 12, isActive: true },
          { sku: 'AMB-M-OVR-06-XL', optionValues: { Size: 'XL' }, stock: 4, isActive: true },
        ],
        specifications: [{ label: 'Material', value: '100% Heavy Cotton Duck Canvas' }],
        tags: ['jacket', 'overshirt', 'outerwear', 'canvas'],
        salesCount: 15,
      },
    ];

    const U = (id) => `https://images.unsplash.com/${id}?q=80&w=900&auto=format&fit=crop`;
    productsData.push(
      {
        name: 'Essential Crew Neck Tee',
        slug: 'essential-crew-neck-tee',
        shortDescription: 'A softer, slimmer everyday tee in combed cotton jersey.',
        description: 'Our everyday crew neck in a mid-weight combed cotton jersey. Clean neckline, regular fit and a soft hand-feel that gets better with every wash.',
        category: categoryMap['t-shirts']._id,
        price: 990,
        compareAtPrice: null,
        sku: 'AMB-TSH-07',
        newArrival: true,
        status: 'published',
        images: [
          { url: U('photo-1583743814966-8936f5b7be1a'), publicId: 'p7_1', provider: 'external', alt: 'Essential crew neck tee' },
          { url: U('photo-1576995853123-5a10305d93c0'), publicId: 'p7_2', provider: 'external', alt: 'Crew neck tee detail' },
        ],
        options: [
          { name: 'Size', values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }, { value: 'XL' }] },
          { name: 'Color', values: [{ value: 'Jet Black', swatch: '#1d1c1a' }, { value: 'Chalk White', swatch: '#f4f2ec' }] },
        ],
        variants: [
          { sku: 'AMB-TSH-07-BK-S', optionValues: { Size: 'S', Color: 'Jet Black' }, stock: 9, isActive: true },
          { sku: 'AMB-TSH-07-BK-M', optionValues: { Size: 'M', Color: 'Jet Black' }, stock: 3, isActive: true },
          { sku: 'AMB-TSH-07-BK-L', optionValues: { Size: 'L', Color: 'Jet Black' }, stock: 0, isActive: true },
          { sku: 'AMB-TSH-07-BK-XL', optionValues: { Size: 'XL', Color: 'Jet Black' }, stock: 6, isActive: true },
          { sku: 'AMB-TSH-07-WH-S', optionValues: { Size: 'S', Color: 'Chalk White' }, stock: 11, isActive: true },
          { sku: 'AMB-TSH-07-WH-M', optionValues: { Size: 'M', Color: 'Chalk White' }, stock: 14, isActive: true },
          { sku: 'AMB-TSH-07-WH-L', optionValues: { Size: 'L', Color: 'Chalk White' }, stock: 2, isActive: true },
          { sku: 'AMB-TSH-07-WH-XL', optionValues: { Size: 'XL', Color: 'Chalk White' }, stock: 0, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: '100% Combed Cotton' },
          { label: 'Fit', value: 'Regular' },
        ],
        tags: ['tshirt', 'basics', 'cotton'],
      },
      {
        name: 'Flowing Floral Midi Dress',
        slug: 'flowing-floral-midi-dress',
        shortDescription: 'A light, airy midi dress with a soft tie waist and fluttered sleeves.',
        description: 'Cut from a breathable woven fabric with a subtle floral print, this midi dress moves beautifully. A tie waist lets you define the fit, while fluttered sleeves keep it light for warm days.',
        category: categoryMap['womens-wear']._id,
        price: 3450,
        compareAtPrice: 4200,
        sku: 'AMB-W-DRS-08',
        featured: true,
        newArrival: true,
        status: 'published',
        images: [
          { url: U('photo-1539109136881-3be0616acf4b'), publicId: 'p8_1', provider: 'external', alt: 'Floral midi dress' },
          { url: U('photo-1529139574466-a303027c1d8b'), publicId: 'p8_2', provider: 'external', alt: 'Midi dress styled' },
        ],
        options: [{ name: 'Size', values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }] }],
        variants: [
          { sku: 'AMB-W-DRS-08-S', optionValues: { Size: 'S' }, stock: 5, isActive: true },
          { sku: 'AMB-W-DRS-08-M', optionValues: { Size: 'M' }, stock: 7, isActive: true },
          { sku: 'AMB-W-DRS-08-L', optionValues: { Size: 'L' }, stock: 4, isActive: true },
        ],
        specifications: [
          { label: 'Material', value: 'Viscose blend' },
          { label: 'Length', value: 'Midi' },
        ],
        tags: ['dress', 'womens', 'floral'],
      },
      {
        name: 'Everyday Ribbed Knit Top',
        slug: 'everyday-ribbed-knit-top',
        shortDescription: 'A fitted ribbed top that pairs with everything.',
        description: 'A close-fitting rib knit with plenty of stretch and a clean scoop neck. Tuck it into wide-leg trousers or layer it under an overshirt.',
        category: categoryMap['womens-wear']._id,
        price: 1650,
        compareAtPrice: null,
        sku: 'AMB-W-TOP-09',
        status: 'published',
        images: [
          { url: U('photo-1487412720507-e7ab37603c6f'), publicId: 'p9_1', provider: 'external', alt: 'Ribbed knit top' },
          { url: U('photo-1483985988355-763728e1935b'), publicId: 'p9_2', provider: 'external', alt: 'Ribbed knit top styled' },
        ],
        options: [],
        variants: [{ sku: 'AMB-W-TOP-09-OS', optionValues: {}, stock: 0, isActive: true }],
        specifications: [{ label: 'Fit', value: 'One size, stretch rib' }],
        tags: ['top', 'womens', 'knit'],
      }
    );

    for (const prod of productsData) {
      let pDoc = await Product.findOne({ slug: prod.slug });
      if (!pDoc) {
        pDoc = await Product.create({
          ...prod,
          tags: [...(prod.tags || []), 'demo'],
          publishedAt: new Date(),
        });
      }
    }
    console.log('[Seed] Products initialized.');

    // 5. Coupons
    const couponsData = [
      {
        code: 'AMBERK10',
        description: '10% discount on your first order over NPR 1,500',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1500,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'BIRATNAGAR200',
        description: 'Flat NPR 200 off on festive collection orders',
        type: 'fixed',
        value: 200,
        minOrderAmount: 2000,
        isActive: true,
      },
    ];

    for (const c of couponsData) {
      let cDoc = await Coupon.findOne({ code: c.code });
      if (!cDoc) {
        await Coupon.create(c);
      }
    }
    console.log('[Seed] Coupons initialized.');

    // 6. Store Settings
    let settings = await StoreSettings.findOne();
    if (!settings) {
      await StoreSettings.create({
        store: {
          name: 'Amberk Clothing',
          tagline: 'Wear Your Everyday Better.',
          description:
            'Contemporary everyday fashion & modern wardrobe essentials based in Biratnagar, Nepal. Delivering quality, style and accessible luxury.',
          email: '',
          phone: '',
          whatsapp: '',
          address: {
            line: '',
            city: 'Biratnagar',
            district: 'Morang',
            province: 'Koshi Province',
            country: 'Nepal',
          },
          businessHours: 'Sun – Fri: 10:00 AM – 7:30 PM',
        },
        social: {
          facebook: '',
          instagram: '',
          tiktok: '',
          youtube: '',
          twitter: '',
        },
        delivery: {
          enabled: true,
          zones: [
            {
              id: 'zone-biratnagar',
              name: 'Biratnagar Metropolitan',
              description: 'Local express delivery across Biratnagar city area',
              districts: ['Morang'],
              municipalities: ['Biratnagar', 'Biratnagar Metropolitan City'],
              charge: 0,
              freeDelivery: true,
              freeDeliveryMinimum: null,
              estimatedDays: 'Same day / 24 hours',
              isActive: true,
            },
            {
              id: 'zone-koshi',
              name: 'Koshi Province (Morang / Sunsari / Jhapa)',
              description: 'Regional home delivery via courier',
              districts: ['Morang', 'Sunsari', 'Jhapa'],
              municipalities: [],
              charge: 100,
              freeDelivery: false,
              freeDeliveryMinimum: 2000,
              estimatedDays: '1–2 business days',
              isActive: true,
            },
          ],
          allowOutsideZones: true,
          outsideZoneCharge: 150,
          outsideZoneFreeMinimum: 3000,
          outsideZoneEstimatedDays: '3–5 business days',
          info: 'Free Home Delivery across Biratnagar Metropolitan on all orders. Free nationwide delivery on orders over NPR 3,000.',
        },
        payments: {
          cod: {
            enabled: true,
            label: 'Cash on Delivery (COD)',
            instructions: 'Pay securely in cash or Fonepay QR upon receipt of your package at your doorstep.',
          },
          esewa: {
            enabled: false,
            label: 'eSewa Mobile Wallet',
            instructions: 'Instant digital wallet payment via eSewa gateway.',
          },
          khalti: {
            enabled: false,
            label: 'Khalti Digital Wallet',
            instructions: 'Fast checkout using Khalti digital wallet.',
          },
        },
      });
      console.log('[Seed] Store settings created.');
    }

    // 7. Homepage Sections
    const homepageSectionsData = [
      {
        key: 'announcement',
        order: 1,
        isEnabled: true,
        content: {
          messages: [
            'Free Home Delivery Across Biratnagar & Eligible Locations',
            'Fresh Arrivals: Wear Your Everyday Better',
            'Use Code AMBERK10 For 10% Off On Orders Over NPR 1,500',
          ],
          link: '/shop',
        },
      },
      {
        key: 'hero',
        order: 2,
        isEnabled: true,
        content: {
          eyebrow: 'AMBERK CLOTHING — EST. BIRATNAGAR',
          heading: 'Style That Moves With You.',
          subheading:
            'Discover fresh everyday fashion, contemporary essentials, and the styles you love — all at prices that feel right.',
          primaryCta: { label: 'Explore Collection', href: '/shop' },
          secondaryCta: { label: 'Discover Amberk', href: '/about' },
          image: { url: sampleImages.hero, publicId: 'hero_main', provider: 'external' },
        },
      },
      {
        key: 'featuredCategories',
        order: 3,
        isEnabled: true,
        content: {
          heading: 'Curated Categories',
          subheading: 'Thoughtfully designed silhouettes for every occasion and everyday comfort.',
          categoryIds: [],
        },
      },
      {
        key: 'newArrivals',
        order: 4,
        isEnabled: true,
        content: {
          heading: 'New Arrivals',
          subheading: 'Freshly cut pieces and seasonal staples just landed in store.',
          limit: 8,
          productIds: [],
        },
      },
      {
        key: 'promo',
        order: 5,
        isEnabled: true,
        content: {
          eyebrow: 'EDITORIAL SPOTLIGHT',
          heading: 'Your Next Favourite Look Starts Here.',
          body: 'Explore carefully selected styles that bring comfort, confidence, and everyday versatility together. Designed for timeless appeal without the luxury markup.',
          cta: { label: 'Shop The Look', href: '/shop' },
          image: { url: sampleImages.promo, publicId: 'promo_img', provider: 'external' },
        },
      },
      {
        key: 'bestSellers',
        order: 6,
        isEnabled: true,
        content: {
          heading: 'Best Sellers',
          subheading: 'Our most sought-after garments, loved and repeatedly ordered by our community.',
          limit: 4,
          productIds: [],
        },
      },
      {
        key: 'benefits',
        order: 7,
        isEnabled: true,
        content: {
          heading: 'The Amberk Standard',
          items: [
            { icon: 'sparkles', title: 'Fresh Fashion Finds', description: 'Trend-forward designs curated weekly for a modern wardrobe.' },
            { icon: 'tag', title: 'Fair & Honest Value', description: 'Premium fabrications without unreasonable markups.' },
            { icon: 'truck', title: 'Eligible Free Delivery', description: 'Complimentary home delivery to your doorstep.' },
            { icon: 'refresh', title: 'Easy Exchanges', description: '7-day seamless size exchanges for complete peace of mind.' },
          ],
        },
      },
      {
        key: 'newsletter',
        order: 8,
        isEnabled: true,
        content: {
          heading: 'Join The Amberk Community',
          body: 'Be the first to hear about private drops, new seasonal collections, and subscriber-only offers.',
        },
      },
      {
        key: 'footer',
        order: 9,
        isEnabled: true,
        content: {
          description:
            'Amberk Clothing is a contemporary clothing destination based in Biratnagar, Nepal. Bringing effortless everyday fashion at fair prices.',
          copyright: '© {year} Amberk Clothing. All rights reserved. Made in Biratnagar, Nepal.',
          paymentInfo: 'Cash on Delivery & Secure Mobile Payments.',
          deliveryInfo: 'Fast dispatch from Biratnagar with nationwide courier partners.',
        },
      },
    ];

    for (const sec of homepageSectionsData) {
      let secDoc = await HomepageSection.findOne({ key: sec.key });
      if (!secDoc) {
        await HomepageSection.create(sec);
      }
    }
    console.log('[Seed] Homepage sections initialized.');

    // 8. Demo Orders for Analytics testing
    const existingOrdersCount = await Order.countDocuments();
    if (existingOrdersCount === 0) {
      const p1 = await Product.findOne({ slug: 'oversized-cotton-tshirt' });
      const p2 = await Product.findOne({ slug: 'relaxed-resort-linen-shirt' });

      if (p1 && p2) {
        await Order.create({
          orderNumber: 'AMB-2026-104921',
          accessKey: 'demo_access_key_amberk_001',
          userId: customer._id,
          customer: {
            fullName: 'Aayush Shrestha',
            phone: '+977 9842011223',
            email: 'customer@amberk.com',
          },
          items: [
            {
              productId: p1._id,
              variantId: p1.variants[0]._id.toString(),
              name: p1.name,
              slug: p1.slug,
              sku: p1.variants[0].sku,
              image: p1.images[0],
              optionValues: { Size: 'M', Color: 'Warm Ivory' },
              unitPrice: p1.price,
              compareAtPrice: p1.compareAtPrice,
              quantity: 2,
              lineTotal: p1.price * 2,
            },
          ],
          subtotal: p1.price * 2,
          discount: 0,
          deliveryCharge: 0,
          total: p1.price * 2,
          shippingAddress: {
            fullName: 'Aayush Shrestha',
            phone: '+977 9842011223',
            province: 'Koshi Province',
            district: 'Morang',
            municipality: 'Biratnagar',
            area: 'Traffic Chowk',
            address: 'Ward 7',
            landmark: 'City Mart',
          },
          deliveryZone: 'Biratnagar Metropolitan',
          estimatedDelivery: 'Same day',
          paymentMethod: 'cod',
          paymentStatus: 'paid',
          status: 'delivered',
          statusHistory: [
            { type: 'fulfilment', from: null, to: 'pending', note: 'Order placed', at: new Date(Date.now() - 86400000 * 3) },
            { type: 'fulfilment', from: 'pending', to: 'delivered', note: 'Handed over to customer', at: new Date(Date.now() - 86400000) },
          ],
        });

        await Order.create({
          orderNumber: 'AMB-2026-209841',
          accessKey: 'demo_access_key_amberk_002',
          customer: {
            fullName: 'Pooja Subedi',
            phone: '+977 9811223344',
            email: 'pooja.s@gmail.com',
          },
          items: [
            {
              productId: p2._id,
              variantId: p2.variants[0]._id.toString(),
              name: p2.name,
              slug: p2.slug,
              sku: p2.variants[0].sku,
              image: p2.images[0],
              optionValues: { Size: 'M', Color: 'Natural Sand' },
              unitPrice: p2.price,
              compareAtPrice: p2.compareAtPrice,
              quantity: 1,
              lineTotal: p2.price,
            },
          ],
          subtotal: p2.price,
          discount: 0,
          deliveryCharge: 0,
          total: p2.price,
          shippingAddress: {
            fullName: 'Pooja Subedi',
            phone: '+977 9811223344',
            province: 'Koshi Province',
            district: 'Morang',
            municipality: 'Biratnagar',
            area: 'Bargachhi',
            address: 'House #44',
            landmark: 'Near Petrol Pump',
          },
          deliveryZone: 'Biratnagar Metropolitan',
          paymentMethod: 'cod',
          paymentStatus: 'cod_due',
          status: 'processing',
          statusHistory: [
            { type: 'fulfilment', from: null, to: 'pending', note: 'Order placed', at: new Date(Date.now() - 3600000 * 5) },
            { type: 'fulfilment', from: 'pending', to: 'processing', note: 'Packed at warehouse', at: new Date() },
          ],
        });
        console.log('[Seed] Sample orders initialized.');
      }
    }

    console.log('[Seed] Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seed();

