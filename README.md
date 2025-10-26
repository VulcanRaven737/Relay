# Relay - EV Charging Network Platform

A comprehensive EV charging station management platform built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features Implemented

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

## 📊 Database Schema

### Tables
- `user_account` - User information
- `vehicle` - User vehicles
- `charging_station` - Charging station details
- `charging_port` - Individual charging ports
- `charging_session` - Charging sessions (with trigger-calculated fields)
- `payment` - Payment records
- `review` - Station reviews and ratings
- `maintenance_log` - Maintenance tracking
- `port_status_log` - Port status history (auto-populated by trigger)

### Database Functions
1. **calculateusertotalspending(user_id_input integer)** 
   - Returns total spending for a user
   - Used in Analytics Dashboard

2. **getstationrevenue(station_id_input integer, start_date timestamp, end_date timestamp)**
   - Returns revenue for a station in date range
   - Used in Admin Dashboard

### Database Triggers
1. **before_session_end** (on `charging_session`)
   - Automatically calculates session duration and cost when end_time is set
   - Ensures data consistency

2. **after_port_status_update** (on `charging_port`)
   - Automatically logs all port status changes to `port_status_log`
   - Maintains complete audit trail

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **UI Components:** Custom React components
- **Date Handling:** date-fns
- **Charts:** Recharts (for analytics)
- **Maps:** Leaflet & React-Leaflet (for station finder)

## 📁 Project Structure

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

## 🚦 Setup Instructions

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

## 🔑 Key API Endpoints

### User & Vehicles
- `GET /api/vehicles` - Get user vehicles
- `POST /api/vehicles` - Register new vehicle

### Stations
- `GET /api/stations` - Get all stations with filters
- `POST /api/stations` - Create new station (admin)

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Start new session
- `POST /api/sessions/[id]/end` - End session

### Payments
- `GET /api/payments` - Get payment history

### Reviews
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Submit review

### Analytics
- `GET /api/analytics/user` - Get user analytics (uses calculateusertotalspending)

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data (uses getstationrevenue)

## 🎯 Database Function Usage Examples

### User Total Spending
```typescript
const { data } = await supabase.rpc('calculateusertotalspending', {
  user_id_input: 1
})
// Returns: total amount spent by user
```

### Station Revenue
```typescript
const { data } = await supabase.rpc('getstationrevenue', {
  station_id_input: 1,
  start_date: '2025-01-01',
  end_date: '2025-01-31'
})
// Returns: total revenue for station in date range
```

## 🔄 Trigger Behavior

### Session End Trigger
When updating a session's `end_time`:
```typescript
await supabase
  .from('charging_session')
  .update({ end_time: new Date().toISOString() })
  .eq('session_id', sessionId)
// Trigger automatically calculates and sets: duration, energy_consumed, cost
```

### Port Status Trigger
When updating a port's status:
```typescript
await supabase
  .from('charging_port')
  .update({ status: 'In-Use' })
  .eq('port_id', portId)
// Trigger automatically logs the change to port_status_log table
```

## 📱 Features by Page

| Page | Features | Tables Used |
|------|----------|-------------|
| Home | Landing page, feature overview | None |
| Login/Register | Authentication | `user_account` |
| Stations | Find stations, filter, view details | `charging_station`, `charging_port`, `review` |
| Sessions | Start/end sessions, view history | `charging_session`, `charging_port`, `vehicle` |
| Vehicles | Register/manage vehicles | `vehicle` |
| Payments | View history, pay pending | `payment`, `charging_session` |
| Reviews | Submit/view reviews | `review`, `charging_station` |
| Analytics | User statistics, spending analysis | All + DB functions |
| Admin | Manage stations, maintenance, revenue | All tables + DB functions |

## 🔒 Security Notes

- All API routes currently use a hardcoded `userId = 1` for demonstration
- In production, implement proper authentication using Supabase Auth
- Add Row Level Security (RLS) policies in Supabase
- Validate user permissions for admin routes
- Sanitize user inputs

## 🚀 Next Steps

1. Implement Supabase Authentication
2. Add Row Level Security policies
3. Implement real-time subscriptions for live updates
4. Add image uploads for stations
5. Implement notifications system
6. Add payment gateway integration
7. Create mobile-responsive design improvements
8. Add data export functionality
9. Implement advanced filtering and search
10. Add multi-language support

## 📄 License

This project is for educational purposes.

## 👤 Author

Built with Next.js, TypeScript, and Supabase for EV Charging Station Management.
