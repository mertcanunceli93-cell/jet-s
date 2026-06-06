import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function getAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '30', entity, action, adminId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (entity) where.entity = String(entity);
    if (action) where.action = String(action);
    if (adminId) where.adminId = String(adminId);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
      },
    });
  } catch (err) {
    next(err);
  }
}
