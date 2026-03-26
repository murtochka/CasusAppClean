# CasusApp Backend API Documentation

## Overview
CasusApp is a tour guide booking platform backend API built with Express.js, TypeScript, PostgreSQL, and Drizzle ORM.

**Base URL:** `http://localhost:3000`  
**API Version:** v1  
**Port:** 3000

---

## Quick Start

### Start the Server
```bash
cd my-api-project
npm start
```

### Health Check
```bash
curl http://localhost:3000/health
# Response: {"status":"ok","timestamp":"2026-02-27T15:58:09.821Z"}
```

---

## Authentication

### Register User
**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "role": "tourist"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "8a0ba357-919e-4bab-916d-c745f41993c6",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "tourist"
  }
}
```

### Login
**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** Same as register

### Get Current User
**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user": {
    "id": "8a0ba357-919e-4bab-916d-c745f41993c6",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "tourist",
    "phone": null,
    "avatarUrl": null,
    "isVerified": false,
    "createdAt": "2026-02-27T17:58:09.821Z"
  }
}
```

---

## Activities

### Get All Categories
**Endpoint:** `GET /api/v1/categories`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Hiking",
    "icon": "🥾"
  }
]
```

### Get Activity by ID
**Endpoint:** `GET /api/v1/activities/:id`

**Response:**
```json
{
  "id": "uuid",
  "title": "Mountain Hiking",
  "description": "A scenic mountain hike...",
  "price": "45.00",
  "maxParticipants": 8,
  "durationMinutes": 120,
  "difficulty": "medium",
  "city": "Zurich",
  "country": "Switzerland"
}
```

### Search Activities
**Endpoint:** `GET /api/v1/activities/search?city=Zurich&difficulty=medium`

**Query Parameters:**
- `city` (optional): Filter by city
- `difficulty` (optional): easy, medium, hard
- `categoryId` (optional): Filter by category UUID

---

## Guides

### Get Guide Profile
**Endpoint:** `GET /api/v1/guides/:guideId`

**Response:**
```json
{
  "userId": "uuid",
  "businessName": "Mountain Guides Inc",
  "description": "Professional mountain guides...",
  "licenseNumber": "LIC123456",
  "sustainabilityCertified": true,
  "rating": "4.8",
  "activities": [...]
}
```

### Create Guide Profile (Guide Only)
**Endpoint:** `POST /api/v1/guides/profile`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "businessName": "Mountain Guides Inc",
  "description": "Professional mountain guides",
  "licenseNumber": "LIC123456",
  "baseLocation": "Zurich, Switzerland"
}
```

---

## Bookings

### Get Bookings
**Endpoint:** `GET /api/v1/bookings`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
- `status` (optional): pending, confirmed, cancelled

### Create Booking
**Endpoint:** `POST /api/v1/bookings`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "activityId": "uuid",
  "availabilityId": "uuid",
  "participants": 2
}
```

---

## Payments

### Create Payment Intent
**Endpoint:** `POST /api/v1/payments/create-intent`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

---

## Reviews

### Create Review
**Endpoint:** `POST /api/v1/reviews`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Great experience!"
}
```

### Get Reviews for Activity
**Endpoint:** `GET /api/v1/reviews/activity/:activityId`

---

## Favorites

### Add to Favorites
**Endpoint:** `POST /api/v1/favorites`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "activityId": "uuid"
}
```

### Get My Favorites
**Endpoint:** `GET /api/v1/favorites`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Database Commands

### Push Schema Changes
```bash
cd my-api-project
npm run db:push
```

### Generate Migrations
```bash
npm run db:generate
```

### Drizzle Studio (Visual DB Editor)
```bash
npm run db:studio
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Descriptive error message"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (e.g., duplicate email)
- `500`: Internal Server Error

---

## Environment Variables

See [.env](my-api-project/.env) file:

```env
DATABASE_URL=postgresql://marting@localhost:5432/casusapp
JWT_SECRET=your-secret-key
PORT=3000
STRIPE_SECRET_KEY=sk_test_...
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"Test123!","fullName":"Test","role":"tourist"}'
```

### Get Categories
```bash
curl http://localhost:3000/api/v1/categories
```

### Protected Route (needs token)
```bash
curl http://localhost:3000/api/v1/auth/me \
  -H 'Authorization: Bearer <YOUR_JWT_TOKEN>'
```

---

## Database Schema

**Tables:**
- `users` - User accounts
- `guide_profiles` - Guide-specific information
- `activities` - Tour/activity listings
- `activity_availability` - Time slots
- `bookings` - User bookings
- `payments` - Payment records
- `reviews` - User reviews
- `activity_categories` - Activity types
- `favorites` - Favorite activities

See [db/schema.ts](../db/schema.ts) for full schema details.
