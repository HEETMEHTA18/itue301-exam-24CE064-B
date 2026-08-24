# FitZone API — Postman Testing Guide

**Base URL:** `http://localhost:5000`

All request bodies use **Body → raw → JSON**. Set header `Content-Type: application/json` on every POST/PATCH.

Test in this exact order — later steps depend on tokens/ids from earlier steps.

---

## Demo accounts (created by seed)

| Role | Email | Password |
|------|-------|----------|
| Member | `heet@fitzone.com` | `fitzone123` |
| Admin | `admin@fitzone.com` | `admin12345` |

## Trainer IDs (current seed)

| Available | _id | Name |
|-----------|-----|------|
| YES | `6a8bf8af4bdb08b1430f213d` | Priya Patel (Yoga) |
| YES | `6a8bf8af4bdb08b1430f213c` | Rahul Shah (Weight Training) |
| YES | `6a8bf8af4bdb08b1430f213f` | Sneha Desai (CrossFit) |
| NO | `6a8bf8af4bdb08b1430f213e` | Amit Kumar (Cardio) |
| NO | `6a8bf8af4bdb08b1430f2140` | Vikram Singh (Yoga) |

> If IDs differ after reseeding, run **GET /api/v1/trainers** first and copy fresh ids from the response.

---

## 1. POST /api/v1/auth/login — Login

- **URL:** `http://localhost:5000/api/v1/auth/login`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{ "email": "heet@fitzone.com", "password": "fitzone123" }
```

**Success → 200**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "member": { "id": "...", "name": "Heet Mehta", "email": "heet@fitzone.com", "role": "member" }
}
```
Copy the `token` value — every protected request needs it.

### Error cases for this endpoint
| Body | Status | Response |
|------|--------|----------|
| `{"email":"heet@fitzone.com","password":"wrongpass1"}` | **401** | `{"message":"Invalid email or password"}` |
| `{"email":"heet@fitzone.com"}` (no password) | **400** | `{"message":"Email and password are required"}` |
| `{"email":"nobody@fitzone.com","password":"fitzone123"}` | **401** | `{"message":"Invalid email or password"}` |

---

## 2. GET /api/v1/trainers — Public trainer list

- **URL:** `http://localhost:5000/api/v1/trainers`
- **Method:** GET
- **Headers:** none required (public)

**Success → 200**
```json
{ "count": 5, "trainers": [ { "_id": "...", "name": "Priya Patel", "specialization": "Yoga", "available": true }, ... ] }
```

---

## 3. POST /api/v1/bookings — Create booking (protected)

- **URL:** `http://localhost:5000/api/v1/bookings`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <PASTE_TOKEN_FROM_STEP_1>`
- **Body:**
```json
{
  "trainerId": "6a8bf8af4bdb08b1430f213d",
  "className": "Evening Yoga Flow",
  "date": "2026-08-28",
  "timeSlot": "17:00-18:00"
}
```
> memberId is NOT sent — the backend takes it from the verified JWT.

**Success → 201** *(screenshot #2 for the report)*
```json
{
  "message": "Booking created",
  "booking": { "_id": "...", "memberId": "...", "trainerId": "...", "className": "Evening Yoga Flow", "date": "2026-08-28", "timeSlot": "17:00-18:00", "status": "booked" }
}
```
Copy the `booking._id` for Step 5.

### Error cases
| Setup | Body | Status | Response |
|-------|------|--------|----------|
| No Authorization header | valid body | **401** | `{"message":"Missing or invalid authorization header"}` |
| Garbage token: `Authorization: Bearer abc123` | valid body | **401** | `{"message":"Invalid or expired token"}` |
| Valid token, missing fields | `{}` | **400** | `{"message":"A valid trainerId is required"}` |
| Valid token, unavailable trainer (`...213e`) | valid body | **409** | `{"message":"Amit Kumar is fully booked"}` |
| Book same trainer+date+slot twice | same body again | **409** | `{"message":"That slot with Priya Patel is already booked"}` |
| Bad id format | `{"trainerId":"xyz"}` | **400** | `{"message":"A valid trainerId is required"}` |

---

## 4. GET /api/v1/bookings/my — My bookings (protected)

- **URL:** `http://localhost:5000/api/v1/bookings/my`
- **Method:** GET
- **Headers:** `Authorization: Bearer <TOKEN>`

