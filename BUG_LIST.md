# CasusApp Strict Test Assertions - Bug List

**Generated:** 28 February 2026  
**Test Run Status:** 6 test suites failed, 2 passed | 24 failing tests, 49 passing tests (73 total)  
**Purpose:** Document failing endpoints exposed by strict assertion refactoring

---

## Executive Summary

Refactoring permissive test assertions (`expect([200, 500]).toContain()`) to strict assertions (`expect(status).toBe(200)`) revealed **24 critical bugs** across 6 endpoint categories:

- **Input Validation (7 failures):** Endpoints returning 500 instead of 400 for invalid inputs
- **Resource Not Found (6 failures):** Endpoints returning 500 instead of 404 for missing resources
- **Auth Failures (4 failures):** Token/auth handling returning 500 instead of 401
- **Happy Path (5 failures):** Core functionality returning 500 unexpectedly
- **Data Issues (2 failures):** Response format problems

---

## Critical Issues by Endpoint

### 🔴 CRITICAL: Global 500 Error Pattern

**Root Cause:** Unhandled errors in controllers/services returning raw 500s instead of proper HTTP status codes.

**Affected Endpoints:** 16 out of 24 failures

---

## Detailed Bug List

### 1. **POST /auth/login** (Auth Integration)

| Aspect | Details |
|--------|---------|
| **Test Name** | `Invalid credentials return 401` |
| **Expected Status** | `401` |
| **Actual Status** | `500` |
| **Input** | `email: john@example.com`, `password: WrongPassword123!` |
| **Issue** | Password validation failure not caught, throws unhandled error |
| **Severity** | 🔴 **CRITICAL** - Auth endpoint exposing errors |
| **Reproduction** | `POST /api/v1/auth/login` with wrong password |
| **Root Cause** | Likely missing `try-catch` in auth controller or unhandled bcrypt comparison error |

---

### 2. **POST /bookings** (E2E Flow)

| Aspect | Details |
|--------|---------|
| **Test Name** | `Create booking with invalid activity returns 404` |
| **Expected Status** | `404` |
| **Actual Status** | `500` |
| **Payload** | `activityId: 00000000-0000-0000-0000-000000000000`, valid availability & participant |
| **Issue** | Foreign key constraint or activity lookup not validated, throws DB error |
| **Severity** | 🔴 **CRITICAL** - Core booking endpoint broken |
| **Reproduction** | POST `/api/v1/bookings` with non-existent `activityId` |
| **Root Cause** | Missing activity existence check before booking creation |

---

### 3. **GET /calendar/activities** (Calendar Feature)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /calendar/activities with valid date range returns 200 and data` |
| **Expected Status** | `200` |
| **Actual Status** | `500` |
| **Query Params** | `startDate=2026-01-01&endDate=2026-12-31&city=Paris` |
| **Issue** | Date range query or city filtering causing unhandled error |
| **Severity** | 🔴 **CRITICAL** - New calendar feature non-functional |
| **Reproduction** | `GET /api/v1/calendar/activities?startDate=2026-01-01&endDate=2026-12-31` |
| **Root Cause** | Likely missing date validation or database query error in calendar service |

---

### 4. **GET /calendar/:activityId/slots** (Calendar Feature)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /calendar/:activityId/slots with invalid activity UUID returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Param** | `activityId: invalid-uuid` |
| **Issue** | UUID validation missing, invalid format not caught |
| **Severity** | 🔴 **CRITICAL** - Input validation layer broken |
| **Reproduction** | `GET /api/v1/calendar/invalid-uuid/slots?startDate=2026-01-01&endDate=2026-12-31` |
| **Root Cause** | Missing UUID format validation middleware or schema validation |

