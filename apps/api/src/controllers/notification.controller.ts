import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20', type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (type) where.type = String(type);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await prisma.notification.count({ where: { isRead: false } });
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, data: { notification } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (err) {
    next(err);
  }
}
