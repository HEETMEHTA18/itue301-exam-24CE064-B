# FitZone Gym & Class Booking System - Product Requirements Document

## 1. Project Vision
Build a comprehensive gym booking system that eliminates WhatsApp double-bookings and no-shows, enabling members to reserve trainer-led classes with proper scheduling, notifications, and roster management.

## 2. Target Audience
- **Members**: Book classes, view their booking history
- **Trainers**: View their scheduled classes
- **Admin**: Manage roster, user management, system oversight

## 3. Functional Requirements

### FR-1: User Authentication
- Members can login with email/password
- JWT token issued upon successful login
- Protected routes redirect unauthenticated users to /login
- Logout clears token and context state

### FR-2: Member Management
- Register/profile with: name, email, phone, membershipType (basic|premium|platinum)
- Default membershipType: basic

### FR-3: Trainer Management
- List all trainers (public endpoint)
- Trainer details: name, specialization, availability status

### FR-4: Class Booking
- Members can book classes with:
  - Selected trainer
  - Class name
  - Date
  - Time slot
- Booking status: booked → attended → cancelled
- Each member can have multiple bookings

### FR-5: Admin Panel
- Manage trainer roster
- View all bookings
- Update booking statuses

## 4. Non-Functional Requirements

### NF-1: Performance
- API responses under 2 seconds
- Initial page load under 3 seconds

### NF-2: Security
- Bearer token authentication on protected routes
- Input validation on all API endpoints
- Meaningful error messages (no raw Mongoose errors)
-also the security like the IDOR and other 

### NF-3: Reliability
- MongoDB connection with proper error handling
- Graceful shutdown
- Validation errors returned as JSON with status 400

### NF-4: Usability
- Loading states on all API calls
- Error messages displayed to user
- Search/filter functionality without re-API calls

## 5. Tech Stack Specifications

### Frontend
- React 18+ with functional components
- React Router DOM v6 for routing
- Context API for global auth state
- fetch() or Axios for API calls
- React.lazy + Suspense for lazy loading

### Backend
- Node.js with Express.js
- Mongoose for MongoDB ODM
- JWT for authentication
- bcrypt for password hashing (if passwords stored)
- dotenv for environment variables

### Database
- MongoDB collections: members, trainers, class_bookings
- Mongoose schemas with validation
- References between ClassBooking and Member/Trainer

## 6. UI/UX Requirements

### Pages
1. **Login Page**: Simple form with email and password, submit button
2. **Classes Page**: 
   - Search/filter by trainer specialization
   - Trainer cards displayed grid/list
   - Booking form with trainer selection
   - Loading and error states
3. **My Bookings Page**:
   - List of member's bookings
   - Booking details (trainer, class, date, time, status)
   - Status visualization

### Components
- **TrainerCard**: Accepts props name, specialization, available
  - available=true → displays "Available" (green)
  - available=false → displays "Fully Booked" (red)
- **Navigation**: Links to all routes using React Router <Link>

## 7. Success Metrics
- All 5 API endpoints functional with correct status codes
- All 3 protected routes require authentication
- TrainerCard correctly renders all 3 prop values
- Search filtering works client-side without new API calls
- MongoDB schemas validate correctly (required, enum, min)
- Login/logout works end-to-end
- Booking creation returns 201 with saved document