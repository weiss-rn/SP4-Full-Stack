const db = require('./db');
const crypto = require('crypto');

const categories = [
  { slug: 'engine', name: 'Engine Parts', description: 'Pistons, gaskets, valves and internal engine components', icon: '⚙️' },
  { slug: 'brakes', name: 'Brake Systems', description: 'Pads, rotors, calipers and brake lines', icon: '🛑' },
  { slug: 'suspension', name: 'Suspension', description: 'Forks, shocks, springs and linkage kits', icon: '🔧' },
  { slug: 'electrical', name: 'Electrical', description: 'Batteries, stators, regulators and wiring', icon: '⚡' },
  { slug: 'exhaust', name: 'Exhaust', description: 'Headers, mufflers and complete exhaust systems', icon: '💨' },
  { slug: 'drivetrain', name: 'Drivetrain', description: 'Chains, sprockets, clutch kits and gears', icon: '🔗' },
];

const products = [
  // Engine
  { id: 'eng-001', name: 'Performance Piston Kit', category: 'Engine Parts', categorySlug: 'engine', price: 189.99, originalPrice: 229.99, description: 'High-compression forged piston kit for improved power output. Includes piston, rings, wrist pin, and circlips. Precision-machined for exact fitment.', specs: ['Forged aluminum alloy', 'High-compression design', 'Includes rings & pin', 'Fits 250cc–450cc'], inStock: true, stockCount: 12, badge: 'SALE', rating: 4.8, reviews: 124 },
  { id: 'eng-002', name: 'Complete Gasket Set', category: 'Engine Parts', categorySlug: 'engine', price: 54.99, description: 'Full gasket set for top and bottom end rebuild. OEM-quality materials with excellent sealing properties.', specs: ['Top & bottom end', 'OEM-spec material', 'Heat-resistant', 'Multi-layer steel head gasket'], inStock: true, stockCount: 25, rating: 4.6, reviews: 89 },
  { id: 'eng-003', name: 'Camshaft Assembly', category: 'Engine Parts', categorySlug: 'engine', price: 279.99, description: 'Performance camshaft with optimized lobe profiles for increased torque and horsepower across the RPM range.', specs: ['Billet steel construction', 'Optimized lobe profile', 'Increased lift & duration', 'Drop-in fitment'], inStock: true, stockCount: 8, rating: 4.9, reviews: 56 },
  { id: 'eng-004', name: 'Valve Spring Kit', category: 'Engine Parts', categorySlug: 'engine', price: 67.50, originalPrice: 85.00, description: 'Heavy-duty valve spring kit for high-RPM reliability.', specs: ['Chromium silicon wire', 'Higher spring rate', 'Includes retainers', 'Set of 4'], inStock: true, stockCount: 20, badge: 'SALE', rating: 4.5, reviews: 38 },
  { id: 'eng-005', name: 'Oil Pump Assembly', category: 'Engine Parts', categorySlug: 'engine', price: 142.00, description: 'OEM-replacement oil pump with improved gear tolerances.', specs: ['Direct OEM replacement', 'Improved tolerances', 'Steel gears', 'Includes gasket'], inStock: false, stockCount: 0, rating: 4.7, reviews: 45 },
  { id: 'eng-006', name: 'Cylinder Bore Kit', category: 'Engine Parts', categorySlug: 'engine', price: 345.00, description: 'Nickel silicon carbide plated cylinder with matched piston.', specs: ['NiSiC plated bore', 'Matched piston included', 'Precision honed', '+1mm oversize available'], inStock: true, stockCount: 5, rating: 4.9, reviews: 67 },
  { id: 'eng-007', name: 'Timing Chain Kit', category: 'Engine Parts', categorySlug: 'engine', price: 89.99, description: 'Complete timing chain kit with tensioner, guides, and chain.', specs: ['Heavy-duty chain', 'Includes tensioner', 'New guides included', 'Pre-stretched'], inStock: true, stockCount: 15, rating: 4.4, reviews: 72 },
  { id: 'eng-008', name: 'Crankshaft Bearing Set', category: 'Engine Parts', categorySlug: 'engine', price: 76.50, description: 'Premium crankshaft main and rod bearing set.', specs: ['Tri-metal construction', 'Main & rod bearings', 'Standard & undersizes', 'High load capacity'], inStock: true, stockCount: 18, rating: 4.6, reviews: 31 },
  // Brakes
  { id: 'brk-001', name: 'Sintered Brake Pads (Front)', category: 'Brake Systems', categorySlug: 'brakes', price: 42.99, description: 'High-performance sintered front brake pads.', specs: ['Sintered metallic compound', 'All-weather performance', 'Low dust formula', 'Includes wear indicators'], inStock: true, stockCount: 50, rating: 4.7, reviews: 198 },
  { id: 'brk-002', name: 'Floating Brake Rotor', category: 'Brake Systems', categorySlug: 'brakes', price: 159.99, originalPrice: 199.99, description: 'Lightweight floating front brake rotor.', specs: ['Stainless steel disc', 'Aluminum carrier', 'Floating design', '320mm diameter'], inStock: true, stockCount: 10, badge: 'SALE', rating: 4.8, reviews: 76 },
  { id: 'brk-003', name: 'Brake Caliper Rebuild Kit', category: 'Brake Systems', categorySlug: 'brakes', price: 34.50, description: 'Complete caliper rebuild kit with new seals.', specs: ['New seals & boots', 'Stainless pistons', 'Fits most 4-pot calipers', 'Includes brake grease'], inStock: true, stockCount: 30, rating: 4.5, reviews: 64 },
  { id: 'brk-004', name: 'Braided Brake Line Set', category: 'Brake Systems', categorySlug: 'brakes', price: 79.99, description: 'Stainless steel braided brake lines.', specs: ['Stainless steel braided', 'PTFE inner liner', 'DOT approved', 'Front & rear set'], inStock: true, stockCount: 22, rating: 4.6, reviews: 112 },
  { id: 'brk-005', name: 'Master Cylinder Assembly', category: 'Brake Systems', categorySlug: 'brakes', price: 119.00, description: 'Radial master cylinder for precise brake modulation.', specs: ['Radial mount design', 'Forged body', 'Adjustable lever ratio', '19mm bore'], inStock: true, stockCount: 7, rating: 4.9, reviews: 43 },
  { id: 'brk-006', name: 'Rear Brake Pads', category: 'Brake Systems', categorySlug: 'brakes', price: 29.99, description: 'OEM-replacement rear brake pads.', specs: ['Organic compound', 'Quiet operation', 'OEM fitment', 'Low rotor wear'], inStock: true, stockCount: 40, rating: 4.3, reviews: 87 },
  // Suspension
  { id: 'sus-001', name: 'Fork Seal Kit', category: 'Suspension', categorySlug: 'suspension', price: 28.99, description: 'Premium fork seal and dust wiper kit.', specs: ['NOK seals', 'Includes dust wipers', 'OEM dimensions', 'Fits 48mm forks'], inStock: true, stockCount: 35, rating: 4.6, reviews: 156 },
  { id: 'sus-002', name: 'Rear Shock Absorber', category: 'Suspension', categorySlug: 'suspension', price: 449.99, originalPrice: 549.99, description: 'Fully adjustable rear shock with remote reservoir.', specs: ['46mm body', 'Remote reservoir', 'Full adjustability', 'Nitrogen charged'], inStock: true, stockCount: 4, badge: 'SALE', rating: 4.9, reviews: 34 },
  { id: 'sus-003', name: 'Fork Spring Set', category: 'Suspension', categorySlug: 'suspension', price: 89.50, description: 'Progressive-rate fork springs.', specs: ['Progressive rate', 'Chrome silicon steel', 'Pair included', 'Multiple rates available'], inStock: true, stockCount: 15, rating: 4.7, reviews: 58 },
  { id: 'sus-004', name: 'Linkage Bearing Kit', category: 'Suspension', categorySlug: 'suspension', price: 64.99, description: 'Complete rear suspension linkage bearing kit.', specs: ['All bearings included', 'New seals', 'Grease included', 'Precision fit'], inStock: false, stockCount: 0, rating: 4.5, reviews: 41 },
  { id: 'sus-005', name: 'Steering Head Bearings', category: 'Suspension', categorySlug: 'suspension', price: 39.99, description: 'Tapered roller steering head bearing set.', specs: ['Tapered roller type', 'Upper & lower set', 'Dust seals included', 'High-grade steel'], inStock: true, stockCount: 20, rating: 4.8, reviews: 93 },
  // Electrical
  { id: 'elc-001', name: 'Lithium Battery', category: 'Electrical', categorySlug: 'electrical', price: 159.99, originalPrice: 189.99, description: 'Lightweight lithium-iron-phosphate battery.', specs: ['LiFePO4 chemistry', '70% weight savings', 'Built-in BMS', '5-year lifespan'], inStock: true, stockCount: 12, badge: 'POPULAR', rating: 4.8, reviews: 203 },
  { id: 'elc-002', name: 'Stator Assembly', category: 'Electrical', categorySlug: 'electrical', price: 189.00, description: 'OEM-replacement stator assembly.', specs: ['Heavy-gauge copper', 'OEM replacement', 'Epoxy coated', 'High output'], inStock: true, stockCount: 6, rating: 4.5, reviews: 67 },
  { id: 'elc-003', name: 'Voltage Regulator/Rectifier', category: 'Electrical', categorySlug: 'electrical', price: 74.99, description: 'MOSFET voltage regulator/rectifier.', specs: ['MOSFET technology', 'Finned heatsink', 'Plug-and-play', '14.2V regulated output'], inStock: true, stockCount: 14, rating: 4.7, reviews: 89 },
  { id: 'elc-004', name: 'LED Headlight Kit', category: 'Electrical', categorySlug: 'electrical', price: 129.99, description: 'High-output LED headlight conversion kit.', specs: ['6000K color temp', '4000 lumens', 'Integrated fan cooling', 'H4 fitment'], inStock: true, stockCount: 10, rating: 4.6, reviews: 134 },
  { id: 'elc-005', name: 'Wiring Harness (Main)', category: 'Electrical', categorySlug: 'electrical', price: 224.99, description: 'Complete main wiring harness.', specs: ['Color-coded wires', 'OEM connectors', 'Complete harness', 'Installation diagram'], inStock: false, stockCount: 0, rating: 4.4, reviews: 22 },
  { id: 'elc-006', name: 'Ignition Coil Pack', category: 'Electrical', categorySlug: 'electrical', price: 59.99, description: 'High-energy ignition coil.', specs: ['Higher energy output', 'Silicone boots included', 'Direct replacement', 'Epoxy-filled'], inStock: true, stockCount: 18, rating: 4.5, reviews: 78 },
  // Exhaust
  { id: 'exh-001', name: 'Full Exhaust System', category: 'Exhaust', categorySlug: 'exhaust', price: 649.99, originalPrice: 799.99, description: 'Complete stainless steel exhaust system.', specs: ['304 stainless steel', 'Carbon fiber end cap', '4.5 kg weight savings', 'FMF-style core'], inStock: true, stockCount: 3, badge: 'BEST SELLER', rating: 4.9, reviews: 87 },
  { id: 'exh-002', name: 'Slip-On Muffler', category: 'Exhaust', categorySlug: 'exhaust', price: 299.99, description: 'Bolt-on slip-on muffler.', specs: ['Titanium shell', 'Bolt-on install', 'DB killer included', 'No mapping needed'], inStock: true, stockCount: 8, rating: 4.7, reviews: 145 },
  { id: 'exh-003', name: 'Header Pipe', category: 'Exhaust', categorySlug: 'exhaust', price: 289.00, description: 'Mandrel-bent header pipe.', specs: ['Mandrel bent', 'Brushed stainless', 'Optimized diameter', 'Includes gaskets'], inStock: true, stockCount: 6, rating: 4.6, reviews: 39 },
  { id: 'exh-004', name: 'Exhaust Gasket Kit', category: 'Exhaust', categorySlug: 'exhaust', price: 18.99, description: 'Complete exhaust gasket set.', specs: ['High-temp material', 'Complete set', 'Crush-style gaskets', 'OEM fitment'], inStock: true, stockCount: 30, rating: 4.4, reviews: 62 },
  // Drivetrain
  { id: 'drv-001', name: 'Chain & Sprocket Kit', category: 'Drivetrain', categorySlug: 'drivetrain', price: 134.99, originalPrice: 164.99, description: 'Complete chain and sprocket kit.', specs: ['520 O-ring chain', 'Steel sprockets', 'Pre-matched set', '114 link chain'], inStock: true, stockCount: 10, badge: 'SALE', rating: 4.7, reviews: 178 },
  { id: 'drv-002', name: 'Clutch Kit (Complete)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 159.99, description: 'Complete clutch kit.', specs: ['Friction & steel plates', 'HD springs included', 'OEM+ quality', 'Drop-in fitment'], inStock: true, stockCount: 10, rating: 4.8, reviews: 92 },
  { id: 'drv-003', name: 'Front Sprocket (15T)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 24.99, description: 'Chromoly steel front sprocket.', specs: ['Chromoly steel', 'Hardened teeth', 'Self-cleaning', '15 tooth, 520 pitch'], inStock: true, stockCount: 25, rating: 4.5, reviews: 113 },
  { id: 'drv-004', name: 'Rear Sprocket (45T)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 54.99, description: 'Lightweight 7075-T6 aluminum rear sprocket.', specs: ['7075-T6 aluminum', 'Hard anodized', '45 tooth, 520 pitch', 'Self-cleaning grooves'], inStock: true, stockCount: 18, rating: 4.6, reviews: 86 },
  { id: 'drv-005', name: 'Clutch Cable', category: 'Drivetrain', categorySlug: 'drivetrain', price: 22.50, description: 'OEM-length clutch cable.', specs: ['Teflon lined', 'OEM length', 'Stainless inner wire', 'Nylon outer jacket'], inStock: true, stockCount: 20, rating: 4.3, reviews: 54 },
];

async function seed() {
  try {
    console.log('Seeding database...');

    // Check if already seeded
    const [existing] = await db.execute('SELECT COUNT(*) AS count FROM products');
    if (existing[0].count > 0) {
      console.log(`Database already has ${existing[0].count} products. Skipping seed.`);
      console.log('To re-seed, truncate the products table first.');
      process.exit(0);
    }

    // Insert products
    for (const p of products) {
      await db.execute(
        `INSERT INTO products (id, name, category, category_slug, price, original_price, description, specs, in_stock, stock_count, badge, rating, reviews)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.category, p.categorySlug, p.price, p.originalPrice || null,
         p.description, JSON.stringify(p.specs), p.inStock ? 1 : 0, p.stockCount || 0,
         p.badge || null, p.rating, p.reviews]
      );
    }

    console.log(`Seeded ${products.length} products successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
