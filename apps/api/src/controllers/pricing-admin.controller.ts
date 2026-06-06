import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  campaignSchema,
  couponSchema,
  pricingRuleSchema,
  settingSchema,
  surgeSchema,
  weatherSchema,
  zoneSchema,
} from '../validators/pricing.schemas';
import { redisDelByPattern } from '../lib/redis';
import { logger } from '../lib/logger';
import { sendSuccess, sendError } from '../lib/response';

const entityMap = {
  'pricing-rules': prisma.pricingRule,
  'surge-pricing': prisma.surgePricing,
  'weather-pricing': prisma.weatherPricing,
  zones: prisma.zone,
  coupons: prisma.coupon,
  campaigns: prisma.campaign,
} as const;

type EntityKey = keyof typeof entityMap;

function resolveEntity(entity: string) {
  return entityMap[entity as EntityKey];
}

function entitySchema(entity: EntityKey) {
  switch (entity) {
    case 'pricing-rules':
      return pricingRuleSchema;
    case 'surge-pricing':
      return surgeSchema;
    case 'weather-pricing':
      return weatherSchema;
    case 'zones':
      return zoneSchema;
    case 'coupons':
      return couponSchema;
    case 'campaigns':
      return campaignSchema;
    default:
      return null;
  }
}

async function invalidatePricingCache() {
  await Promise.all([
    redisDelByPattern('pricing-rule:*'),
    redisDelByPattern('settings:*'),
    redisDelByPattern('surge:*'),
    redisDelByPattern('weather:*'),
    redisDelByPattern('zones:*'),
  ]);
}

async function writeAudit(
  adminId: string,
  entity: string,
  action: string,
  beforeJson?: unknown,
  afterJson?: unknown,
  metadataJson?: unknown
) {
  await prisma.auditLog.create({
    data: {
      adminId,
      entity,
      action,
      beforeJson: beforeJson ? JSON.stringify(beforeJson) : null,
      afterJson: afterJson ? JSON.stringify(afterJson) : null,
      metadataJson: metadataJson ? JSON.stringify(metadataJson) : null,
      entityId: (afterJson as any)?.id || (beforeJson as any)?.id || null,
    },
  });
}

export const getPricingConfig = async (_req: Request, res: Response): Promise<Response> => {
  const [pricingRules, surgePricing, weatherPricing, zones, coupons, campaigns, settings] =
    await Promise.all([
      prisma.pricingRule.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.surgePricing.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.weatherPricing.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.zone.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.settings.findMany({ orderBy: { key: 'asc' } }),
    ]);

  return sendSuccess(res, {
    pricingRules,
    surgePricing,
    weatherPricing,
    zones,
    coupons,
    campaigns,
    settings,
  });
};

export const listEntity = async (req: Request, res: Response): Promise<Response> => {
  const delegate = resolveEntity(req.params.entity);
  if (!delegate) return sendError(res, 'Unsupported pricing entity.', 404);

  const items = await (delegate as any).findMany({ orderBy: { createdAt: 'desc' } });
  return sendSuccess(res, { items });
};

export const createEntity = async (req: Request, res: Response): Promise<Response> => {
  const key = req.params.entity as EntityKey;
  const delegate = resolveEntity(key);
  if (!delegate) return sendError(res, 'Unsupported pricing entity.', 404);
  const schema = entitySchema(key);
  if (!schema) return sendError(res, 'Unsupported entity schema.', 400);
  const data = schema.parse(req.body);

  const item = await (delegate as any).create({ data });
  await invalidatePricingCache();
  await writeAudit(req.user?.userId || 'unknown', key, 'CREATE', null, item, {
    requestId: req.requestId,
  });
  return sendSuccess(res, { item }, 201);
};

export const updateEntity = async (req: Request, res: Response): Promise<Response> => {
  const key = req.params.entity as EntityKey;
  const delegate = resolveEntity(key);
  if (!delegate) return sendError(res, 'Unsupported pricing entity.', 404);
  const schema = entitySchema(key);
  if (!schema) return sendError(res, 'Unsupported entity schema.', 400);
  const data = schema.partial().parse(req.body);
  const before = await (delegate as any).findUnique({ where: { id: req.params.id } });

  const item = await (delegate as any).update({
    where: { id: req.params.id },
    data,
  });
  await invalidatePricingCache();
  await writeAudit(req.user?.userId || 'unknown', key, 'UPDATE', before, item, {
    requestId: req.requestId,
  });

  return sendSuccess(res, { item });
};

export const deleteEntity = async (req: Request, res: Response): Promise<Response> => {
  const delegate = resolveEntity(req.params.entity);
  if (!delegate) return sendError(res, 'Unsupported pricing entity.', 404);

  const before = await (delegate as any).findUnique({ where: { id: req.params.id } });
  await (delegate as any).delete({ where: { id: req.params.id } });
  await invalidatePricingCache();
  await writeAudit(req.user?.userId || 'unknown', req.params.entity, 'DELETE', before, null, {
    requestId: req.requestId,
  });
  return sendSuccess(res, { deleted: true });
};

export const upsertSetting = async (req: Request, res: Response): Promise<Response> => {
  const { key } = req.params;
  const { value, description } = settingSchema.parse(req.body);
  const before = await prisma.settings.findUnique({ where: { key } });

  const setting = await prisma.settings.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });
  await invalidatePricingCache();
  await writeAudit(req.user?.userId || 'unknown', 'settings', 'UPSERT', before, setting, {
    requestId: req.requestId,
  });
  logger.info('pricing.setting_upserted', { key, requestId: req.requestId });

  return sendSuccess(res, { setting });
};

export const listAuditLogs = async (req: Request, res: Response): Promise<Response> => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const rawLogs = await prisma.auditLog.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
  const logs = rawLogs.map(log => ({
    ...log,
    beforeJson: log.beforeJson ? JSON.parse(log.beforeJson) : null,
    afterJson: log.afterJson ? JSON.parse(log.afterJson) : null,
    metadataJson: log.metadataJson ? JSON.parse(log.metadataJson) : null,
  }));
  return sendSuccess(res, { logs, page, limit });
};
