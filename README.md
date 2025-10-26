# Relay 

## Features Implemented

### 1. **User Management** 
**Tables Used:** `user_account`, `vehicle`
- User registration and login pages
- Profile management
- Vehicle registration with details (license plate, model, battery health, connector type)
- Vehicle dashboard showing all registered vehicles

### 2. **Station Discovery & Search**
**Tables Used:** `charging_station`, `charging_port`
- Station listing with real-time availability
- Filter by connector type (Type 2, CCS, CHAdeMO, Type 1)
- Filter by availability status
- Display port status (Available/In-Use/Maintenance)
- Station ratings from reviews
- Detailed station view with contact information

### 3. **Charging Session Management**
**Tables Used:** `charging_session`, `charging_port`
**Triggers Used:** `before_session_end` (auto-calculates duration & cost)
- Start new charging sessions
- Real-time active session monitoring
- Auto-refresh every 30 seconds
- End session functionality
- Session history with detailed breakdowns
- Automatic port status updates via triggers
- Duration and cost calculation via database triggers

### 4. **Payment System**
**Tables Used:** `payment`, `charging_session`
- Payment history tracking
- Payment statistics (Total, Pending, Completed)
- Multiple payment methods support
- Invoice download capability
- Payment status management
- Detailed session-to-payment mapping

### 5. **Reviews & Ratings**
**Tables Used:** `review`, `charging_station`
- Submit reviews for charging stations
- 5-star rating system
- View all reviews with station details
- User attribution and timestamps
- Average rating calculation for stations

### 6. **Port Status Tracking**
**Tables Used:** `charging_port`, `port_status_log`
**Triggers Used:** `after_port_status_update` (logs all status changes)
- Real-time port availability monitoring
- Automatic status logging via triggers
- Port history tracking
- Status indicators (Available/In-Use/Maintenance)

### 7. **Analytics Dashboard**
**Tables Used:** `charging_session`, `payment`, `review`
**DB Functions Used:** 
- `calculateusertotalspending(user_id_input)` - Returns total user spending
- User spending analytics
- Session statistics (total, monthly, average cost)
- Energy consumption tracking
- Favorite stations analysis
- Vehicle-wise usage breakdown
- 6-month charging history chart
- Monthly summary metrics

### 8. **Maintenance Module** (Admin)
**Tables Used:** `maintenance_log`, `charging_port`
- Log maintenance issues
- Track repair status (Pending/In Progress/Fixed)
- Technician assignment
- Maintenance history
- Port downtime management
- Issue tracking with timestamps

### 9. **Admin Features**
**Tables Used:** All tables
**DB Functions Used:**
- `getstationrevenue(station_id_input, start_date, end_date)` - Returns station revenue
- Comprehensive admin dashboard
- Station management (CRUD operations)
- Port management and monitoring
- Revenue analytics per station using DB function
- User statistics
- System-wide metrics
- Maintenance oversight
- Multiple dashboard tabs (Overview, Stations, Maintenance, Revenue)

### 10. **Notifications System**
**Tables Used:** `charging_session`, `payment`, `maintenance_log`
- Session completion alerts (ready for implementation)
- Payment confirmations
- Port availability updates
- Maintenance schedules
- Real-time status updates

## Project Structure

```
Relay/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard
│   ├── analytics/
│   │   └── page.tsx              # Analytics dashboard
│   ├── api/
│   │   ├── admin/
│   │   │   └── dashboard/
│   │   │       └── route.ts      # Admin API
│   │   ├── analytics/
│   │   │   └── user/
│   │   │       └── route.ts      # Analytics API (uses DB function)
│   │   ├── payments/
│   │   │   └── route.ts          # Payments API
│   │   ├── reviews/
│   │   │   └── route.ts          # Reviews API
│   │   ├── sessions/
│   │   │   ├── [id]/
│   │   │   │   └── end/
│   │   │   │       └── route.ts  # End session API
│   │   │   └── route.ts          # Sessions API
│   │   ├── stations/
│   │   │   └── route.ts          # Stations API
│   │   └── vehicles/
│   │       └── route.ts          # Vehicles API
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── register/
│   │       └── page.tsx          # Registration page
│   ├── payments/
│   │   └── page.tsx              # Payment history
│   ├── reviews/
│   │   └── page.tsx              # Reviews page
│   ├── sessions/
│   │   └── page.tsx              # Sessions page
│   ├── stations/
│   │   └── page.tsx              # Stations finder
│   ├── vehicles/
│   │   └── page.tsx              # Vehicle management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   └── Navigation.tsx            # Navigation component
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utility functions
├── types/
│   └── supabase.ts               # Database types
├── .env.local.example            # Environment variables template
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup

Your Supabase database should already have:
- All 9 tables created
- 2 database functions (calculateusertotalspending, getstationrevenue)
- 2 triggers (before_session_end, after_port_status_update)

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### 5. Build for Production

```bash
npm run build
npm start
```