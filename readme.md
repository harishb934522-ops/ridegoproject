# RideGo — Full-Stack MERN Ride-Hailing & Parcel Delivery Platform

> **Status**: Fully Integrated, Feature-Rich & Verified  
> **Frontend**: React 19 + Vite 8 + React Router v7 + Leaflet Maps + Bootstrap 5.3 (Preserved visual design & CSS, 0 lint warnings)  
> **Backend**: Node.js + Express 4.21 + Mongoose 8.8 + JWT Auth (All controllers, models, and routes integrated & tested)

---

## 1. Overview & Architecture

**RideGo** is an interactive urban mobility platform offering:
- 🏍️ **Bike Taxi** (Fast commuter transport — base ₹50)
- 🛺 **Auto Ride** (Affordable local travel — base ₹100)
- 📦 **Parcel Delivery** (Safe courier service — base ₹200)

### Key User Features & Capabilities
1. **Interactive Real-Time Map & Route Polyline**:
   - Leaflet + OpenStreetMap engine rendering animated route polylines, 📍 pickup and 🏁 destination pins, and live driver GPS animation.
2. **Smart Booking, Distance & Promo Code Engine**:
   - Distance (5.2 km), ETA (14 mins), and traffic condition indicators.
   - Interactive promo code validation (`RIDEGO50`, `FIRSTFREE`, `WEEKEND20`) with instant discount deductions, celebration confetti, and itemized bill breakdown.
   - Parcel delivery specifications (category selector, weight slider, recipient phone).
3. **In-Ride Safety & Communication Suite**:
   - 4-Digit Security Ride Start PIN / OTP.
   - Dual Persona Driver Simulator (allows testing driver-side OTP verification).
   - In-app rider-driver quick chat drawer with canned response pills.
   - Simulated driver phone dialer.
   - One-touch Emergency SOS alert broadcasting to emergency services (112, 108).
   - "Share My Trip" URL generator.
4. **Post-Ride Gamification, Tipping & Invoices**:
   - 5-Star driver rating with compliment badges (*Safe Driving*, *Polite Driver*, *Clean Vehicle*).
   - Driver tip chips (₹10, ₹20, ₹50).
   - "Scratch & Win" bonus card awarding 20 RideGo reward coins.
   - Viewable and printable Digital Tax Invoice & Receipt (`INV-2026-XXXX`).
5. **RideGo Virtual Wallet**:
   - 1-Click Pay with Wallet at checkout.
   - Balance top-up with presets (₹100, ₹250, ₹500, ₹1000).
   - Real-time balance and reward coins in Navbar and Dashboard.
6. **Admin Command Center**:
   - **Platform Metrics**: Total Users, Total Rides, Active Drivers, Platform Revenue, Driver Tips, Active SOS Alerts.
   - **Fleet Management**: Driver status toggle (Active / Busy / Offline), vehicle numbers, ratings, "+ Add Driver" form.
   - **Live Bookings & Dispatch**: Complete booking list with Start OTP, OTP verified status, SOS status, and status updater.
   - **Promo Codes & Coupons Manager**: View active promo codes, create new coupons dynamically, toggle active/inactive, delete coupons.
   - **Ratings & Reviews Feed**: Real-time feed of rider ratings, compliments, and driver tips.

---

## 2. Directory Structure

