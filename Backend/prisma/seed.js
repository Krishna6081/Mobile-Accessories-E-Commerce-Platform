const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// AES-256 Helper for seeding Payment Credentials safely
function encryptText(text) {
  const secretKey = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function main() {
  console.log('🌱 Starting Mobile Accessories Database Seeding...');

  // 1. ROLES
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator with ultimate permissions',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System Administrator with broad operational controls',
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: {
      name: 'MANAGER',
      description: 'Store Manager for order fulfillment & inventory',
      isSystem: true,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: {
      name: 'CUSTOMER',
      description: 'Standard Storefront Registered Customer',
      isSystem: true,
    },
  });

  // 2. PERMISSIONS
  const permissionList = [
    { name: 'product.view', module: 'Catalog', description: 'View catalog products' },
    { name: 'product.create', module: 'Catalog', description: 'Create catalog products' },
    { name: 'product.update', module: 'Catalog', description: 'Update catalog products' },
    { name: 'product.delete', module: 'Catalog', description: 'Delete catalog products' },
    { name: 'category.view', module: 'Catalog', description: 'View categories' },
    { name: 'category.create', module: 'Catalog', description: 'Create categories' },
    { name: 'category.update', module: 'Catalog', description: 'Update categories' },
    { name: 'category.delete', module: 'Catalog', description: 'Delete categories' },
    { name: 'brand.view', module: 'Catalog', description: 'View brands' },
    { name: 'brand.create', module: 'Catalog', description: 'Create brands' },
    { name: 'brand.update', module: 'Catalog', description: 'Update brands' },
    { name: 'brand.delete', module: 'Catalog', description: 'Delete brands' },
    { name: 'order.view', module: 'Orders', description: 'View customer orders' },
    { name: 'order.update', module: 'Orders', description: 'Update order status & courier' },
    { name: 'order.cancel', module: 'Orders', description: 'Cancel orders' },
    { name: 'order.refund', module: 'Orders', description: 'Process order returns & refunds' },
    { name: 'inventory.view', module: 'Inventory', description: 'View stock levels' },
    { name: 'inventory.update', module: 'Inventory', description: 'Adjust stock levels' },
    { name: 'customer.view', module: 'Customers', description: 'View customer profiles' },
    { name: 'customer.block', module: 'Customers', description: 'Block or unblock customers' },
    { name: 'coupon.view', module: 'Marketing', description: 'View coupons' },
    { name: 'coupon.create', module: 'Marketing', description: 'Create coupons' },
    { name: 'coupon.update', module: 'Marketing', description: 'Update coupons' },
    { name: 'coupon.delete', module: 'Marketing', description: 'Delete coupons' },
    { name: 'banner.view', module: 'Marketing', description: 'View promotional banners' },
    { name: 'banner.create', module: 'Marketing', description: 'Create promotional banners' },
    { name: 'banner.update', module: 'Marketing', description: 'Update promotional banners' },
    { name: 'banner.delete', module: 'Marketing', description: 'Delete promotional banners' },
    { name: 'cms.view', module: 'CMS', description: 'View CMS pages' },
    { name: 'cms.update', module: 'CMS', description: 'Update CMS pages' },
    { name: 'reports.view', module: 'Reports', description: 'View sales & inventory reports' },
    { name: 'reports.export', module: 'Reports', description: 'Export report datasets' },
    { name: 'settings.view', module: 'Settings', description: 'View store settings' },
    { name: 'settings.update', module: 'Settings', description: 'Update store settings' },
    { name: 'payment.manage', module: 'Security', description: 'Manage payment gateway credentials' },
    { name: 'staff.view', module: 'Staff', description: 'View staff members' },
    { name: 'staff.create', module: 'Staff', description: 'Create staff accounts' },
    { name: 'staff.update', module: 'Staff', description: 'Update staff details' },
    { name: 'staff.delete', module: 'Staff', description: 'Delete staff accounts' },
    { name: 'roles.view', module: 'Security', description: 'View roles & permissions' },
    { name: 'roles.create', module: 'Security', description: 'Create custom roles' },
    { name: 'roles.update', module: 'Security', description: 'Update roles & permissions' },
    { name: 'roles.delete', module: 'Security', description: 'Delete roles' },
    { name: 'audit.view', module: 'Audit', description: 'View system audit logs' },
  ];

  const dbPermissions = [];
  for (const perm of permissionList) {
    const dbPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
    dbPermissions.push(dbPerm);
  }

  // Bind permissions to SUPER_ADMIN (All)
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Bind permissions to ADMIN (All except Super Admin exclusive security)
  const superExclusive = ['payment.manage', 'staff.create', 'staff.delete', 'roles.create', 'roles.delete'];
  for (const perm of dbPermissions) {
    if (!superExclusive.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: adminRole.id, permissionId: perm.id },
      });
    }
  }

  // Bind permissions to MANAGER (Inventory & Orders focus)
  const managerPermNames = ['product.view', 'order.view', 'order.update', 'inventory.view', 'inventory.update', 'customer.view'];
  for (const perm of dbPermissions) {
    if (managerPermNames.includes(perm.name)) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: managerRole.id, permissionId: perm.id } },
        update: {},
        create: { roleId: managerRole.id, permissionId: perm.id },
      });
    }
  }

  // 3. SEED USERS
  const hashedPasswordSuper = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'SuperAdmin123!', 10);
  const hashedPasswordAdmin = await bcrypt.hash(process.env.DEFAULT_STAFF_PASSWORD || 'Admin123!', 10);
  const hashedPasswordCustomer = await bcrypt.hash('Customer123!', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: process.env.DEFAULT_ADMIN_EMAIL || 'superadmin@accessories.com' },
    update: {},
    create: {
      name: process.env.DEFAULT_ADMIN_NAME || 'Super Admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'superadmin@accessories.com',
      mobile: process.env.DEFAULT_ADMIN_MOBILE || '9876543210',
      password: hashedPasswordSuper,
      roleId: superAdminRole.id,
      isEmailVerified: true,
      isMobileVerified: true,
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: process.env.DEFAULT_STAFF_EMAIL || 'admin@accessories.com' },
    update: {},
    create: {
      name: 'Operations Admin',
      email: process.env.DEFAULT_STAFF_EMAIL || 'admin@accessories.com',
      mobile: '9876543211',
      password: hashedPasswordAdmin,
      roleId: adminRole.id,
      isEmailVerified: true,
      isMobileVerified: true,
      status: 'ACTIVE',
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'customer@example.com',
      mobile: '9988776655',
      password: hashedPasswordCustomer,
      roleId: customerRole.id,
      isEmailVerified: true,
      isMobileVerified: true,
      status: 'ACTIVE',
    },
  });

  // Seed Customer Address
  await prisma.address.createMany({
    data: [
      {
        userId: customerUser.id,
        fullName: 'John Doe',
        mobile: '9988776655',
        addressLine1: 'Flat 402, Sunshine Apartments',
        addressLine2: 'MG Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });

  // 4. SEED CATEGORIES
  const categoriesData = [
    { name: 'Phone Cases', slug: 'phone-cases', description: 'Protective & stylish back covers, rugged armor cases, and MagSafe silicone covers.' },
    { name: 'Chargers', slug: 'chargers', description: 'Fast GaN wall adapters, wireless charging pads, car chargers, and multi-port docks.' },
    { name: 'Cables', slug: 'cables', description: 'Braided Type-C to Lightning, USB-C 100W PD cables, and durable multi-connector cables.' },
    { name: 'Audio Accessories', slug: 'audio-accessories', description: 'True wireless earbuds, neckbands, noise-canceling headphones, and audio adapters.' },
    { name: 'Power Banks', slug: 'power-banks', description: 'High-capacity 20,000mAh power banks, MagSafe magnetic battery packs, and fast-charge pods.' },
    { name: 'Mobile Mounts', slug: 'mobile-mounts', description: 'Car dashboard phone holders, AC vent magnetic clips, desktop tripod stands, and ring lights.' },
    { name: 'Smart Watch Accessories', slug: 'smart-watch-accessories', description: 'Silicone watch straps, stainless steel bands, screen guards, and magnetic chargers.' },
    { name: 'OTG & Drives', slug: 'otg-drives', description: 'Dual Type-C USB flash drives, high-speed card readers, and OTG dongles.' },
    { name: 'Screen Protectors', slug: 'screen-protectors', description: '9H hardness tempered glass, privacy screens, UV curved glass, and camera lens protectors.' },
    { name: 'Speakers', slug: 'speakers', description: 'Portable Bluetooth outdoor speakers, RGB mini desk speakers, and waterproof soundbars.' },
  ];

  const dbCategories = {};
  for (const cat of categoriesData) {
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    dbCategories[cat.slug] = dbCat;
  }

  // 5. SEED BRANDS
  const brandsData = [
    { name: 'Anker', slug: 'anker', description: 'Global leader in mobile charging and audio tech.' },
    { name: 'Spigen', slug: 'spigen', description: 'Premium protective mobile phone cases and glass guards.' },
    { name: 'boAt', slug: 'boat', description: 'Popular lifestyle audio and wearable mobile accessories.' },
    { name: 'Portronics', slug: 'portronics', description: 'Innovative Indian portable electronics brand.' },
    { name: 'Mi', slug: 'mi', description: 'Smart devices, power banks, and high-performance chargers.' },
    { name: 'SanDisk', slug: 'sandisk', description: 'Trusted high-speed storage flash drives and memory cards.' },
  ];

  const dbBrands = {};
  for (const brand of brandsData) {
    const dbB = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
    dbBrands[brand.slug] = dbB;
  }

  // 6. SEED PRODUCTS & VARIANTS
  const sampleProducts = [
    {
      name: 'Spigen Tough Armor Case for iPhone 15 Pro',
      slug: 'spigen-tough-armor-iphone-15-pro',
      description: 'Extreme dual-layer protection with Air Cushion Technology and built-in kickstand. Impact resistant TPU and polycarbonate frame.',
      specifications: { Compatibility: 'iPhone 15 Pro', Material: 'Polycarbonate & TPU', Kickstand: 'Yes', MagSafe: 'Compatible' },
      categoryId: dbCategories['phone-cases'].id,
      brandId: dbBrands['spigen'].id,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.8,
      reviewCount: 142,
      tags: 'iphone 15 pro, cover, tough armor, spigen',
      variants: [
        { sku: 'SPG-IP15P-BLK', color: 'Matte Black', mrp: 2499, price: 1799, stock: 45, modelCompatibility: 'iPhone 15 Pro' },
        { sku: 'SPG-IP15P-GUN', color: 'Gunmetal', mrp: 2499, price: 1799, stock: 20, modelCompatibility: 'iPhone 15 Pro' },
      ],
      images: [
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Anker 65W GaN Fast Wall Charger (USB-C 3-Port)',
      slug: 'anker-65w-gan-fast-wall-charger',
      description: 'PowerIQ 3.0 ultra-compact GaN fast charger. Simultaneously fast charge your MacBook Pro, iPhone, and Galaxy S24 Ultra.',
      specifications: { Output: '65W Max', Ports: '2x USB-C PD, 1x USB-A', Tech: 'GaN II Technology', Guarantee: '18 Months Warranty' },
      categoryId: dbCategories['chargers'].id,
      brandId: dbBrands['anker'].id,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.9,
      reviewCount: 289,
      tags: 'gan charger, fast charger, 65w, anker, macbook charger',
      variants: [
        { sku: 'ANK-65W-WHT', color: 'White', mrp: 4999, price: 3499, stock: 60, modelCompatibility: 'Universal USB-C' },
        { sku: 'ANK-65W-BLK', color: 'Black', mrp: 4999, price: 3499, stock: 35, modelCompatibility: 'Universal USB-C' },
      ],
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'boAt Airdopes 141 True Wireless Earbuds',
      slug: 'boat-airdopes-141-tws',
      description: '42 Hours total playback time with Beast Mode low latency for gaming and ENx Environmental Noise Cancellation.',
      specifications: { Playback: '42 Hours', Latency: '80ms Low Latency', Bluetooth: 'v5.3', WaterResistance: 'IPX4' },
      categoryId: dbCategories['audio-accessories'].id,
      brandId: dbBrands['boat'].id,
      isFeatured: true,
      isBestSeller: true,
      rating: 4.6,
      reviewCount: 520,
      tags: 'tws, boat, earbuds, wireless audio, bluetooth',
      variants: [
        { sku: 'BOAT-AD141-BLK', color: 'Bold Black', mrp: 4490, price: 1299, stock: 150, modelCompatibility: 'Universal Bluetooth' },
        { sku: 'BOAT-AD141-CYN', color: 'Cyan Cider', mrp: 4490, price: 1299, stock: 80, modelCompatibility: 'Universal Bluetooth' },
      ],
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Mi 20,000mAh Power Bank 3i Fast Charge 18W',
      slug: 'mi-20000mah-power-bank-3i',
      description: 'Triple output port 18W fast charging power bank with dual input support (Micro-USB and Type-C) and smart power management.',
      specifications: { Capacity: '20000mAh', Input: 'Type-C & Micro USB', Output: 'Triple Output 18W', Battery: 'Lithium Polymer' },
      categoryId: dbCategories['power-banks'].id,
      brandId: dbBrands['mi'].id,
      isFeatured: false,
      isBestSeller: true,
      rating: 4.7,
      reviewCount: 410,
      tags: 'powerbank, mi, 20000mah, fast charge',
      variants: [
        { sku: 'MI-PB20K-BLK', color: 'Black', mrp: 2199, price: 1799, stock: 95, modelCompatibility: 'Universal' },
      ],
      images: [
        'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=800&q=80',
      ],
    },
    {
      name: 'Portronics Clamp X Car Dashboard Phone Mount',
      slug: 'portronics-clamp-x-car-mount',
      description: '360 degree rotating arm magnetic car mount with strong vacuum suction gel cup for windshield and dashboard.',
      specifications: { Rotation: '360 Degree', MountType: 'Suction Cup', ArmLength: 'Adjustable Telescopic' },
      categoryId: dbCategories['mobile-mounts'].id,
      brandId: dbBrands['portronics'].id,
      isFeatured: false,
      isBestSeller: false,
      rating: 4.5,
      reviewCount: 88,
      tags: 'car mount, holder, portronics, phone stand',
      variants: [
        { sku: 'PORT-CLMPX-BLK', color: 'Black', mrp: 999, price: 499, stock: 50, modelCompatibility: 'Universal Phones up to 7 inches' },
      ],
      images: [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80',
      ],
    },
  ];

  for (const prodData of sampleProducts) {
    const { variants, images, ...pDetails } = prodData;
    const dbProduct = await prisma.product.upsert({
      where: { slug: pDetails.slug },
      update: {},
      create: pDetails,
    });

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          ...v,
          productId: dbProduct.id,
        },
      });
    }

    let sortIndex = 0;
    for (const imgUrl of images) {
      await prisma.productImage.create({
        data: {
          productId: dbProduct.id,
          url: imgUrl,
          sortOrder: sortIndex++,
          isPrimary: sortIndex === 1,
        },
      });
    }
  }

  // 7. SEED BANNERS
  const banners = [
    {
      title: 'Next-Gen GaN Fast Chargers',
      subtitle: 'Charge your devices up to 3x faster with ultra-compact GaN technology.',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Shop Chargers',
      ctaLink: '/category/chargers',
      position: 'HERO_CAROUSEL',
      sortOrder: 1,
    },
    {
      title: 'Premium Armor Protection',
      subtitle: 'Drop-tested cases for iPhone 15 Pro & Samsung Galaxy S24 Series.',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1600&q=80',
      ctaText: 'Explore Cases',
      ctaLink: '/category/phone-cases',
      position: 'HERO_CAROUSEL',
      sortOrder: 2,
    },
  ];

  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }

  // 8. SEED COUPONS
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Get 10% flat discount on your first accessory order!',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 499,
      maxDiscount: 200,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2030-12-31'),
    },
  });

  // 9. SEED CMS PAGES
  const cmsPages = [
    { slug: 'about', title: 'About Us', content: '<h2>Welcome to Mobile Accessories Store</h2><p>We provide authentic, high-quality mobile accessories from top global brands with fast nationwide delivery.</p>' },
    { slug: 'contact', title: 'Contact Us', content: '<h2>Get in Touch</h2><p>Email: support@accessories.com | Phone: +91 98765 43210</p>' },
    { slug: 'privacy-policy', title: 'Privacy Policy', content: '<h2>Privacy Policy</h2><p>Your data is protected with 256-bit SSL encryption and strict privacy standards.</p>' },
    { slug: 'terms', title: 'Terms & Conditions', content: '<h2>Terms of Service</h2><p>Please review our standard platform policies prior to placing orders.</p>' },
    { slug: 'shipping-policy', title: 'Shipping Policy', content: '<h2>Shipping Details</h2><p>Free standard shipping on all orders over ₹499. Orders dispatch within 24 hours.</p>' },
    { slug: 'refund-policy', title: 'Refund & Return Policy', content: '<h2>Easy 7-Day Returns</h2><p>Hassle-free replacement or full refund for defective/damaged items upon delivery verification.</p>' },
  ];

  for (const cms of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: cms.slug },
      update: { title: cms.title, content: cms.content },
      create: cms,
    });
  }

  // 10. SEED PAYMENT CREDENTIALS (RAZORPAY ENCRYPTED)
  const encSecret = encryptText(process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_67890');
  const encWebhook = encryptText(process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret_9999');

  await prisma.paymentCredential.upsert({
    where: { provider: 'RAZORPAY' },
    update: {},
    create: {
      provider: 'RAZORPAY',
      mode: 'TEST',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_key_id_12345',
      encryptedKeySecret: encSecret,
      encryptedWebhookSecret: encWebhook,
      isActive: true,
      updatedBy: superAdminUser.id,
    },
  });

  console.log('✅ Mobile Accessories Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
