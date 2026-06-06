import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const { period = '7d' } = req.query;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      default:    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    }

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: startDate }, status: 'DELIVERED' },
      select: { totalPrice: true, commissionPrice: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const dailyRevenue: Record<string, { revenue: number; commission: number; count: number }> = {};
    orders.forEach((o) => {
      const day = o.createdAt.toISOString().slice(0, 10);
      if (!dailyRevenue[day]) dailyRevenue[day] = { revenue: 0, commission: 0, count: 0 };
      dailyRevenue[day].revenue += o.totalPrice;
      dailyRevenue[day].commission += o.commissionPrice;
      dailyRevenue[day].count += 1;
    });

    const chartData = Object.entries(dailyRevenue).map(([date, data]) => ({
      date,
      revenue: Math.round(data.revenue * 100) / 100,
      commission: Math.round(data.commission * 100) / 100,
      orders: data.count,
    }));

    const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
    const totalCommission = orders.reduce((s, o) => s + o.commissionPrice, 0);

    res.json({
      success: true,
      data: {
        chartData,
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalCommission: Math.round(totalCommission * 100) / 100,
          totalOrders: orders.length,
          avgOrderValue: orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const allOrders = await prisma.order.findMany({
      select: { status: true, vehicleType: true, deliveryType: true, totalPrice: true, createdAt: true },
    });

    const statusBreakdown: Record<string, number> = {};
    const vehicleBreakdown: Record<string, number> = {};
    const deliveryTypeBreakdown: Record<string, number> = {};

    allOrders.forEach((o) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
      vehicleBreakdown[o.vehicleType] = (vehicleBreakdown[o.vehicleType] || 0) + 1;
      deliveryTypeBreakdown[o.deliveryType] = (deliveryTypeBreakdown[o.deliveryType] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: allOrders.length,
        statusBreakdown: Object.entries(statusBreakdown).map(([name, value]) => ({ name, value })),
        vehicleBreakdown: Object.entries(vehicleBreakdown).map(([name, value]) => ({ name, value })),
        deliveryTypeBreakdown: Object.entries(deliveryTypeBreakdown).map(([name, value]) => ({ name, value })),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCourierPerformance(req: Request, res: Response, next: NextFunction) {
  try {
    const couriers = await prisma.courier.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
        assignedOrders: { select: { status: true, totalPrice: true } },
      },
    });

    const performance = couriers.map((c) => {
      const delivered = c.assignedOrders.filter((o) => o.status === 'DELIVERED');
      const cancelled = c.assignedOrders.filter((o) => o.status === 'CANCELLED');
      return {
        id: c.id,
        name: `${c.user.firstName} ${c.user.lastName}`,
        vehicleType: c.vehicleType,
        isOnline: c.isOnline,
        totalDeliveries: delivered.length,
        totalRevenue: Math.round(delivered.reduce((s, o) => s + o.totalPrice, 0) * 100) / 100,
        cancelledOrders: cancelled.length,
        successRate: c.assignedOrders.length > 0
          ? Math.round((delivered.length / c.assignedOrders.length) * 100)
          : 0,
      };
    }).sort((a, b) => b.totalDeliveries - a.totalDeliveries);

    res.json({ success: true, data: { couriers: performance } });
  } catch (err) {
    next(err);
  }
}

export async function getTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentOrders, previousOrders, totalUsers, totalCouriers] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: last7Days } }, select: { totalPrice: true, status: true } }),
      prisma.order.findMany({ where: { createdAt: { gte: prev7Days, lt: last7Days } }, select: { totalPrice: true, status: true } }),
      prisma.user.count(),
      prisma.courier.count(),
    ]);

    const currentRevenue = currentOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalPrice, 0);
    const previousRevenue = previousOrders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalPrice, 0);

    const revenueChange = previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0;
    const orderChange = previousOrders.length > 0 ? Math.round(((currentOrders.length - previousOrders.length) / previousOrders.length) * 100) : 0;

    res.json({
      success: true,
      data: {
        trends: {
          revenue: { current: Math.round(currentRevenue), previous: Math.round(previousRevenue), change: revenueChange },
          orders: { current: currentOrders.length, previous: previousOrders.length, change: orderChange },
          users: totalUsers,
          couriers: totalCouriers,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
