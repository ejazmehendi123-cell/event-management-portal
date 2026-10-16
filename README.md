# EventHub — Event Management Portal

A full-stack event management portal where an **admin** creates and manages events, and **attendees** browse events, reserve a seat, and manage their tickets.

Built with the **MERN** stack:

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT authentication
- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios

---

## 1. Features

**Attendee portal**
- Register / log in (JWT-based auth)
- Browse events with search (title/description/location), category filters, and an Upcoming / Completed / All toggle — paginated
- View full event details, including a live seats-remaining count
- Reserve a seat in one click; cancel an existing registration
- **My tickets:** view all registrations, filtered by Upcoming / Completed / All
- **Event ticket generation:** a styled in-app ticket preview plus a downloadable PDF ticket (server-generated with `pdfkit`) showing event name, date, time, location, attendee name, registration status, and a scannable QR code
- **Favorite events:** heart any event from its card or detail page to save it for quick access
- **Attendee dashboard** (bonus): participation streak (consecutive months with at least one registration), registration totals, a live countdown to your next event, upcoming-event reminders, and your favorited events

**Admin portal**
- Create, edit, and delete events
- View the attendee list for any event, with live search by name/email
- **Export attendees to CSV** for any event
- **Admin dashboard** (bonus): total/upcoming/completed events, confirmed registrations, registered attendees, a 14‑day registration trend line chart (Recharts), events-by-category breakdown, and a "most popular events" leaderboard by registration count

**Engineering**
- JWT auth with role-based access control (`user` / `admin`) enforced on the backend, not just hidden in the UI
- Centralized error handling middleware with consistent JSON error responses
- Registration capacity is enforced server-side (can't overbook an event); registering for a past event is also blocked server-side, not just in the UI
- A user can cancel and re-register for the same event (soft-deleted registration, not a duplicate)
- PDF tickets are generated on-demand server-side and streamed as a download — no client-side PDF library needed
- Seed script populates a rich demo dataset: multiple attendees, upcoming **and** completed events, a pre-built 3‑month streak, favorites, and 14 days of registration history for the trend chart

---

## 2. Project structure

```
eventhub/
├── backend/                 Express + MongoDB API
│   ├── config/db.js         Mongo connection
│   ├── models/               User (w/ favorites), Event, Registration schemas
│   ├── middleware/           auth (JWT + role guard), central error handler
│   ├── controllers/          route handlers (auth, events, registrations, favorites, admin)
│   ├── routes/                route definitions
│   ├── utils/                 JWT signing, PDF ticket generator (pdfkit + qrcode), DB seed script
│   ├── server.js              app entry point
│   └── .env.example
├── frontend/                 React (Vite) SPA
│   └── src/
│       ├── api/axios.js       pre-configured axios instance (attaches JWT)
│       ├── context/           AuthContext, FavoritesContext
│       ├── components/        Navbar, EventCard, FavoriteButton, Countdown,
│       │                       TicketModal, ProtectedRoute, Loader
│       └── pages/              Home, EventDetail, Login, Register,
│                                MyRegistrations, Dashboard, admin/*
├── README.md                  you are here
└── API_DOCUMENTATION.md       full API reference
```

---

## 3. Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

Don't have MongoDB installed locally? The fastest option is a free Atlas cluster — create one, click "Connect → Drivers", and copy the connection string into `MONGO_URI` in step 4 below.

---

## 4. Running it locally

### Step 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eventhub      # or your Atlas connection string
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Load some demo data (recommended for a first run):

```bash
npm run seed
```

This creates:

| Role         | Email                | Password  | Notes                                              |
|--------------|-----------------------|-----------|------------------------------------------------------|
| Admin        | admin@eventhub.com    | admin123  |                                                        |
| Attendee     | user@eventhub.com     | user1234  | Pre-loaded with a 3-month streak, favorites, and a completed ticket |
| Attendee     | priya@eventhub.com    | user1234  | Padding data for admin analytics                      |
| Attendee     | diego@eventhub.com    | user1234  | Padding data for admin analytics                      |

...plus 6 upcoming + 3 completed events across different categories, and 14 days of registration history so the admin trend chart isn't empty on first login.

Start the API:

```bash
npm run dev      # with auto-restart (nodemon)
# or
npm start
```

The API runs at **http://localhost:5000** — visit `http://localhost:5000/api/health` to confirm it's up.

### Step 2 — Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` already points to `http://localhost:5000/api` by default — leave it unless your backend runs elsewhere.

```bash
npm run dev
```

Visit **http://localhost:5173**.

### Step 3 — Try it out

1. Sign in with the seeded admin (`admin@eventhub.com` / `admin123`) → go to **Admin dashboard** → **Manage events** to create/edit events, or check attendee lists.
2. Sign in with the seeded attendee (`user@eventhub.com` / `user1234`), or register a new account, browse events on the home page, and reserve a seat.
3. Check **My tickets** to see and cancel your reservation.

To create your **own** admin account instead of using the seeded one: on the register page, expand "Registering as an organizer?" and enter the admin invite code. By default this is unset, so set `ADMIN_INVITE_CODE=your_secret_code` in `backend/.env` first, then use the code when registering.

---

## 5. Building for production

**Frontend:**
```bash
cd frontend
npm run build      # outputs static files to frontend/dist
npm run preview    # optional: preview the production build locally
```
Deploy the contents of `frontend/dist` to any static host (Vercel, Netlify, GitHub Pages, etc.), and set `VITE_API_URL` to your deployed backend's URL before building.

**Backend:**
Deploy `backend/` to any Node host (Render, Railway, Fly.io, an EC2 box, etc.). Set the same environment variables from `.env.example` in your host's dashboard, pointing `MONGO_URI` at your production database and `CLIENT_URL` at your deployed frontend's URL (for CORS).

---

## 6. API documentation

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for the full endpoint reference (request/response shapes, auth requirements, error format).

---

## 7. Notes on design choices

- **Why Event Management Portal over Recruitment Assessment Portal:** it exercises the full range of what the brief asks for — auth, role-based access, CRUD, a public browsing/search experience, and a private "my stuff" view — without needing an ambiguous scoring engine that the brief didn't specify rules for.
- **Registrations are their own collection**, not just a field on `Event`, so capacity checks, per-user history, and the admin attendee list are all simple queries rather than array manipulation on the event document.
- **Role elevation to admin** happens via an optional invite code at registration rather than a hardcoded seed-only account, so the flow is demoable end-to-end without directly editing the database.
