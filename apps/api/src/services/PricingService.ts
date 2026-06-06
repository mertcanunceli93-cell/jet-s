import { Campaign, Coupon } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { cacheKeys } from '../lib/cache-keys';
import { logger } from '../lib/logger';
import { redisGetJson, redisSetJson } from '../lib/redis';
import { safeFetchJson } from '../lib/safe-fetch';

export interface PricingCalculationResult {
  basePrice: number;
  distancePrice: number;
  surgePrice: number;
  weatherPrice: number;
  nightPrice: number;
  zonePrice: number;
  taxPrice: number;
  commissionPrice: number;
  discountPrice: number;
  totalPrice: number;
  distanceKm: number;
  estimatedTime: number;
  appliedAdjustments: string[];
}

export class PricingService {
  private static GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  private static GOOGLE_MAPS_ENDPOINT =
    'https://maps.googleapis.com/maps/api/distancematrix/json';

  static async calculatePrice(
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number,
    vehicleType: string = 'MOTO',
    deliveryType: string = 'STANDARD',
    couponCode?: string,
    weatherCondition?: string
  ): Promise<PricingCalculationResult> {
    try {
      const startedAt = Date.now();
      const appliedAdjustments: string[] = [];
      const { distanceKm, durationMin } = await this.getDistanceAndTime(
        pickupLat,
        pickupLng,
        dropoffLat,
        dropoffLng
      );

      // 2. Get Pricing Rule
      const rule = await this.getPricingRule(vehicleType, deliveryType);

      const basePrice = rule.basePrice;
      const distancePrice = distanceKm * rule.perKmPrice;
      const timePrice = durationMin * rule.perMinPrice;
      let subtotal = basePrice + distancePrice + timePrice;

      const surgeMultiplier = await this.getActiveSurgeMultiplier();
      const surgePrice = subtotal * (surgeMultiplier - 1);
      if (surgePrice > 0) appliedAdjustments.push('SURGE');
      subtotal += surgePrice;

      const weatherMultiplier = await this.getActiveWeatherMultiplier(weatherCondition);
      const weatherPrice = subtotal * (weatherMultiplier - 1);
      if (weatherPrice > 0) appliedAdjustments.push('WEATHER');
      subtotal += weatherPrice;

      const nightMultiplier = await this.getNightMultiplier();
      const nightPrice = subtotal * (nightMultiplier - 1);
      if (nightPrice > 0) appliedAdjustments.push('NIGHT');
      subtotal += nightPrice;

      const zonePrice = await this.getZoneAdjustment(pickupLat, pickupLng, dropoffLat, dropoffLng);
      if (zonePrice !== 0) appliedAdjustments.push('ZONE');
      subtotal += zonePrice;

      const campaignDiscount = await this.calculateCampaignDiscount(subtotal);
      if (campaignDiscount > 0) appliedAdjustments.push('CAMPAIGN');

      const couponDiscount = couponCode
        ? await this.calculateCouponDiscount(couponCode, subtotal)
        : 0;
      if (couponDiscount > 0) appliedAdjustments.push('COUPON');

      const discountPrice = campaignDiscount + couponDiscount;
      const taxable = Math.max(0, subtotal - discountPrice);

      const taxRate = parseFloat(await this.getSetting('TAX_RATE', '0.18'));
      const commissionRate = parseFloat(await this.getSetting('COMMISSION_RATE', '0.20'));
      const taxPrice = taxable * taxRate;
      const commissionPrice = taxable * commissionRate;

      const totalPrice = Math.max(rule.minPrice, taxable + taxPrice);

      const result = {
        basePrice,
        distancePrice,
        surgePrice,
        weatherPrice,
        nightPrice,
        zonePrice,
        taxPrice,
        commissionPrice,
        discountPrice,
        totalPrice,
        distanceKm,
        estimatedTime: durationMin,
        appliedAdjustments,
      };
      logger.info('pricing.calculated', {
        vehicleType,
        deliveryType,
        durationMs: Date.now() - startedAt,
        totalPrice: result.totalPrice,
        appliedAdjustments,
      });
      return result;
    } catch (error) {
      logger.error('pricing.service_failure', { error: (error as Error).message });
      const fallbackRule = this.getFallbackRule(vehicleType);
      return {
        basePrice: fallbackRule.basePrice,
        distancePrice: 0,
        surgePrice: 0,
        weatherPrice: 0,
        nightPrice: 0,
        zonePrice: 0,
        taxPrice: fallbackRule.basePrice * 0.18,
        commissionPrice: fallbackRule.basePrice * 0.20,
        discountPrice: 0,
        totalPrice: fallbackRule.basePrice * 1.18,
        distanceKm: 0,
        estimatedTime: 0,
        appliedAdjustments: ['FALLBACK'],
      };
    }
  }