```
Ridego/
├── backend/
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection handler
│   ├── controllers/
│   │   ├── adminController.js   # Admin telemetry, driver fleet, booking dispatch, SOS resolve
│   │   ├── captainController.js # Driver profile, vehicle type lookup, auth
│   │   ├── couponController.js  # Promo code validation, creation, and toggle
│   │   ├── rideController.js    # Ride booking, OTP verification, SOS, chat, feedback
│   │   └── userController.js    # User auth & profile with populated ride history & coins
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token protection for Users, Captains & Admins
│   │   ├── errorMiddleware.js   # 404 and global error handler
│   │   └── verifyToken.js       # Authorization header token validator
│   ├── models/
│   │   ├── adminModel.js        # Admin credentials & schema
│   │   ├── captainModel.js      # Driver profile, status (Active/Busy/Offline), vehicle details
│   │   ├── couponModel.js       # Promo code schema (code, discountPercent, maxDiscount, isActive)
│   │   ├── rideModel.js         # Ride booking schema (User, Captain, Locations, Fare, OTP, SOS, Chat, Tip)
│   │   └── userModel.js         # User profile, wallet balance, coins, rideHistory
│   ├── routes/
│   │   ├── adminRoutes.js       # /api/admins endpoints
│   │   ├── captainRoutes.js     # /api/captains endpoints
│   │   ├── couponRoutes.js      # /api/coupons endpoints
│   │   ├── rideRoutes.js        # /api/rides endpoints
│   │   └── userRoutes.js        # /api/users endpoints
│   ├── utils/
│   │   └── generateToken.js     # 30-day JWT generator
│   ├── .env                     # Server environment variables
│   ├── .env.example             # Template with placeholders
│   ├── package.json             # Express, Mongoose, Bcrypt, JWT, CORS, Nodemon
│   ├── server.js                # Express app entry point
│   └── test-backend.js          # Automated backend integration test suite (8/8 tests pass)
│
├── frontend/
│   ├── public/images/           # Mirrored assets
│   ├── src/
│   │   ├── assets/              # auto.png, banner.png, bike.png, features.png, etc.
│   │   ├── components/
│   │   │   ├── LiveRideMap.jsx  # Interactive Leaflet OpenStreetMap route & driver engine
│   │   │   ├── Navbar.jsx       # Header with wallet balance, dark mode, auth
│   │   │   └── Footer.jsx       # Footer links and copyright
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # User & token authentication state
│   │   │   ├── ThemeContext.jsx # Dark/Light mode theme state
│   │   │   ├── WalletContext.jsx# Wallet balance & RideGo coins state
│   │   │   ├── useAuth.js       # useAuth() hook
│   │   │   ├── useTheme.js      # useTheme() hook
│   │   │   └── useWallet.js     # useWallet() hook
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing page with service selection
│   │   │   ├── Booking.jsx      # Route map preview, coupon engine, parcel mode, fare bill
│   │   │   ├── Payment.jsx      # 1-Click Wallet Pay, UPI, Card, Cash
│   │   │   ├── Tracking.jsx     # Live map, OTP PIN, driver chat, SOS, rating & tip modal
│   │   │   ├── Dashboard.jsx    # Real profile, wallet top-up, digital tax invoice receipt
│   │   │   ├── Admin.jsx        # Multi-tab Admin Command Center (Metrics, Fleet, Dispatch, Coupons, Reviews)
│   │   │   ├── Login.jsx        # User login
│   │   │   └── Signup.jsx       # User registration
│   │   ├── services/
│   │   │   └── api.js           # Centralized API client service
│   │   ├── utils/
│   │   │   └── audioCues.js     # Native Web Audio sound effects & confetti animation
│   │   ├── App.jsx              # React Router v7 routes & ScrollToTop
│   │   ├── main.jsx             # React DOM root
│   │   └── style.css            # Exact original CSS, animations, and dark mode
│   ├── index.html               # Head with Leaflet CSS, Google Fonts & Bootstrap CDN
│   ├── package.json             # React 19, Leaflet, Vite 8, React Router v7, Oxlint
│   └── vite.config.js           # Vite dev proxy configuration (/api -> :5000)
│
└── readme.md                    # Project documentation
```

---

## 3. How to Run the Application

### 1. Start MongoDB
Ensure MongoDB is running locally:
```bash
mongod
```

### 2. Run the Backend
```bash
cd backend
npm install
npm run dev
```
Backend starts on `http://localhost:5000`.

To run backend tests:
```bash
npm test
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React frontend starts on `http://localhost:5173`.

To verify frontend build and linting:
```bash
npm run lint
npm run build
```

---

## 4. Verification & Test Summary

- **Backend Automated Tests**:
  - `npm test` runs `test-backend.js`: **8/8 tests passed (100% success rate)**.
  - Verified JWT token generation, Bcrypt password hashing, User/Captain/Ride/Coupon schemas, Express router stack, and controller handlers.
- **Frontend Code Quality**:
  - `npm run lint` (`oxlint`): **0 warnings and 0 errors** across 25 files.
  - `npm run build` (`vite build`): compiled production bundle in **499ms** with all assets bundled.
- **Frontend Visual Design**:
  - **100% of existing CSS and visual styling preserved**. All enhancements seamlessly match the existing palette (`#ffc107` amber, `#121212` dark mode, clean card shadows, Poppins typography).
