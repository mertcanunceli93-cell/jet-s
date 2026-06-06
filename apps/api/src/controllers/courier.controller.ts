import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getAllCouriers(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, status } = req.query;
    const where: any = {};

    if (status === 'online') where.isOnline = true;
    if (status === 'offline') where.isOnline = false;

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: String(search) } },
          { lastName: { contains: String(search) } },
          { email: { contains: String(search) } },
        ],
      };
    }

    const couriers = await prisma.courier.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
        assignedOrders: {
          select: { id: true, status: true, totalPrice: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const couriersWithStats = couriers.map((c) => {
      const delivered = c.assignedOrders.filter((o) => o.status === 'DELIVERED');
      return {
        ...c,
        stats: {
          totalDeliveries: delivered.length,
          totalRevenue: delivered.reduce((sum, o) => sum + o.totalPrice, 0),
          activeOrders: c.assignedOrders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length,
        },
      };
    });

    res.json({ success: true, data: { couriers: couriersWithStats } });
  } catch (err) {
    next(err);
  }
}

export async function getCourierById(req: Request, res: Response, next: NextFunction) {
  try {
    const courier = await prisma.courier.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, createdAt: true } },
        assignedOrders: {
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!courier) return res.status(404).json({ success: false, error: 'Courier not found' });

    const delivered = courier.assignedOrders.filter((o) => o.status === 'DELIVERED');
    const data = {
      ...courier,
      stats: {
        totalDeliveries: delivered.length,
        totalRevenue: delivered.reduce((sum, o) => sum + o.totalPrice, 0),
        activeOrders: courier.assignedOrders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length,
        avgDeliveryPrice: delivered.length > 0 ? delivered.reduce((sum, o) => sum + o.totalPrice, 0) / delivered.length : 0,
      },
    };

    res.json({ success: true, data: { courier: data } });
  } catch (err) {
    next(err);
  }
}

export async function updateCourier(req: Request, res: Response, next: NextFunction) {
  try {
    const { vehicleType, plateNumber } = req.body;
    const courier = await prisma.courier.update({
      where: { id: req.params.id },
      data: { ...(vehicleType && { vehicleType }), ...(plateNumber && { plateNumber }) },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ success: true, data: { courier } });
  } catch (err) {
    next(err);
  }
}

export async function toggleCourierStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const courier = await prisma.courier.findUnique({ where: { id: req.params.id } });
    if (!courier) return res.status(404).json({ success: false, error: 'Courier not found' });

    const updated = await prisma.courier.update({
      where: { id: req.params.id },
      data: { isOnline: !courier.isOnline },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    res.json({ success: true, data: { courier: updated } });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const courier = await prisma.courier.findUnique({ where: { userId } });
    if (!courier) return res.status(404).json({ success: false, error: 'Courier not found' });

    const totalDeliveries = await prisma.order.count({
      where: { courierId: courier.id, status: 'DELIVERED' }
    });

    const earnings = await prisma.order.aggregate({
      where: { courierId: courier.id, status: 'DELIVERED' },
      _sum: {
        basePrice: true,
        distancePrice: true,
        surgePrice: true,
        weatherPrice: true,
      }
    });

    const totalEarnings = (earnings._sum.basePrice || 0) + 
                          (earnings._sum.distancePrice || 0) + 
                          (earnings._sum.surgePrice || 0) + 
                          (earnings._sum.weatherPrice || 0);

    res.json({
      success: true,
      data: {
        totalEarnings,
        totalDeliveries,
        rating: 4.8,
        level: 'Uzman',
        onlineTime: 42
      }
    });
  } catch (err) {
    next(err);
  }
}
