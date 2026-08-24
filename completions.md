# FitZone Gym & Class Booking System - Task Completions

## Task 1: React Component Architecture ✅
- [x] Created LoginPage component with auth form
- [x] Created ClassesPage component with trainer search and booking form
- [x] Created MyBookingsPage component displaying member's bookings
- [x] Created TrainerCard component accepting props: name, specialization, available
- [x] TrainerCard displays all three values with availability styling
  - available=true → "Available" (green class)
  - available=false → "Fully Booked" (red class)
- [x] Placed reusable components in /components folder
- [x] Global auth state via React.useState/useContext
- [x] Express backend with 5+ REST endpoints at /api/v1/
- [x] Custom authGuard middleware on protected routes
- [x] Global requestLogger applied to every request
- [x] MongoDB collections with Mongoose schemas
- [x] Schema-level validation (required, enum, min) on all three models
- [x] Lazy-loaded Admin Panel using React.lazy + Suspense
- [x] API calls using fetch with loading state
- [x] MongoDB connection via .env connection string

## Task 2: React Routing and State Management ✅
- [x] Configured React Router with routes:
  - / → LoginPage
  - /classes → ClassesPage (protected)
  - /my-bookings → MyBookingsPage (protected)
  - /admin → AdminPanel (lazy-loaded)
- [x] Navigation component with React Router <Link> (no full-page reload)
- [x] useState managing form data in ClassesPage
  - Two meaningful state values: selected trainer, selected time slot
- [x] Displayed selected trainer value as state changes
- [x] AuthContext holding { member, token, role } with login() and logout()
- [x] ProtectedRoute wrapper redirects unauthenticated users to /

## Task 3: Express REST API + Middleware ✅
- [x] POST /api/v1/auth/login - Authenticate member, issue token
- [x] GET /api/v1/trainers - Return all trainers (public)
- [x] POST /api/v1/bookings - Create new class booking (protected)
- [x] GET /api/v1/bookings/my - Return logged-in member's bookings (protected)
- [x] PATCH /api/v1/bookings/:id/status - Update booking status (protected)
- [x] Custom requestLogger middleware logging [METHOD] [PATH] [STATUS] [RESPONSE-TIME ms]
- [x] Using res.on('finish') to capture final status code
- [x] authGuard middleware validates Bearer token, attaches req.member
- [x] Applied to all routes except /auth/login and /api/v1/trainers
- [x] Global error-handling middleware returning structured JSON
- [x] HTTP status codes: 200 (GET), 201 (POST), 400 (validation), 401 (auth), 500 (server)
- [x] APIs tested with Postman/Thunder Client

## Task 4: REST API Consumption in React ✅
- [x] ClassesPage fetches trainers via GET /api/v1/trainers
- [x] useEffect() triggers API request on component mount
- [x] Three states maintained: trainers, loading, error
- [x] Display loading message/indicator while request in progress
- [x] Display error message if request fails
- [x] Display trainer data via TrainerCard after successful request
- [x] Displayed: trainer name, specialization, availability
- [x] Trainer data from API response, not hardcoded
- [x] Client-side search input filtering trainers by specialization
- [x] No new API request on search; uses .filter() on existing array

## Task 5: MongoDB + Mongoose Schema Design ✅
- [x] Member schema:
  - name: required
  - email: required, unique
  - membershipType: enum [basic, premium, platinum], default 'basic'
- [x] Trainer schema:
  - name: required
  - specialization: required
  - available: Boolean, default true
- [x] ClassBooking schema:
  - memberId: ref to Member
  - trainerId: ref to Trainer
  - date: required
  - timeSlot: required
  - status: enum [booked, attended, cancelled], default 'booked'
- [x] POST /api/v1/bookings validates request body, saves to MongoDB, returns 201
- [x] GET /api/v1/bookings/my uses .populate('memberId', 'name email') and .populate('trainerId', 'name specialization')
- [x] MongoDB connected via .env connection string
- [x] Validation failure demonstrated with meaningful JSON error response
- [x] catch err.name === 'ValidationError' mapped to plain messages

## Submission Requirements ✅
- [x] Public GitHub repo: itue301-exam-[roll-number]-[batch]
- [x] /frontend and /backend directories present
- [x] README.md with project name, run instructions, MongoDB setup
- [x] .env.example committed (no real credentials)
- [x] PDF report: [RollNo]_SetB_Report.pdf with screenshots
  - (1) ClassesPage with trainer cards
  - (2) Postman showing 201 on booking creation
  - (3) MongoDB showing a saved document
- [x] Final submission both required:
  ① GitHub repository link + final commit SHA
  ② [RollNo]_SetB_Report.pdf uploaded