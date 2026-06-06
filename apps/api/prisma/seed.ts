import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create an admin user
  await prisma.user.upsert({
    where: { email: 'admin@jetis.com' },
    update: {},
    create: {
      email: 'admin@jetis.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Jetis',
      role: 'ADMIN',
    },
  });

  // Create a regular user
  await prisma.user.upsert({
    where: { email: 'user@jetis.com' },
    update: {},
    create: {
      email: 'user@jetis.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    },
  });

  // Create a courier
  const courierUser = await prisma.user.upsert({
    where: { email: 'courier@jetis.com' },
    update: {},
    create: {
      email: 'courier@jetis.com',
      password: hashedPassword,
      firstName: 'Speedy',
      lastName: 'Gonzales',
      role: 'COURIER',
    },
  });

  await prisma.courier.upsert({
    where: { userId: courierUser.id },
    update: {},
    create: {
      userId: courierUser.id,
      vehicleType: 'MOTO',
      plateNumber: '34 JET 15',
      isOnline: true,
      currentLat: 41.0082,
      currentLng: 28.9784,
    },
  });

  // Pricing Rules
  const pricingRules = [
    { vehicleType: 'MOTO', deliveryType: 'STANDARD', basePrice: 45, perKmPrice: 12, perMinPrice: 0.5, minPrice: 60 },
    { vehicleType: 'MOTO', deliveryType: 'EXPRESS', basePrice: 65, perKmPrice: 18, perMinPrice: 0.8, minPrice: 90 },
    { vehicleType: 'CAR', deliveryType: 'STANDARD', basePrice: 80, perKmPrice: 20, perMinPrice: 1.0, minPrice: 120 },
    { vehicleType: 'CAR', deliveryType: 'EXPRESS', basePrice: 120, perKmPrice: 30, perMinPrice: 1.5, minPrice: 180 },
  ];

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { vehicleType_deliveryType: { vehicleType: rule.vehicleType, deliveryType: rule.deliveryType } },
      update: rule,
      create: rule,
    });
  }

  // Settings
  const settings = [
    { key: 'TAX_RATE', value: '0.20', description: 'VAT rate (20%)' },
    { key: 'COMMISSION_RATE', value: '0.15', description: 'Platform commission (15%)' },
    { key: 'NIGHT_START_HOUR', value: '22', description: 'Night rate start (10 PM)' },
    { key: 'NIGHT_END_HOUR', value: '06', description: 'Night rate end (6 AM)' },
    { key: 'NIGHT_SURCHARGE_PERCENT', value: '0.25', description: 'Night surcharge (25%)' },
    { key: 'QUOTE_TTL_MINUTES', value: '15', description: 'Quote expiration time' },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Surge Pricing (Rush Hour)
  await prisma.surgePricing.upsert({
    where: { id: 'surge-rush-hour' },
    update: { isActive: true },
    create: {
      id: 'surge-rush-hour',
      name: 'Evening Rush',
      multiplier: 1.4,
      startTime: '17:00',
      endTime: '20:00',
      daysOfWeek: '1,2,3,4,5',
      isActive: true,
    },
  });

  // Weather Pricing
  await prisma.weatherPricing.upsert({
    where: { id: 'weather-rain' },
    update: { isActive: true },
    create: {
      id: 'weather-rain',
      condition: 'RAIN',
      multiplier: 1.25,
      isActive: true,
    },
  });

  // Welcome Campaign
  await prisma.campaign.upsert({
    where: { id: 'welcome-discount' },
    update: { isActive: true },
    create: {
      id: 'welcome-discount',
      name: 'Welcome 20',
      discountType: 'PERCENT',
      value: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });

  // Find regular user and courier
  const regularUser = await prisma.user.findUnique({
    where: { email: 'user@jetis.com' },
  });

  const courier = await prisma.courier.findFirst({
    include: { user: true },
  });

  if (regularUser && courier) {
    // Order 1 (Delivered)
    await prisma.order.upsert({
      where: { idempotencyKey: 'seed-order-1' },
      update: {},
      create: {
        userId: regularUser.id,
        courierId: courier.id,
        status: 'DELIVERED',
        pickupAddress: 'Kadıköy Rıhtım, İstanbul',
        pickupLat: 40.9901,
        pickupLng: 29.0205,
        dropoffAddress: 'Beşiktaş Meydan, İstanbul',
        dropoffLat: 41.0428,
        dropoffLng: 29.0075,
        packageDetails: 'Evrak Zarfı',
        vehicleType: 'MOTO',
        deliveryType: 'STANDARD',
        basePrice: 45,
        distancePrice: 120,
        surgePrice: 0,
        weatherPrice: 0,
        taxPrice: 33,
        commissionPrice: 24.75,
        discountPrice: 0,
        totalPrice: 198,
        distanceKm: 10,
        estimatedTime: 25,
        idempotencyKey: 'seed-order-1',
      },
    });

    // Order 2 (Picked Up)
    await prisma.order.upsert({
      where: { idempotencyKey: 'seed-order-2' },
      update: {},
      create: {
        userId: regularUser.id,
        courierId: courier.id,
        status: 'PICKED_UP',
        pickupAddress: 'Şişli Camii, İstanbul',
        pickupLat: 41.0602,
        pickupLng: 28.9876,
        dropoffAddress: 'Fatih Camii, İstanbul',
        dropoffLat: 41.0195,
        dropoffLng: 28.9498,
        packageDetails: 'Sıcak Yemek Kutusu',
        vehicleType: 'MOTO',
        deliveryType: 'EXPRESS',
        basePrice: 65,
        distancePrice: 108,
        surgePrice: 15,
        weatherPrice: 0,
        taxPrice: 37.6,
        commissionPrice: 28.2,
        discountPrice: 0,
        totalPrice: 225.6,
        distanceKm: 6,
        estimatedTime: 18,
        idempotencyKey: 'seed-order-2',
      },
    });

    // Order 3 (Pending)
    await prisma.order.upsert({
      where: { idempotencyKey: 'seed-order-3' },
      update: {},
      create: {
        userId: regularUser.id,
        status: 'PENDING',
        pickupAddress: 'Üsküdar İskele, İstanbul',
        pickupLat: 41.0267,
        pickupLng: 29.0158,
        dropoffAddress: 'Ataşehir Batı, İstanbul',
        dropoffLat: 40.9934,
        dropoffLng: 29.1171,
        packageDetails: 'Elektronik Eşya',
        vehicleType: 'CAR',
        deliveryType: 'STANDARD',
        basePrice: 80,
        distancePrice: 220,
        surgePrice: 30,
        weatherPrice: 0,
        taxPrice: 66,
        commissionPrice: 49.5,
        discountPrice: 0,
        totalPrice: 396,
        distanceKm: 11,
        estimatedTime: 35,
        idempotencyKey: 'seed-order-3',
      },
    });
  }

  console.log('Database seeded successfully with pricing logic and sample orders!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
