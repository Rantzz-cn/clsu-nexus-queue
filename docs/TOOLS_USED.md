# Tools and Languages Used in Q-Tech Project

## Languages & Runtimes
- Node.js (engine: 18.x)
- JavaScript (backend, web, mobile)
- TypeScript (web-dashboard dev dependencies / types)
- React (web)
- React Native (mobile via Expo)
- SQL (PostgreSQL migration scripts)

## Backend
- Framework: express
- Realtime: socket.io (server)
- Database client: pg (PostgreSQL)
- Authentication: jsonwebtoken, bcrypt
- CORS handling: cors
- Environment config: dotenv

## Web Dashboard
- Framework: Next.js
- UI: React, react-dom, react-icons
- Client realtime: socket.io-client
- HTTP client: axios
- TypeScript support: typescript, @types/*

## Mobile
- Expo (Expo CLI / EAS)
- React Native
- Navigation: @react-navigation/*
- Async storage: @react-native-async-storage/async-storage
- Notifications: expo-notifications
- Client realtime: socket.io-client
- HTTP client: axios

## Testing & Development
- Testing: jest, supertest
- Dev server: nodemon
- Babel: @babel/core (mobile devDependency)

## Deployment & Infra
- Railway (railway.toml / railway.json)
- Vercel (vercel.json) for web-dashboard
- Procfile present for process declaration

## Scripts & Utilities
- Migration & seeds: scripts/run-migrations.js, database/migrations/
- Seed/demo scripts: scripts/seed-demo-data.js, setup-demo.js
- Socket server: backend/socket/socketServer.js

## Notable files to inspect
- Root: package.json
- Backend: backend/package.json, backend/config/database.js
- Mobile: mobile/package.json
- Web dashboard: web-dashboard/package.json
- Migrations: database/migrations/

---
Generated for quick reference. Update as dependencies change.