**Success → 200** — note memberId/trainerId are POPULATED with name/email/specialization:
```json
{
  "count": 1,
  "bookings": [{
    "_id": "...",
    "memberId": { "_id": "...", "name": "Heet Mehta", "email": "heet@fitzone.com" },
    "trainerId": { "_id": "...", "name": "Priya Patel", "specialization": "Yoga" },
    "className": "Evening Yoga Flow", "date": "2026-08-28", "timeSlot": "17:00-18:00",
    "status": "booked"
  }]
}
```

Error case: no token → **401**

---

## 5. PATCH /api/v1/bookings/:id/status — Update status (protected)

- **URL:** `http://localhost:5000/api/v1/bookings/<BOOKING_ID>/status`
- **Method:** PATCH
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <TOKEN>`
- **Body:**
```json
{ "status": "attended" }
```

**Success → 200**
```json
{ "message": "Status updated", "booking": { ..., "status": "attended" } }
```

### Error cases
| Body / URL | Status | Response |
|------------|--------|----------|
| `{"status":"nope"}` | **400** | `{"message":"Status must be one of: booked, attended, cancelled"}` |
| `/api/v1/bookings/123/status` (bad id) | **400** | `{"message":"Invalid booking id"}` |
| `/api/v1/bookings/000000000000000000000000/status` | **404** | `{"message":"Booking not found"}` |
| Login as OTHER member (register one), try patching Heet's booking | **403** | `{"message":"You can only modify your own bookings"}` |

---

## 6. GET /api/v1/bookings — Admin roster (protected + admin)

- **URL:** `http://localhost:5000/api/v1/bookings`
- **Method:** GET
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>` ← login as `admin@fitzone.com` / `admin12345` first

**Success → 200** — all members' bookings.

Error case: use the MEMBER token instead of admin → **403** `{"message":"Admin access required"}`

---

## 7. POST /api/v1/auth/register — Register member (public, bonus)

- **URL:** `http://localhost:5000/api/v1/auth/register`
- **Method:** POST
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{ "name": "Demo User", "email": "demo@fitzone.com", "password": "demo12345", "phone": "9876500000", "membershipType": "premium" }
```
**Success → 201** with token immediately.

### Validation-failure demo (**Task 5 screenshot**)
```json
{ "name": "X", "email": "not-an-email", "password": "short", "membershipType": "gold" }
```
→ **400** with readable messages joined:
```json
{ "message": "Name must be at least 2 characters, Email must be a valid address, Password must be at least 8 characters, gold is not a valid membership type" }
```
Duplicate email retry → **409** `{"message":"An account with that email already exists"}`

---

## Quick reference table (put in report)

| Method | Endpoint | Auth | Success | Key error codes |
|--------|----------|------|---------|-----------------|
| POST | /api/v1/auth/login | public | 200 | 400, 401 |
| POST | /api/v1/auth/register | public | 201 | 400, 409 |
| GET | /api/v1/auth/me | bearer | 200 | 401 |
| GET | /api/v1/trainers | public | 200 | — |
| POST | /api/v1/bookings | bearer | 201 | 400, 401, 404, 409 |
| GET | /api/v1/bookings/my | bearer | 200 | 401 |
| GET | /api/v1/bookings | admin | 200 | 401, 403 |
| PATCH | /api/v1/bookings/:id/status | bearer | 200 | 400, 401, 403, 404 |

## Screenshots checklist for the report
1. **ClassesPage with trainer cards** — browser at http://localhost:3003/classes
2. **Postman 201 on booking creation** — Step 3 success response
3. **MongoDB saved document** — Atlas → Browse Collections → fitzone → classbookings