### 5. **GET /calendar/:activityId/slots** (Calendar Feature - Non-existent)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /calendar/:activityId/slots with non-ext activity returns 404` |
| **Expected Status** | `404` |
| **Actual Status** | `500` |
| **Param** | `activityId: 00000000-0000-0000-0000-000000000000` (valid UUID, doesn't exist) |
| **Issue** | Activity lookup not handled gracefully |
| **Severity** | 🔴 **CRITICAL** - Should return 404, not 500 |
| **Reproduction** | `GET /api/v1/calendar/00000000-0000-0000-0000-000000000000/slots` |
| **Root Cause** | Missing ? (optional) check or error handling on database query |

---

### 6. **POST /guide/availability/bulk** (Calendar / Guide Feature)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /guide/availability/bulk without auth returns 401` |
| **Expected Status** | `401` |
| **Actual Status** | `500` |
| **Payload** | `{}` (empty) |
| **Issue** | Auth middleware not intercepting before controller throws error |
| **Severity** | 🔴 **CRITICAL** - Auth bypass / error exposure |
| **Reproduction** | `POST /api/v1/guide/availability/bulk` without Authorization header |
| **Root Cause** | Auth-guard middleware might not be applied to this route or error handling is wrong |

---

### 7. **POST /guide/availability/bulk** (Calendar - Validation)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /guide/availability/bulk with guide auth and empty body returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Auth** | Valid guide token |
| **Payload** | `{}` |
| **Issue** | Request body validation (Zod schema) not catching missing required fields |
| **Severity** | 🔴 **CRITICAL** - Input validation broken |
| **Reproduction** | `POST /api/v1/guide/availability/bulk` with empty body and valid guide token |
| **Root Cause** | Missing schema validation or unhandled validation error |

---

### 8. **GET /activities/:id** (Activities)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /activities/:id with invalid UUID returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Param** | `id: invalid-uuid` |
| **Issue** | UUID validation not applied |
| **Severity** | 🔴 **CRITICAL** - Parameter validation missing |
| **Reproduction** | `GET /api/v1/activities/invalid-uuid` |
| **Root Cause** | Likely missing runtime UUID validation or schema validation on path params |

---

### 9. **POST /payments/stripe-webhook** (Payments)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /payments/stripe-webhook with invalid event type returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Payload** | `{ type: 'test.event' }` |
| **Issue** | Stripe event validation not catching invalid type |
| **Severity** | 🔴 **CRITICAL** - Webhook security issue |
| **Reproduction** | `POST /api/v1/payments/stripe-webhook` with `{ type: 'test.event' }` |
| **Root Cause** | Missing event type validation or error is thrown before validation |

---

### 10. **POST /payments/stripe-webhook** (Payments - Empty)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /payments/stripe-webhook with empty body returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Payload** | `{}` |
| **Issue** | Required fields in request body not validated |
| **Severity** | 🔴 **CRITICAL** - Request validation broken |
| **Reproduction** | `POST /api/v1/payments/stripe-webhook` with empty body |
| **Root Cause** | Missing Zod schema validation or validation error not caught |

---

### 11. **GET /payments/booking/:id** (Payments - Invalid UUID)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /payments/booking/:id with invalid UUID returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Param** | `id: invalid-uuid` |
| **Issue** | UUID format validation missing from path params |
| **Severity** | 🔴 **CRITICAL** - Input validation layer need fix |
| **Reproduction** | `GET /api/v1/payments/booking/invalid-uuid` |
| **Root Cause** | Missing UUID validation middleware or schema checking |

---

### 12. **GET /payments/booking/:id** (Payments - Not Found)

| Aspect | Details |
|--------|---------|
| **Test Name** | `GET /payments/booking/:id with non-existent booking returns 404` |
| **Expected Status** | `404` |
| **Actual Status** | `500` |
| **Param** | `id: 00000000-0000-0000-0000-000000000000` |
| **Issue** | Missing booking lookup returns error instead of 404 |
| **Severity** | 🔴 **CRITICAL** - Resource lookup error handling broken |
| **Reproduction** | `GET /api/v1/payments/booking/00000000-0000-0000-0000-000000000000` |
| **Root Cause** | Database query error not handled | Missing null check after query |

---

### 13. **POST /bookings** (Bookings - Zero Participants)

| Aspect | Details |
|--------|---------|
| **Test Name** | `Create booking with zero participants returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Payload** | `(...valid activityId/availabilityId..., participants: 0)` |
| **Issue** | Input validation for participants count missing or unhandled |
| **Severity** | 🔴 **CRITICAL** - Business logic validation broken |
| **Reproduction** | `POST /api/v1/bookings` with `participants: 0` |
| **Root Cause** | Missing validation for `participants > 0` or validation error not caught |

---

### 14. **GET /bookings** (Bookings - Authorized)

| Aspect | Details |
|--------|---------|
| **Test Name** | `Get bookings with token returns 200 and array` |
| **Expected Status** | `200` |
| **Actual Status** | `500` |
| **Auth** | Valid tourist token |
| **Issue** | Database query or serialization error |
| **Severity** | 🔴 **CRITICAL** - Core user endpoint broken |
| **Reproduction** | `GET /api/v1/bookings` with valid Authorization header |
| **Root Cause** | Unhandled error in booking query service or response mapping |

---

### 15. **GET /search/metadata** (Search)

| Aspect | Details |
|--------|---------|
| **Test Name** | `metadata priceRange .max should be a number` |
| **Expected Status** | OK (200) |
| **Actual Issue** | `typeof metadata.priceRange?.max` returns something other than `"number"` |
| **Problem** | Price range max value is not a number (string? null? undefined?) |
| **Severity** | 🟠 **HIGH** - Data format issue |
| **Reproduction** | `GET /api/v1/search/metadata` |
| **Root Cause** | Price calculation or database schema issue - max price stored/returned as string |

---

### 16. **POST /search/filters** (Search - Validation)

| Aspect | Details |
|--------|---------|
| **Test Name** | `validates priceMin ≤ priceMax` / `validates difficulty enum` |
| **Expected Status** | `400` with validation error |
| **Actual Status** | Unknown (test failing on assertion) |
| **Issue** | Validation not properly rejecting invalid filters |
| **Severity** | 🟠 **HIGH** - Input validation incomplete |
| **Reproduction** | `POST /api/v1/search/filters` with `{ priceMin: 250, priceMax: 20 }` or `{ difficulty: 'invalid' }` |
| **Root Cause** | Zod schema might not include range validation or enum check |

---

### 17. **POST /favorites** (Favorites - Duplicate)

| Aspect | Details |
|--------|---------|
| **Test Name** | `Favorites add duplicate activity returns 409` |
| **Expected Status** | `409 Conflict` |
| **Actual Status** | `500` or other error |
| **Payload** | `{ activityId: <already-favorited-activity> }` |
| **Issue** | Duplicate favorite creation not handled with proper 409 conflict response |
| **Severity** | 🔴 **CRITICAL** - Business logic error |
| **Reproduction** | `POST /api/v1/favorites/{activityId}` twice with same token |
| **Root Cause** | Missing unique constraint check or constraint violation not caught/handled |

---

### 18. **POST /reviews** (Reviews - Unauth)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /reviews without auth returns 401` |
| **Expected Status** | `401` |
| **Actual Status** | `500` |
| **Payload** | Valid review data |
| **Auth** | None |
| **Issue** | Auth middleware error or improper guard |
| **Severity** | 🔴 **CRITICAL** - Auth protection broken |
| **Reproduction** | `POST /api/v1/reviews` without Authorization header |
| **Root Cause** | Auth middleware not applied or error thrown before proper 401 response |

---

### 19. **POST /reviews** (Reviews - Invalid Booking)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /reviews with invalid booking returns 404` |
| **Expected Status** | `404` |
| **Actual Status** | `500` |
| **Payload** | `{ bookingId: 00000000-0000-0000-0000-000000000000, rating: 5, comment: "..." }` |
| **Auth** | Valid tourist token |
| **Issue** | Booking lookup error returns 500 instead of 404 |
| **Severity** | 🔴 **CRITICAL** - Resource lookup error handling |
| **Reproduction** | `POST /api/v1/reviews` with non-existent bookingId |
| **Root Cause** | Missing null check or error handling on booking query |

---

### 20. **POST /reviews** (Reviews - Invalid Rating)

| Aspect | Details |
|--------|---------|
| **Test Name** | `POST /reviews with invalid rating returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Payload** | `{ ..., rating: 10, ... }` (out of range) |
| **Auth** | Valid token |
| **Issue** | Rating validation (must be 1-5) not enforced |
| **Severity** | 🔴 **CRITICAL** - Input validation missing |
| **Reproduction** | `POST /api/v1/reviews` with `rating > 5` or `rating < 1` |
| **Root Cause** | Zod schema missing `min(1).max(5)` constraint or not properly applied |

---

### 21. **DELETE /reviews/:id** (Reviews - Unauth)

| Aspect | Details |
|--------|---------|
| **Test Name** | `DELETE /reviews/:id without auth returns 401` |
| **Expected Status** | `401` |
| **Actual Status** | `500` |
| **Param** | `id: any-valid-uuid` |
| **Auth** | None |
| **Issue** | Auth middleware failure or error thrown |
| **Severity** | 🔴 **CRITICAL** - Auth protection broken |
| **Reproduction** | `DELETE /api/v1/reviews/{id}` without Authorization header |
| **Root Cause** | Auth middleware not applied or error in guard |

---

### 22. **DELETE /reviews/:id** (Reviews - Invalid UUID)

| Aspect | Details |
|--------|---------|
| **Test Name** | `DELETE /reviews/:id with invalid UUID returns 400` |
| **Expected Status** | `400` |
| **Actual Status** | `500` |
| **Param** | `id: invalid-id` |
| **Auth** | Valid token |
| **Issue** | UUID validation missing or throwing error |
| **Severity** | 🔴 **CRITICAL** - Parameter validation broken |
| **Reproduction** | `DELETE /api/v1/reviews/invalid-id` with valid token |
| **Root Cause** | Missing UUID validation middleware |

---

### 23. **DELETE /reviews/:id** (Reviews - Resource Not Found)

| Aspect | Details |
|--------|---------|
| **Test Name** | `DELETE /reviews/:id with non-existent review returns 404` |
| **Expected Status** | `404` |
| **Actual Status** | `500` |
| **Param** | `id: 00000000-0000-0000-0000-000000000000` |
| **Auth** | Valid token |
| **Issue** | Review lookup error returns 500 instead of 404 |
| **Severity** | 🔴 **CRITICAL** - Error handling inconsistent |
| **Reproduction** | `DELETE /api/v1/reviews/{non-existent-id}` with valid token |
| **Root Cause** | Missing null check or error handler on review lookup |

---

## Error Pattern Analysis

### Pattern 1: Missing UUID Validation (5 failures)

**Affected Endpoints:**
- `GET /activities/:id` with invalid UUID → 500 (expect 400)
- `GET /calendar/:activityId/slots` with invalid UUID → 500 (expect 400)
- `GET /payments/booking/:id` with invalid UUID → 500 (expect 400)
- `DELETE /reviews/:id` with invalid UUID → 500 (expect 400)

**Root Cause:** No UUID format validation in path parameters. Either:
1. Missing middleware that validates UUIDs before controller
2. Validating inside controller but errors not caught
3. No Zod schema on path parameters

**Solution:** Add UUID validation middleware or Zod schema validation on all UUID path params:
```typescript
z.object({ id: z.string().uuid() })
```

---

### Pattern 2: Missing Resource Not Found Handling (6 failures)

**Affected Endpoints:**
- `GET /calendar/:activityId/slots` with valid but non-existent ID → 500 (expect 404)
- `GET /payments/booking/:id` with non-existent ID → 500 (expect 404)
- `POST /reviews` with invalid bookingId → 500 (expect 404)
- `DELETE /reviews/:id` with non-existent ID → 500 (expect 404)
- `POST /bookings` with invalid activityId → 500 (expect 404)

**Root Cause:** No null/undefined check after database queries

**Solution:** Add guard clauses:
```typescript
const booking = await db.query.bookings.findFirst(...);
if (!booking) return res.status(404).json({ error: 'Booking not found' });
```

---

### Pattern 3: Input Validation Not Catching Errors (5 failures)

**Affected Endpoints:**
- `POST /reviews` with invalid rating (>5) → 500 (expect 400)
- `POST /bookings` with zero participants → 500 (expect 400)
- `POST /payments/stripe-webhook` with invalid type → 500 (expect 400)
- `POST /guide/availability/bulk` with empty body → 500 (expect 400)
- `POST /search/filters` with invalid filters → Unknown (expect 400)

**Root Cause:** Zod schema validation missing constraints or errors not properly caught

**Solution:** Ensure all endpoints have Zod schema validation:
```typescript
const schema = z.object({
  rating: z.number().min(1).max(5),
  participants: z.number().min(1),
  // etc.
});
const validated = schema.parse(req.body); // in try-catch
```

---

### Pattern 4: Auth Errors Returning 500 (4 failures)

**Affected Endpoints:**
- `POST /auth/login` with wrong password → 500 (expect 401)
- `POST /guide/availability/bulk` without auth → 500 (expect 401)
- `POST /reviews` without auth → 500 (expect 401)
- `DELETE /reviews/:id` without auth → 500 (expect 401)

**Root Cause:** Auth middleware errors or unhandled exceptions in password comparison/token validation

**Solution:** Wrap auth logic in proper error handlers:
```typescript
const isValid = await bcrypt.compare(password, hash).catch(() =>  false);
if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
```

---

### Pattern 5: Data Format Issues (1 failure)

**Affected Endpoint:**
- `GET /search/metadata` returning `priceRange.max` not as number

**Root Cause:** Database schema or calculation returning string instead of number

**Solution:** Ensure casting in response:
```typescript
priceRange: {
  max: Number(dbResult.maxPrice),  // Cast to number
}
```

---

## Priority Fix Order

### 🔴 Phase 1 - IMMEDIATE (Can cause security issues)

1. **Auth Failures** - 4 bugs
   - Fix password comparison error handling
   - Fix auth middleware application
   - Fix token validation error handling
   - **Impact:** Auth endpoints must return 401, not 500
   - **Time:** 1-2 hours

2. **UUID Validation** - 5 bugs
   - Add UUID validation middleware or Zod schema
   - **Impact:** Prevents database errors from invalid IDs
   - **Time:** 30 minutes

### 🟠 Phase 2 - HIGH PRIORITY (Core functionality broken)

3. **Resource Lookups** - 6 bugs
   - Add null checks after queries
   - Return proper 404 responses
   - **Impact:** Multiple endpoints failing on valid IDs
   - **Time:** 1 hour

4. **Input Validation** - 5 bugs
   - Add Zod schemas to all endpoints
   - Ensure validation errors return 400
   - **Impact:** Prevents bad data in database
   - **Time:** 2-3 hours

### 🟡 Phase 3 - Medium Priority

5. **Data Format Issues** - 1 bug
   - Fix price range casting
   - **Time:** 15 minutes

6. **Business Logic** - 3 bugs (Bookings constraints, Duplicate favorites, etc.)
   - Add constraint checks and proper error responses
   - **Time:** 1-2 hours

---

## Testing Recommendations

After fixes, verify with:

```bash
npm test -- --testNamePattern="returns 401|returns 400|returns 404" --verbose
```

Ensure all 24 currently failing tests pass before merging.

---

## Files to Modify

- [ ] `src/middlewares/auth.ts` - Auth error handling
- [ ] `src/middlewares/role.middleware.ts` - Guard clause refactoring
- [ ] `src/controllers/authController.ts` - Password comparison error handling
- [ ] `src/controllers/bookingController.ts` - Resource check & validation
- [ ] `src/controllers/paymentController.ts` - Webhook validation & lookup errors
- [ ] `src/controllers/reviewController.ts` - Auth, validation, resource checks
- [ ] `src/controllers/activitiesController.ts` - UUID validation
- [ ] `src/modules/calendar/calendar.controller.ts` - UUID validation, date handling
- [ ] `src/types/index.ts` - Add/update Zod schemas with proper validation

---

**Last Updated:** 28 February 2026  
**Next Action:** Begin Phase 1 fixes (Auth handling, UUID validation)  
**Tracking:** See [roadmap](roadmap) for implementation progress
