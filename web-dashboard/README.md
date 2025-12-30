# CLSU NEXUS - Web Dashboard

Web dashboard for Admin and Counter Staff operations.

## Getting Started

### Install Dependencies

```bash
cd web-dashboard
npm install
```

### Configure API URL

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://192.168.100.9:3000/api
```

Or update directly in `src/lib/api.js` if needed.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Login Credentials

### Admin Account
- Email: `admin2@clsu.edu.ph`
- Password: `password123`

### Counter Staff Account
- Email: `stafftest@clsu.edu.ph`
- Password: `password123`

## Features

### Admin Dashboard
- View statistics (total queues, active queues, completed)
- Service statistics
- Average wait times

### Counter Dashboard
- Select assigned counter
- Call next queue
- View counter status

