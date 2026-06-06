import { z } from 'zod';

export const createOrderSchema = z.object({
  quoteId: z.string().min(3),
  pickupAddress: z.string().min(5),
  dropoffAddress: z.string().min(5).optional(),
  deliveryAddress: z.string().min(5).optional(),
  packageDetails: z.string().max(500).optional(),
  vehicleType: z.enum(['MOTO', 'CAR', 'EXPRESS_CAR']).default('MOTO'),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'VIP']).default('STANDARD'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PICKED_UP', 'DELIVERED', 'CANCELLED']),
});
