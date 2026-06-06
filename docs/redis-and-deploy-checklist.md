# Redis Strategy and Deployment Checklist

## Redis Strategy
- Production target: managed Redis with auth/TLS.
- Fallback mode: if Redis unavailable, system continues with DB-only behavior.
- Cached domains:
  - distance lookups
  - active pricing rules
  - settings
  - surge/weather/zones
- Cache invalidation occurs on pricing-admin write operations.

## Environment Variables
- `REDIS_URL`
- `REDIS_PASSWORD` (optional)
- `REDIS_TLS=true|false`
- `CORS_ORIGINS=comma,separated,origins`
- `JWT_SECRET`
- `RATE_LIMIT_PRICING_WINDOW_SEC`
- `RATE_LIMIT_PRICING_MAX`
- `RATE_LIMIT_AUTH_WINDOW_SEC`
- `RATE_LIMIT_AUTH_MAX`
- `QUOTE_TTL_MINUTES`

## Deployment Checklist
- Apply Prisma migration for new fields/models:
  - `Order.idempotencyKey`
  - `Quote.pricingVersion`
  - `AuditLog`
  - new indexes
- Rotate and secure all secrets (JWT, DB, Redis).
- Configure managed Redis network ACLs and TLS.
- Set CORS allowlist for web origins.
- Enable centralized log collection for JSON logs.
- Run:
  - `apps/api`: `npm run db:generate && npm run build`
  - `apps/web`: `npm run build`
- Perform smoke tests:
  - quote create and checkout
  - idempotent replay
  - quote expiry behavior
  - rate limit behavior
