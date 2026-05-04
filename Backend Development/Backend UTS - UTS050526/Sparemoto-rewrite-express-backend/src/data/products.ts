export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  description: string;
  specs: string[];
  inStock: boolean;
  stockCount?: number;
  badge?: string;
  rating: number;
  reviews: number;
  image: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { slug: 'engine', name: 'Engine Parts', description: 'Pistons, gaskets, valves and internal engine components', icon: '⚙️', count: 8 },
  { slug: 'brakes', name: 'Brake Systems', description: 'Pads, rotors, calipers and brake lines', icon: '🛑', count: 6 },
  { slug: 'suspension', name: 'Suspension', description: 'Forks, shocks, springs and linkage kits', icon: '🔧', count: 5 },
  { slug: 'electrical', name: 'Electrical', description: 'Batteries, stators, regulators and wiring', icon: '⚡', count: 6 },
  { slug: 'exhaust', name: 'Exhaust', description: 'Headers, mufflers and complete exhaust systems', icon: '💨', count: 4 },
  { slug: 'drivetrain', name: 'Drivetrain', description: 'Chains, sprockets, clutch kits and gears', icon: '🔗', count: 5 },
];

export const products: Product[] = [
  // Engine
  { id: 'eng-001', name: 'Performance Piston Kit', category: 'Engine Parts', categorySlug: 'engine', price: 189.99, originalPrice: 229.99, description: 'High-compression forged piston kit for improved power output. Includes piston, rings, wrist pin, and circlips. Precision-machined for exact fitment.', specs: ['Forged aluminum alloy', 'High-compression design', 'Includes rings & pin', 'Fits 250cc–450cc'], inStock: true, badge: 'SALE', rating: 4.8, reviews: 124, image: '' },
  { id: 'eng-002', name: 'Complete Gasket Set', category: 'Engine Parts', categorySlug: 'engine', price: 54.99, description: 'Full gasket set for top and bottom end rebuild. OEM-quality materials with excellent sealing properties.', specs: ['Top & bottom end', 'OEM-spec material', 'Heat-resistant', 'Multi-layer steel head gasket'], inStock: true, rating: 4.6, reviews: 89, image: '' },
  { id: 'eng-003', name: 'Camshaft Assembly', category: 'Engine Parts', categorySlug: 'engine', price: 279.99, description: 'Performance camshaft with optimized lobe profiles for increased torque and horsepower across the RPM range.', specs: ['Billet steel construction', 'Optimized lobe profile', 'Increased lift & duration', 'Drop-in fitment'], inStock: true, rating: 4.9, reviews: 56, image: '' },
  { id: 'eng-004', name: 'Valve Spring Kit', category: 'Engine Parts', categorySlug: 'engine', price: 67.50, originalPrice: 85.00, description: 'Heavy-duty valve spring kit for high-RPM reliability. Prevents valve float under aggressive riding conditions.', specs: ['Chromium silicon wire', 'Higher spring rate', 'Includes retainers', 'Set of 4'], inStock: true, badge: 'SALE', rating: 4.5, reviews: 38, image: '' },
  { id: 'eng-005', name: 'Oil Pump Assembly', category: 'Engine Parts', categorySlug: 'engine', price: 142.00, description: 'OEM-replacement oil pump with improved gear tolerances for consistent oil pressure delivery.', specs: ['Direct OEM replacement', 'Improved tolerances', 'Steel gears', 'Includes gasket'], inStock: false, rating: 4.7, reviews: 45, image: '' },
  { id: 'eng-006', name: 'Cylinder Bore Kit', category: 'Engine Parts', categorySlug: 'engine', price: 345.00, description: 'Nickel silicon carbide plated cylinder with matched piston for maximum performance and longevity.', specs: ['NiSiC plated bore', 'Matched piston included', 'Precision honed', '+1mm oversize available'], inStock: true, rating: 4.9, reviews: 67, image: '' },
  { id: 'eng-007', name: 'Timing Chain Kit', category: 'Engine Parts', categorySlug: 'engine', price: 89.99, description: 'Complete timing chain kit with tensioner, guides, and chain. Eliminates timing rattle and ensures precise valve timing.', specs: ['Heavy-duty chain', 'Includes tensioner', 'New guides included', 'Pre-stretched'], inStock: true, rating: 4.4, reviews: 72, image: '' },
  { id: 'eng-008', name: 'Crankshaft Bearing Set', category: 'Engine Parts', categorySlug: 'engine', price: 76.50, description: 'Premium crankshaft main and rod bearing set with tri-metal construction for superior load capacity.', specs: ['Tri-metal construction', 'Main & rod bearings', 'Standard & undersizes', 'High load capacity'], inStock: true, rating: 4.6, reviews: 31, image: '' },

  // Brakes
  { id: 'brk-001', name: 'Sintered Brake Pads (Front)', category: 'Brake Systems', categorySlug: 'brakes', price: 42.99, description: 'High-performance sintered front brake pads with excellent stopping power in all conditions, wet or dry.', specs: ['Sintered metallic compound', 'All-weather performance', 'Low dust formula', 'Includes wear indicators'], inStock: true, rating: 4.7, reviews: 198, image: '' },
  { id: 'brk-002', name: 'Floating Brake Rotor', category: 'Brake Systems', categorySlug: 'brakes', price: 159.99, originalPrice: 199.99, description: 'Lightweight floating front brake rotor with stainless steel disc and aluminum carrier for superior heat dissipation.', specs: ['Stainless steel disc', 'Aluminum carrier', 'Floating design', '320mm diameter'], inStock: true, badge: 'SALE', rating: 4.8, reviews: 76, image: '' },
  { id: 'brk-003', name: 'Brake Caliper Rebuild Kit', category: 'Brake Systems', categorySlug: 'brakes', price: 34.50, description: 'Complete caliper rebuild kit with new seals, dust boots, and pistons. Restores braking performance to like-new condition.', specs: ['New seals & boots', 'Stainless pistons', 'Fits most 4-pot calipers', 'Includes brake grease'], inStock: true, rating: 4.5, reviews: 64, image: '' },
  { id: 'brk-004', name: 'Braided Brake Line Set', category: 'Brake Systems', categorySlug: 'brakes', price: 79.99, description: 'Stainless steel braided brake lines for improved pedal feel and consistent braking. DOT compliant.', specs: ['Stainless steel braided', 'PTFE inner liner', 'DOT approved', 'Front & rear set'], inStock: true, rating: 4.6, reviews: 112, image: '' },
  { id: 'brk-005', name: 'Master Cylinder Assembly', category: 'Brake Systems', categorySlug: 'brakes', price: 119.00, description: 'Radial master cylinder for precise brake modulation and powerful stopping force.', specs: ['Radial mount design', 'Forged body', 'Adjustable lever ratio', '19mm bore'], inStock: true, rating: 4.9, reviews: 43, image: '' },
  { id: 'brk-006', name: 'Rear Brake Pads', category: 'Brake Systems', categorySlug: 'brakes', price: 29.99, description: 'OEM-replacement rear brake pads with organic compound for smooth, progressive braking feel.', specs: ['Organic compound', 'Quiet operation', 'OEM fitment', 'Low rotor wear'], inStock: true, rating: 4.3, reviews: 87, image: '' },

  // Suspension
  { id: 'sus-001', name: 'Fork Seal Kit', category: 'Suspension', categorySlug: 'suspension', price: 28.99, description: 'Premium fork seal and dust wiper kit. Eliminates fork oil leaks and restores smooth suspension action.', specs: ['NOK seals', 'Includes dust wipers', 'OEM dimensions', 'Fits 48mm forks'], inStock: true, rating: 4.6, reviews: 156, image: '' },
  { id: 'sus-002', name: 'Rear Shock Absorber', category: 'Suspension', categorySlug: 'suspension', price: 449.99, originalPrice: 549.99, description: 'Fully adjustable rear shock with remote reservoir. 46mm body, adjustable compression, rebound, and preload.', specs: ['46mm body', 'Remote reservoir', 'Full adjustability', 'Nitrogen charged'], inStock: true, badge: 'SALE', rating: 4.9, reviews: 34, image: '' },
  { id: 'sus-003', name: 'Fork Spring Set', category: 'Suspension', categorySlug: 'suspension', price: 89.50, description: 'Progressive-rate fork springs for improved front-end compliance and bottoming resistance.', specs: ['Progressive rate', 'Chrome silicon steel', 'Pair included', 'Multiple rates available'], inStock: true, rating: 4.7, reviews: 58, image: '' },
  { id: 'sus-004', name: 'Linkage Bearing Kit', category: 'Suspension', categorySlug: 'suspension', price: 64.99, description: 'Complete rear suspension linkage bearing kit with seals. Eliminates slop and restores rear suspension performance.', specs: ['All bearings included', 'New seals', 'Grease included', 'Precision fit'], inStock: false, rating: 4.5, reviews: 41, image: '' },
  { id: 'sus-005', name: 'Steering Head Bearings', category: 'Suspension', categorySlug: 'suspension', price: 39.99, description: 'Tapered roller steering head bearing set for precise, wobble-free steering and handling.', specs: ['Tapered roller type', 'Upper & lower set', 'Dust seals included', 'High-grade steel'], inStock: true, rating: 4.8, reviews: 93, image: '' },

  // Electrical
  { id: 'elc-001', name: 'Lithium Battery', category: 'Electrical', categorySlug: 'electrical', price: 159.99, originalPrice: 189.99, description: 'Lightweight lithium-iron-phosphate battery. 70% lighter than lead-acid with superior cranking power and lifespan.', specs: ['LiFePO4 chemistry', '70% weight savings', 'Built-in BMS', '5-year lifespan'], inStock: true, badge: 'POPULAR', rating: 4.8, reviews: 203, image: '' },
  { id: 'elc-002', name: 'Stator Assembly', category: 'Electrical', categorySlug: 'electrical', price: 189.00, description: 'OEM-replacement stator assembly with heavy-gauge copper windings for reliable charging output.', specs: ['Heavy-gauge copper', 'OEM replacement', 'Epoxy coated', 'High output'], inStock: true, rating: 4.5, reviews: 67, image: '' },
  { id: 'elc-003', name: 'Voltage Regulator/Rectifier', category: 'Electrical', categorySlug: 'electrical', price: 74.99, description: 'MOSFET voltage regulator/rectifier with superior heat management. Runs cooler and lasts longer than OEM.', specs: ['MOSFET technology', 'Finned heatsink', 'Plug-and-play', '14.2V regulated output'], inStock: true, rating: 4.7, reviews: 89, image: '' },
  { id: 'elc-004', name: 'LED Headlight Kit', category: 'Electrical', categorySlug: 'electrical', price: 129.99, description: 'High-output LED headlight conversion kit with 6000K daylight-white output and integrated cooling fan.', specs: ['6000K color temp', '4000 lumens', 'Integrated fan cooling', 'H4 fitment'], inStock: true, rating: 4.6, reviews: 134, image: '' },
  { id: 'elc-005', name: 'Wiring Harness (Main)', category: 'Electrical', categorySlug: 'electrical', price: 224.99, description: 'Complete main wiring harness with color-coded wires and factory-style connectors. For full electrical restoration.', specs: ['Color-coded wires', 'OEM connectors', 'Complete harness', 'Installation diagram'], inStock: false, rating: 4.4, reviews: 22, image: '' },
  { id: 'elc-006', name: 'Ignition Coil Pack', category: 'Electrical', categorySlug: 'electrical', price: 59.99, description: 'High-energy ignition coil for stronger spark and improved combustion. Direct OEM replacement.', specs: ['Higher energy output', 'Silicone boots included', 'Direct replacement', 'Epoxy-filled'], inStock: true, rating: 4.5, reviews: 78, image: '' },

  // Exhaust
  { id: 'exh-001', name: 'Full Exhaust System', category: 'Exhaust', categorySlug: 'exhaust', price: 649.99, originalPrice: 799.99, description: 'Complete stainless steel exhaust system with carbon fiber end cap. Significant weight savings and power gains throughout the RPM range.', specs: ['304 stainless steel', 'Carbon fiber end cap', '4.5 kg weight savings', 'FMF-style core'], inStock: true, badge: 'BEST SELLER', rating: 4.9, reviews: 87, image: '' },
  { id: 'exh-002', name: 'Slip-On Muffler', category: 'Exhaust', categorySlug: 'exhaust', price: 299.99, description: 'Bolt-on slip-on muffler with aggressive sound and easy installation. No header modification required.', specs: ['Titanium shell', 'Bolt-on install', 'DB killer included', 'No mapping needed'], inStock: true, rating: 4.7, reviews: 145, image: '' },
  { id: 'exh-003', name: 'Header Pipe', category: 'Exhaust', categorySlug: 'exhaust', price: 289.00, description: 'Mandrel-bent header pipe in brushed stainless steel. Optimized diameter for midrange torque improvement.', specs: ['Mandrel bent', 'Brushed stainless', 'Optimized diameter', 'Includes gaskets'], inStock: true, rating: 4.6, reviews: 39, image: '' },
  { id: 'exh-004', name: 'Exhaust Gasket Kit', category: 'Exhaust', categorySlug: 'exhaust', price: 18.99, description: 'Complete exhaust gasket set including header, midpipe, and muffler connection gaskets.', specs: ['High-temp material', 'Complete set', 'Crush-style gaskets', 'OEM fitment'], inStock: true, rating: 4.4, reviews: 62, image: '' },

  // Drivetrain
  { id: 'drv-001', name: 'Chain & Sprocket Kit', category: 'Drivetrain', categorySlug: 'drivetrain', price: 134.99, originalPrice: 164.99, description: 'Complete chain and sprocket kit with gold O-ring chain. Pre-matched for proper fitment and longevity.', specs: ['520 O-ring chain', 'Steel sprockets', 'Pre-matched set', '114 link chain'], inStock: true, badge: 'SALE', rating: 4.7, reviews: 178, image: '' },
  { id: 'drv-002', name: 'Clutch Kit (Complete)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 159.99, description: 'Complete clutch kit with friction plates, steel plates, and heavy-duty springs for consistent engagement.', specs: ['Friction & steel plates', 'HD springs included', 'OEM+ quality', 'Drop-in fitment'], inStock: true, rating: 4.8, reviews: 92, image: '' },
  { id: 'drv-003', name: 'Front Sprocket (15T)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 24.99, description: 'Chromoly steel front sprocket. Hardened and tempered for maximum wear life. Self-cleaning design.', specs: ['Chromoly steel', 'Hardened teeth', 'Self-cleaning', '15 tooth, 520 pitch'], inStock: true, rating: 4.5, reviews: 113, image: '' },
  { id: 'drv-004', name: 'Rear Sprocket (45T)', category: 'Drivetrain', categorySlug: 'drivetrain', price: 54.99, description: 'Lightweight 7075-T6 aluminum rear sprocket with hard anodized finish for extended life.', specs: ['7075-T6 aluminum', 'Hard anodized', '45 tooth, 520 pitch', 'Self-cleaning grooves'], inStock: true, rating: 4.6, reviews: 86, image: '' },
  { id: 'drv-005', name: 'Clutch Cable', category: 'Drivetrain', categorySlug: 'drivetrain', price: 22.50, description: 'OEM-length clutch cable with Teflon-lined inner wire for smooth, low-effort operation.', specs: ['Teflon lined', 'OEM length', 'Stainless inner wire', 'Nylon outer jacket'], inStock: true, rating: 4.3, reviews: 54, image: '' },
];

export function getProductsByCategory(slug: string): Product[] {
  return products.filter(p => p.categorySlug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.badge || (p.originalPrice && p.originalPrice > p.price)).slice(0, 8);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.category.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower)
  );
}
