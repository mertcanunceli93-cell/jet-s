import { Request, Response } from 'express';
import { io } from '../index';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { sendSuccess, sendError } from '../lib/response';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized.', 401);
    }
    const idempotencyKey = req.header('Idempotency-Key');
    if (!idempotencyKey) {
      return sendError(res, 'Idempotency-Key header is required.', 400);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey },
    });
    if (existingOrder) {
      logger.info('checkout.idempotent_replay', {
        requestId: req.requestId,
        orderId: existingOrder.id,
        idempotencyKey,
      });
      return sendSuccess(res, { order: existingOrder, replay: true });
    }

    const {
      pickupAddress,
      deliveryAddress,
      dropoffAddress,
      packageDetails,
      packageCategory,
      scheduledFor,
      vehicleType = 'MOTO',
      deliveryType = 'STANDARD',
      quoteId,
    } = req.body;

    if (!quoteId) {
      return sendError(res, 'quoteId is required.', 400);
    }
    const finalDropoffAddress = dropoffAddress || deliveryAddress;
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) {
      return sendError(res, 'Quote not found.', 404);
    }
    if (quote.consumedAt) {
      return sendError(res, 'Quote already consumed.', 409);
    }
    if (new Date(quote.expiresAt) < new Date()) {
      return sendError(res, 'Quote expired.', 410);
    }
    if (quote.vehicleType !== vehicleType || quote.deliveryType !== deliveryType) {
      return sendError(res, 'Quote does not match selected delivery options.', 400);
    }
    const coupon = quote.couponCode
      ? await prisma.coupon.findFirst({ where: { code: quote.couponCode, isActive: true } })
      : null;

    const order = await prisma.$transaction(async (tx) => {
      const latestQuote = await tx.quote.findUnique({ where: { id: quoteId } });
      if (!latestQuote || latestQuote.consumedAt || latestQuote.expiresAt < new Date()) {
        throw new Error('Quote is no longer valid for checkout.');
      }

      const createdOrder = await tx.order.create({
        data: {
          userId,
          pickupLat: quote.pickupLat,
          pickupLng: quote.pickupLng,
          dropoffLat: quote.dropoffLat,
          dropoffLng: quote.dropoffLng,
          pickupAddress,
          dropoffAddress: finalDropoffAddress,
          packageDetails,
          packageCategory,
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
          deliveryOtp,
          vehicleType,
          deliveryType,
          basePrice: latestQuote.basePrice,
          distancePrice: latestQuote.distancePrice,
          surgePrice: latestQuote.surgePrice + latestQuote.nightPrice + latestQuote.zonePrice,
          weatherPrice: latestQuote.weatherPrice,
          taxPrice: latestQuote.taxPrice,
          commissionPrice: latestQuote.commissionPrice,
          discountPrice: latestQuote.discountPrice,
          totalPrice: latestQuote.totalPrice,
          distanceKm: latestQuote.distanceKm,
          estimatedTime: latestQuote.estimatedTime,
          couponId: coupon?.id,
          quoteId,
          idempotencyKey,
          status: 'PENDING',
        },
      });

      await tx.quote.update({
        where: { id: quoteId },
        data: { consumedAt: new Date() },
      });
      return createdOrder;
    });

    // Notify all couriers about a new pending order
    io.emit('new_order', order);
    logger.info('checkout.created', {
      requestId: req.requestId,
      orderId: order.id,
      quoteId,
      idempotencyKey,
    });

    return sendSuccess(res, { order }, 201);
  } catch (error: any) {
    logger.error('checkout.failed', {
      requestId: req.requestId,
      message: error?.message,
    });
    if (error?.message?.includes('Quote is no longer valid')) {
      return sendError(res, error.message, 409);
    }
    if (error?.code === 'P2002') {
      const existing = await prisma.order.findUnique({
        where: { idempotencyKey: req.header('Idempotency-Key') || '' },
      });
      if (existing) return sendSuccess(res, { order: existing, replay: true });
    }
    return sendError(res, 'Sipariş oluşturulamadı.');
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const courier = await prisma.courier.findUnique({ where: { userId } });

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId },
          ...(courier ? [{ courierId: courier.id }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, { orders });
  } catch (error) {
    logger.error('orders.get_my_orders_failed', { message: (error as Error).message, requestId: req.requestId });
    return sendError(res, 'Siparişler getirilemedi.');
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const courier = await prisma.courier.findUnique({ where: { userId } });

    const order = await prisma.order.findFirst({
      where: { 
        id,
        OR: [
          { userId },
          ...(courier ? [{ courierId: courier.id }] : [])
        ]
      },
      include: {
        courier: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return sendError(res, 'Sipariş bulunamadı.', 404);
    }

    return sendSuccess(res, { order });
  } catch (error) {
    logger.error('orders.get_details_failed', { message: (error as Error).message, requestId: req.requestId });
    return sendError(res, 'Sipariş detayı getirilemedi.');
  }
};

export const getAvailableOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    return sendSuccess(res, { orders });
  } catch (error) {
    logger.error('orders.get_available_failed', { message: (error as Error).message, requestId: req.requestId });
    return sendError(res, 'Mevcut siparişler getirilemedi.');
  }
};

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const courierUserId = req.user?.userId;
    const courier = await prisma.courier.findUnique({ where: { userId: courierUserId } });
    if (!courier) {
      return sendError(res, 'Courier profile not found.', 404);
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        courierId: courier.id,
        status: 'PICKED_UP',
      },
    });

    // Notify the user that their order was accepted
    io.to(order.userId).emit('order_update', order);

    return sendSuccess(res, { order });
  } catch (error) {
    logger.error('orders.accept_failed', { message: (error as Error).message, requestId: req.requestId });
    return sendError(res, 'Sipariş kabul edilemedi.');
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;

    // Validate OTP if status is DELIVERED
    if (status === 'DELIVERED') {
      const existingOrder = await prisma.order.findUnique({ where: { id } });
      if (!existingOrder) {
        return sendError(res, 'Sipariş bulunamadı.', 404);
      }
      if (existingOrder.deliveryOtp && existingOrder.deliveryOtp !== otp) {
        return sendError(res, 'Hatalı teslimat kodu (OTP). Lütfen müşteriden doğru kodu isteyin.', 400);
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Notify the user about status update
    io.to(order.userId).emit('order_update', order);

    return sendSuccess(res, { order });
  } catch (error) {
    logger.error('orders.update_status_failed', { message: (error as Error).message, requestId: req.requestId });
    return sendError(res, 'Sipariş durumu güncellenemedi.');
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        user: { select: { email: true, firstName: true, lastName: true } },
        // Courier does not have email directly; we expose related user fields instead
        courier: { select: { user: { select: { email: true, firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    const normalized = orders.map((order: any) => ({
      ...order,
      price: order.totalPrice,
      courier: order.courier?.user
        ? {
            firstName: order.courier.user.firstName,
            lastName: order.courier.user.lastName,
            email: order.courier.user.email,
          }
        : null,
    }));
    return sendSuccess(res, { orders: normalized });
  } catch (error) {
    return sendError(res, 'Tüm siparişler getirilemedi.');
  }
};
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [totalOrders, totalUsers, totalCouriers, monthlyRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'COURIER' } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalPrice: true }
      })
    ]);

    return sendSuccess(res, {
      stats: {
        totalOrders,
        totalUsers,
        totalCouriers,
        monthlyRevenue: monthlyRevenue._sum.totalPrice || 0
      }
    });
  } catch (error) {
    return sendError(res, 'İstatistikler getirilemedi.');
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, { users });
  } catch (error) {
    return sendError(res, 'Kullanıcılar getirilemedi.');
  }
};

export const getCourierLocations = async (req: Request, res: Response) => {
  try {
    const couriers = await prisma.courier.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });
    return sendSuccess(res, { couriers });
  } catch (error) {
    return sendError(res, 'Kurye konumları getirilemedi.');
  }
};
