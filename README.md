# FitZone Gym & Class Booking System

ITUE301: Advanced Web Development Frameworks — Open-Book Practical Exam (Set B)
React frontend · Express.js backend · MongoDB Atlas with Mongoose

## Quick Start

### Prerequisites
- Node.js 18+
- A MongoDB database (Atlas or local). Network Access must allow your IP.

### Backend (port 5000)
```bash
cd backend
npm install
cp .env.example .env        # then edit .env with your real MONGO_URI + JWT_SECRET
node seed.js                # optional: loads demo members + 5 trainers
npm start                   # runs node server.js
```

### Frontend (port 3003)
```bash
cd frontend
npm install
npm run dev                 # Vite dev server on http://localhost:3003
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so no CORS issues in development.

## Environment Variables

Create `backend/.env` (never commit it; `.env.example` shows the shape):

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/fitzone?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=<long random string>
NODE_ENV=development
```

## Demo accounts (created by seed.js)

| Role | Email | Password |
|------|-------|----------|
| Member | heet@fitzone.com | fitzone123 |
| Admin | admin@fitzone.com | admin12345 |

## API Overview

Base URL: `http://localhost:5000/api/v1` — full request/response examples in [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md).

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | /auth/login | public | Authenticate member, issue JWT |
| POST | /auth/register | public | Create member (schema validation demo) |
| GET | /auth/me | bearer | Current member from token |
| GET | /trainers | public | List all trainers |
| POST | /bookings | bearer | Create booking (201) |
| GET | /bookings/my | bearer | Logged-in member's bookings (.populate) |
| GET | /bookings | admin only | Full roster for admin panel |
| PATCH | /bookings/:id/status | bearer | Update booking status |

Status codes: 200 OK · 201 Created · 400 validation · 401 unauthenticated · 403 forbidden · 404 missing · 409 conflict/duplicate.

## Project Structure

```
├── backend/
│   ├── server.js              # entry point: env check, middleware order, routes
│   ├── seed.js                # demo data loader
│   ├── models/
│   │   ├── Member.js          # name/email/password/phone/membershipType/role
│   │   ├── Trainer.js         # name/specialization/available
│   │   └── ClassBooking.js    # refs -> Member & Trainer, className/date/timeSlot/status
│   ├── middleware/
│   │   ├── requestLogger.js   # [METHOD] [PATH] [STATUS] [TIME] on every request
│   │   ├── authGuard.js       # verifies Bearer JWT -> req.member (+adminGuard)
│   │   ├── cors.js            # CORS headers + OPTIONS preflight
│   │   └── errorHandler.js    # last middleware: structured JSON errors
│   ├── routes/
│   │   ├── auth.js            # login/register/me
│   │   ├── trainers.js        # public list
│   │   └── bookings.js        # create/my/admin-list/status-update
│   ├── utils/password.js      # scrypt hashing via Node crypto (no deps)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/TrainerCard.jsx     # props: name, specialization, available
│   │   ├── context/AuthContext.jsx        # { member, token, role, login, logout }
│   │   ├── pages/LoginPage.jsx
│   │   ├── pages/ClassesPage.jsx          # fetch + loading/error + client-side search
│   │   ├── pages/MyBookingsPage.jsx
│   │   ├── pages/AdminPanel.jsx           # React.lazy + Suspense
│   │   └── App.jsx                        # router + ProtectedRoute wrapper
│   └── vite.config.js                     # port 3003 + /api proxy
├── .env.example
└── POSTMAN_GUIDE.md                       # copy-paste API tests
```

## Key Implementation Notes

- **Auth**: passwords hashed with scrypt (`utils/password.js`), JWT signed with `JWT_SECRET`, expires 2h. Password hashes are `select: false` and stripped from JSON.
- **Protection**: `authGuard` on every route except `/auth/*` and `/trainers`; `adminGuard` additionally guards the admin roster.
- **requestLogger** uses `res.on('finish')` so it logs the FINAL status code and response time for every request.
- **Validation**: all three Mongoose schemas enforce required/enum/minlength; errors are caught by the global error handler and returned as readable JSON (400), never raw stack traces.
- **Booking integrity**: memberId always comes from the JWT (not the body); unavailable trainers are rejected (409); trainer+date+timeSlot clashes are rejected (409) — no double bookings.
- **Frontend**: protected routes redirect to `/`; ClassesPage keeps `trainers/loading/error` states and filters client-side without refetching; AdminPanel is lazy-loaded.

