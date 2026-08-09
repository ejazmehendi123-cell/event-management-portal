# EventHub API Documentation

Base URL (local): `http://localhost:5000/api`

## Conventions

- All request/response bodies are JSON.
- Authenticated routes require an `Authorization: Bearer <token>` header. Get a token from `/auth/register` or `/auth/login`.
- Every response has a top-level `success` boolean.
- Error responses look like:
  ```json
  { "success": false, "message": "Human-readable error message" }
  ```
- Dates are ISO 8601 strings.

---

## Auth

### Register
`POST /auth/register`

| Body field        | Type   | Required | Notes                                              |
|--------------------|--------|----------|-----------------------------------------------------|
| name               | string | yes      |                                                       |
| email              | string | yes      | must be unique                                       |
| password           | string | yes      | min 6 characters                                     |
| adminInviteCode    | string | no       | if it matches `ADMIN_INVITE_CODE` on the server, the new account is created with role `admin` |

**201 response**
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "...", "email": "...", "role": "user" }
}
```

### Login
`POST /auth/login`

| Body field | Type   | Required |
|-------------|--------|----------|
| email       | string | yes      |
| password    | string | yes      |

**200 response:** same shape as register.

### Get current user
`GET /auth/me` — 🔒 requires auth

**200 response**
```json
{ "success": true, "user": { "id": "...", "name": "...", "email": "...", "role": "admin" } }
```

---

## Events

### List events
`GET /events`

Query params (all optional):

| Param     | Type   | Notes                                                        |
|-----------|--------|----------------------------------------------------------------|
| search    | string | full-text search across title, description, location          |
| category  | string | `Technology`, `Business`, `Music`, `Sports`, `Education`, `Arts`, `Other`, or `All` |
| status    | string | `upcoming`, `completed`, or `all` (default) — filters on event date vs. now |
| sort      | string | Mongoose sort string, default `date` (e.g. `-date` for newest first) |
| page      | number | default `1`                                                     |
| limit     | number | default `9`, max `50`                                           |

**200 response**
```json
{
  "success": true,
  "count": 9,
  "total": 24,
  "page": 1,
  "pages": 3,
  "events": [
    {
      "_id": "...",
      "title": "TechFusion Hackathon 2026",
      "description": "...",
      "category": "Technology",
      "date": "2026-08-23T00:00:00.000Z",
      "time": "09:00 AM",
      "location": "Innovation Hall",
      "capacity": 120,
      "registeredCount": 42,
      "seatsLeft": 78,
      "createdBy": { "_id": "...", "name": "Admin User", "email": "admin@eventhub.com" }
    }
  ]
}
```

### Get one event
`GET /events/:id`

**200 response:** `{ "success": true, "event": { ...same shape as above } }`
**404** if the event doesn't exist.

### Create event
`POST /events` — 🔒 admin only

| Body field   | Type   | Required |
|---------------|--------|----------|
| title         | string | yes      |
| description   | string | yes      |
| category      | string | no (defaults to `Other`) |
| date          | string (date) | yes |
| time          | string | yes      |
| location      | string | yes      |
| capacity      | number | yes (min 1) |
| imageUrl      | string | no       |

**201 response:** `{ "success": true, "event": { ... } }`

### Update event
`PUT /events/:id` — 🔒 admin only

Body: any subset of the fields above. **200 response:** `{ "success": true, "event": { ... } }`

### Delete event
`DELETE /events/:id` — 🔒 admin only

Also deletes all registrations tied to this event.

**200 response:** `{ "success": true, "message": "Event deleted successfully" }`

### Get an event's registrants
`GET /events/:id/registrations` — 🔒 admin only

Query params: `search` (optional) — filters attendees by name or email.

**200 response**
```json
{
  "success": true,
  "count": 42,
  "registrations": [
    { "_id": "...", "user": { "name": "...", "email": "..." }, "status": "confirmed", "createdAt": "..." }
  ]
}
```

### Export an event's registrants as CSV
`GET /events/:id/registrations/export` — 🔒 admin only

Streams a `text/csv` file (columns: Name, Email, Registered On, Status) as an attachment.

---

## Registrations

### Reserve a seat
`POST /registrations` — 🔒 requires auth

| Body field | Type   | Required |
|-------------|--------|----------|
| eventId     | string | yes      |

**201 response:** `{ "success": true, "registration": { "_id": "...", "user": "...", "event": { ... }, "status": "confirmed" } }`

**400** if already registered, or the event is at capacity.

### My registrations
`GET /registrations/my` — 🔒 requires auth

Query params: `status` — `upcoming`, `completed`, or `all` (default).

**200 response:** `{ "success": true, "count": 2, "registrations": [ { "_id": "...", "event": { ... }, "status": "confirmed", "isPast": false } ] }`

`isPast` is computed per-registration by comparing the event's date to now.

### Attendee dashboard stats
`GET /registrations/dashboard` — 🔒 requires auth

**200 response**
```json
{
  "success": true,
  "stats": {
    "totalRegistrations": 4,
    "upcomingCount": 3,
    "completedCount": 1,
    "favoritesCount": 2,
    "participationStreak": 3,
    "upcomingReminders": [
      { "_id": "...", "event": { "title": "...", "date": "...", "time": "...", "location": "..." } }
    ]
  }
}
```
`participationStreak` counts consecutive months (ending this month) in which the attendee registered for at least one event. `upcomingReminders` returns the next 5 upcoming registrations, soonest first, for countdown/reminder widgets.

### Download a ticket
`GET /registrations/:id/ticket` — 🔒 requires auth (owner or admin)

Streams a generated `application/pdf` ticket as an attachment — includes event name, date, time, location, attendee name, registration status, and a QR code encoding the ticket ID. **400** if the registration isn't `confirmed`; **403** if you request someone else's ticket and you're not an admin.

### Cancel a registration
`DELETE /registrations/:id` — 🔒 requires auth (owner or admin)

**200 response:** `{ "success": true, "message": "Registration cancelled" }`
**403** if you try to cancel someone else's registration and you're not an admin.

---

## Favorites

### List my favorites
`GET /favorites` — 🔒 requires auth

**200 response:** `{ "success": true, "count": 2, "favorites": [ { "_id": "...", "title": "...", ... } ] }` (full event objects)

### Toggle a favorite
`POST /favorites/:eventId` — 🔒 requires auth

Adds the event to favorites if not already favorited, or removes it if it is.

**200 response:** `{ "success": true, "favorited": true, "favorites": ["eventId1", "eventId2"] }`

---

## Admin

### Dashboard stats
`GET /admin/stats` — 🔒 admin only

**200 response**
```json
{
  "success": true,
  "stats": {
    "totalAttendees": 128,
    "totalEvents": 24,
    "totalRegistrations": 340,
    "upcomingEvents": 9,
    "completedEvents": 15,
    "eventsByCategory": [ { "_id": "Technology", "count": 8 }, { "_id": "Music", "count": 5 } ],
    "topEvents": [
      { "eventId": "...", "title": "TechFusion Hackathon 2026", "capacity": 120, "registrations": 96 }
    ],
    "registrationTrends": [
      { "date": "2026-07-27", "count": 3 },
      { "date": "2026-07-28", "count": 5 }
    ]
  }
}
```
`topEvents` lists the 5 events with the most confirmed registrations. `registrationTrends` is a continuous 14-day series (zero-filled) of confirmed-registration counts by day, for charting.

---

## Health check

`GET /health` (i.e. `http://localhost:5000/api/health`) — no auth required. Returns `{ "success": true, "message": "EventHub API is running", "time": "..." }`. Useful for confirming the backend is reachable before debugging the frontend.

---

## HTTP status codes used

| Code | Meaning                                             |
|------|-------------------------------------------------------|
| 200  | OK                                                      |
| 201  | Created                                                 |
| 400  | Bad request — validation error, duplicate email, event full, already registered, etc. |
| 401  | Not authenticated — missing/invalid/expired token       |
| 403  | Authenticated but not allowed (wrong role or not your resource) |
| 404  | Resource not found                                      |
| 500  | Unexpected server error                                 |
