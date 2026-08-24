# FitZone Gym & Class Booking System - Project Overview

## Project Description
FitZone is a gym & class booking system that replaces WhatsApp-based booking with a proper web application. Members can reserve trainer-led classes, trainers can see their schedule, and admin can manage the roster.

## Tech Stack
- **Frontend**: React (create-react-app or Vite)
- **Backend**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Routing**: React Router DOM
- **State Management**: React Context API (useState/useContext)
- **Styling**: CSS modules or inline CSS (no heavy UI frameworks)

## Repository Structure
```
itue301-exam-[roll-number]-[batch]/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/            # Express.js application
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
├── .env.example
├── README.md
└── package.json (root, optional)
```

## Data Entities

### Member
- name: required, string
- email: required, unique, string
- phone: string
- membershipType: enum [basic, premium, platinum], default 'basic'

### Trainer
- name: required, string
- specialization: required, string
- available: Boolean, default true

### ClassBooking
- memberId: ref to Member
- trainerId: ref to Trainer
- className: required, string
- date: required, date
- timeSlot: required, string
- status: enum [booked, attended, cancelled], default 'booked'

## API Endpoints (Backend)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/v1/auth/login | Authenticate member, issue token |
| GET | /api/v1/trainers | Return all trainers (public) |
| POST | /api/v1/bookings | Create a new class booking (protected) |
| GET | /api/v1/bookings/my | Return logged-in member's bookings (protected) |
| PATCH | /api/v1/bookings/:id/status | Update booking status (protected) |

## Frontend Pages
1. **LoginPage** - Member login form
2. **ClassesPage** - Browse trainers, booking form
3. **MyBookingsPage** - Member's bookings list
4. **AdminPanel** - Lazy-loaded admin dashboard

## Key Features
- Client-side routing with protected routes (Classes, MyBookings)
- Global auth state via React Context
- TrainerCard reusable component with prop-driven rendering
- Lazy-loaded Admin Panel via React.lazy + Suspense
- API consumption with loading/error states
- Client-side search filtering
- MongoDB Mongoose schemas with validation
- Custom authGuard middleware
- Global requestLogger middleware
- Global error-handling middleware

## Submission Requirements
- Public GitHub repo: itue301-exam-[roll-number]-[batch]
- /frontend and /backend directories
- README.md with run instructions
- .env.example (no real credentials)
- PDF report: [RollNo]_SetB_Report.pdf with screenshots