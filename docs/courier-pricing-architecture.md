# Courier Pricing Engine Architecture

## Stack
- Node.js + Express API (`apps/api`)
- PostgreSQL + Prisma models (`apps/api/prisma/schema.prisma`)
- React admin dashboard (`apps/web`)

## Core Pricing Flow
1. Request comes to `POST /api/pricing/calculate`.
2. Coordinates are validated (or geocoded from addresses).
3. `PricingService.calculatePrice()` computes:
   - base + per-km + per-minute
   - surge multiplier
   - weather multiplier
   - night multiplier (from settings)
   - zone adjustments (polygon-based)
   - campaign + coupon discounts
   - tax + commission
4. Response returns full breakdown and applied adjustments for auditability.

## Rule Management
Admin APIs under `/api/pricing/admin/*` support runtime updates for:
- pricing rules (vehicle + delivery type)
- surge pricing windows
- weather pricing
- zone pricing (polygon JSON)
- coupons
- campaigns
- key-value settings (tax, commission, night windows)

## Production Hardening Checklist
- Add Redis cache for map distance and active config snapshots.
- Add optimistic locking/version columns for rule edits.
- Add audit logs for all admin pricing changes.
- Add role-separated admin permissions (PricingAdmin vs SuperAdmin).
- Add background weather sync worker to update `weatherPricing`.
- Add idempotency keys for order creation.
- Add quote IDs with TTL to lock prices at checkout.
- Add monitoring for price drift and failed calculations.
