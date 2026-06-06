# Quote Lifecycle

## Lifecycle States
1. Created
2. Active
3. Consumed
4. Expired

## Creation
- Endpoint: `POST /api/pricing/calculate`
- Response includes:
  - `quoteId`
  - `expiresAt`
  - `pricingVersion`
  - detailed price breakdown
- Quote is persisted in `Quote` table.

## Consumption Rules
- Checkout endpoint requires `quoteId`.
- Checkout rejects quote when:
  - missing
  - expired
  - already consumed
  - `vehicleType` mismatch
  - `deliveryType` mismatch

## Atomicity
- Order creation and quote consumption run in a single DB transaction.
- Duplicate client retries use `Idempotency-Key`; existing order is returned without double creation.

## Client Auto Refresh
- Dashboard checkout refreshes quote 60 seconds before expiry.
- Refresh is silent and preserves checkout form state.