  static async asyncSafe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      return fallback;
    }
  }

  static async getPricingVersion(): Promise<string> {
    try {
      const [latestRule, latestSurge, latestWeather, latestZone, latestSetting] = await Promise.all([
        prisma.pricingRule.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        prisma.surgePricing.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        prisma.weatherPricing.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        }),
        prisma.zone.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      ]);
      const parts = [latestRule, latestSurge, latestWeather, latestZone, latestSetting]
        .map((it) => (it?.updatedAt ? it.updatedAt.getTime() : 0))
        .join('-');
      return `v_${parts}`;
    } catch (e) {
      return 'v_fallback';
    }
  }

  private static async getDistanceAndTime(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<{ distanceKm: number; durationMin: number }> {
    const cacheKey = cacheKeys.distance(lat1, lng1, lat2, lng2);
    const cached = await redisGetJson<{ distanceKm: number; durationMin: number }>(cacheKey);
    if (cached) {
      logger.info('cache.hit', { key: cacheKey });
      return cached;
    }
    logger.info('cache.miss', { key: cacheKey });

    if (!this.GOOGLE_MAPS_API_KEY) {
      // Mock for development if no key
      const distance = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111;
      const fallback = {
        distanceKm: parseFloat(distance.toFixed(2)),
        durationMin: Math.round(distance * 2), // 2 mins per km
      };
      await redisSetJson(cacheKey, fallback, 600);
      return fallback;
    }

    const params = new URLSearchParams({
      origins: `${lat1},${lng1}`,
      destinations: `${lat2},${lng2}`,
      key: this.GOOGLE_MAPS_API_KEY,
    });
    const data = await safeFetchJson<any>(`${this.GOOGLE_MAPS_ENDPOINT}?${params.toString()}`);

    if (data.status !== 'OK' || data.rows[0].elements[0].status !== 'OK') {
      throw new Error('Could not calculate distance via Google Maps');
    }

    const element = data.rows[0].elements[0];
    const result = {
      distanceKm: element.distance.value / 1000,
      durationMin: Math.ceil(element.duration.value / 60),
    };
    await redisSetJson(cacheKey, result, 600);
    return result;
  }

  private static async getActiveSurgeMultiplier(): Promise<number> {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay().toString();

    const cacheKey = cacheKeys.surgeActive(currentTime, currentDay);
    const cached = await redisGetJson<number>(cacheKey);
    if (cached) return cached;
    try {
      const surge = await prisma.surgePricing.findFirst({
        where: {
          isActive: true,
          OR: [
            {
              startTime: { lte: currentTime },
              endTime: { gte: currentTime },
            },
            {
              daysOfWeek: { contains: currentDay },
            },
          ],
        },
      });

      const multiplier = surge ? surge.multiplier : 1.0;
      await redisSetJson(cacheKey, multiplier, 60);
      return multiplier;
    } catch (error) {
      logger.warn('pricing.db_fallback', { service: 'surge', error: (error as Error).message });
      return 1.0;
    }
  }

  private static async getActiveWeatherMultiplier(condition?: string): Promise<number> {
    const cacheKey = cacheKeys.weatherActive(condition || 'ANY');
    const cached = await redisGetJson<number>(cacheKey);
    if (cached) return cached;
    try {
      const weather = await prisma.weatherPricing.findFirst({
        where: {
          isActive: true,
          ...(condition ? { condition } : {}),
        },
        orderBy: { multiplier: 'desc' },
      });

      const multiplier = weather ? weather.multiplier : 1.0;
      await redisSetJson(cacheKey, multiplier, 300);
      return multiplier;
    } catch (error) {
      logger.warn('pricing.db_fallback', { service: 'weather', error: (error as Error).message });
      return 1.0;
    }
  }

  private static async getNightMultiplier(): Promise<number> {
    const startHour = parseInt(await this.getSetting('NIGHT_START_HOUR', '22'), 10);
    const endHour = parseInt(await this.getSetting('NIGHT_END_HOUR', '6'), 10);
    const nightExtraPercent = parseFloat(await this.getSetting('NIGHT_SURCHARGE_PERCENT', '0.15'));
    const hour = new Date().getHours();
    const isNight = startHour > endHour
      ? hour >= startHour || hour < endHour
      : hour >= startHour && hour < endHour;

    return isNight ? 1 + nightExtraPercent : 1;
  }

  private static async getZoneAdjustment(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<number> {
    const cacheKey = cacheKeys.zonesActive();
    let zones: any[] = [];
    try {
      zones = (await redisGetJson<Array<{ polygonJson: string; priceAdjustment: number }>>(cacheKey))
        ?? (await prisma.zone.findMany({
          where: { isActive: true },
          select: { polygonJson: true, priceAdjustment: true },
        }));
      if (!(await redisGetJson(cacheKey)) && zones.length) {
        await redisSetJson(cacheKey, zones, 300);
      }
    } catch (e) {
      logger.warn('pricing.db_fallback', { service: 'zones' });
      return 0;
    }
    if (!zones.length) return 0;

    let adjustment = 0;
    for (const zone of zones) {
      const polygon = this.safeParsePolygon(zone.polygonJson);
      if (!polygon.length) continue;
      const pickupInside = this.isPointInsidePolygon([lat1, lng1], polygon);
      const dropoffInside = this.isPointInsidePolygon([lat2, lng2], polygon);
      if (pickupInside || dropoffInside) {
        adjustment += zone.priceAdjustment;
      }
    }

    return adjustment;
  }

  private static async calculateCouponDiscount(code: string, subtotal: number): Promise<number> {
    const coupon = await prisma.coupon.findFirst({
      where: { code, isActive: true },
    });

    if (!coupon) return 0;
    if (coupon.expiryDate && coupon.expiryDate < new Date()) return 0;
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return 0;

    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    return Math.min(discount, subtotal);
  }

  private static async calculateCampaignDiscount(subtotal: number): Promise<number> {
    const now = new Date();
    try {
      const campaign = await prisma.campaign.findFirst({
        where: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: { value: 'desc' },
      });

      if (!campaign) return 0;
      return this.resolveDiscount(campaign, subtotal);
    } catch (e) {
      return 0;
    }
  }

  private static resolveDiscount(discountable: Coupon | Campaign, subtotal: number): number {
    if (discountable.discountType === 'PERCENT') {
      return subtotal * (discountable.value / 100);
    }
    return Math.min(discountable.value, subtotal);
  }

  private static safeParsePolygon(raw: string): [number, number][] {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length === 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number'
        )
        .map((point) => [point[0], point[1]]) as [number, number][];
    } catch {
      return [];
    }
  }

  private static isPointInsidePolygon(
    point: [number, number],
    polygon: [number, number][]
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > point[1] !== yj > point[1] &&
        point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi + Number.EPSILON) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private static async getSetting(key: string, defaultValue: string): Promise<string> {
    const cacheKey = cacheKeys.settings(key);
    const cached = await redisGetJson<string>(cacheKey);
    if (cached) return cached;
    try {
      const setting = await prisma.settings.findUnique({ where: { key } });
      if (setting?.value) {
        await redisSetJson(cacheKey, setting.value, 300);
      }
      return setting ? setting.value : defaultValue;
    } catch (error) {
      logger.warn('pricing.db_fallback', { service: 'settings', key, error: (error as Error).message });
      return defaultValue;
    }
  }

  private static async getPricingRule(vehicleType: string, deliveryType: string) {
    const cacheKey = cacheKeys.pricingRules(vehicleType, deliveryType);
    const cached = await redisGetJson<{
      basePrice: number;
      perKmPrice: number;
      perMinPrice: number;
      minPrice: number;
    }>(cacheKey);
    if (cached) return cached;
    try {
      const rule = await prisma.pricingRule.findUnique({
        where: {
          vehicleType_deliveryType: {
            vehicleType,
            deliveryType,
          },
        },
        select: {
          basePrice: true,
          perKmPrice: true,
          perMinPrice: true,
          minPrice: true,
        },
      });
      if (rule) {
        await redisSetJson(cacheKey, rule, 300);
      }
      return rule || this.getFallbackRule(vehicleType);
    } catch (error) {
      logger.warn('pricing.db_fallback', { service: 'pricingRule', error: (error as Error).message });
      return this.getFallbackRule(vehicleType);
    }
  }

  private static getFallbackRule(vehicleType: string) {
    // Sensible defaults for development
    const defaults: Record<string, any> = {
      MOTO: { basePrice: 45, perKmPrice: 12, perMinPrice: 0.5, minPrice: 60 },
      CAR: { basePrice: 80, perKmPrice: 20, perMinPrice: 1.0, minPrice: 120 },
      EXPRESS_CAR: { basePrice: 120, perKmPrice: 30, perMinPrice: 1.5, minPrice: 180 },
      TAXI: { basePrice: 100, perKmPrice: 25, perMinPrice: 1.0, minPrice: 150 },
      PANELVAN: { basePrice: 300, perKmPrice: 40, perMinPrice: 2.0, minPrice: 400 },
    };
    return defaults[vehicleType] || defaults.MOTO;
  }
}
