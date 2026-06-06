import { z } from 'zod';

const coordinate = z.number().min(-180).max(180);

export const calculatePriceSchema = z.object({
  pickupLat: coordinate.optional(),
  pickupLng: coordinate.optional(),
  dropoffLat: coordinate.optional(),
  dropoffLng: coordinate.optional(),
  pickupAddress: z.string().min(5).optional(),
  deliveryAddress: z.string().min(5).optional(),
  vehicleType: z.enum(['MOTO', 'CAR', 'EXPRESS_CAR']).default('MOTO'),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'VIP']).default('STANDARD'),
  couponCode: z.string().min(2).max(32).optional(),
  weatherCondition: z.string().max(32).optional(),
});

export const pricingEntityParamsSchema = z.object({
  entity: z.enum([
    'pricing-rules',
    'surge-pricing',
    'weather-pricing',
    'zones',
    'coupons',
    'campaigns',
  ]),
  id: z.string().optional(),
});

export const zoneSchema = z.object({
  name: z.string().min(2),
  polygonJson: z.string().min(5),
  priceAdjustment: z.number().min(-10000).max(10000),
  isActive: z.boolean().optional(),
});

export const surgeSchema = z.object({
  name: z.string().min(2),
  multiplier: z.number().min(1).max(5),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  daysOfWeek: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const weatherSchema = z.object({
  condition: z.string().min(2),
  multiplier: z.number().min(1).max(5),
  isActive: z.boolean().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(2).max(32),
  discountType: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive(),
  maxDiscount: z.number().positive().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const campaignSchema = z.object({
  name: z.string().min(2),
  discountType: z.enum(['PERCENT', 'FIXED']),
  value: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional(),
});

export const pricingRuleSchema = z.object({
  vehicleType: z.enum(['MOTO', 'CAR', 'EXPRESS_CAR']),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'VIP']),
  basePrice: z.number().nonnegative(),
  perKmPrice: z.number().nonnegative(),
  perMinPrice: z.number().nonnegative().optional(),
  minPrice: z.number().nonnegative(),
  isActive: z.boolean().optional(),
});

export const settingSchema = z.object({
  value: z.string().min(1),
  description: z.string().max(200).optional(),
});
