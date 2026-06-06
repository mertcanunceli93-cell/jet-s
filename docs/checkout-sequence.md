# Checkout Sequence and Idempotency

## Request Contract
- Header: `Authorization: Bearer <jwt>`
- Header: `Idempotency-Key: <uuid>`
- Body:
  - `quoteId` (required)
  - `pickupAddress`
  - `deliveryAddress`/`dropoffAddress`
  - `vehicleType`
  - `deliveryType`
  - `packageDetails` (optional)

## Sequence
1. API validates JWT, payload, and `Idempotency-Key`.
2. API checks if order already exists by idempotency key:
   - yes => return existing order (`replay=true`)
   - no => continue
3. API validates quote:
   - exists
   - not expired
   - not consumed
   - vehicle/delivery type match
4. Transaction:
   - create order row using quote snapshot
   - mark quote consumed
5. Emit realtime courier event and return order.

## Error Contracts
- `400` missing `quoteId` or `Idempotency-Key`
- `404` unknown quote
- `409` consumed/invalidated quote
- `410` expired quote
- `429` throttled request
