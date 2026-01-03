# Q-Tech - System Architecture Documentation

## Overview

This document describes the technical architecture of the Q-Tech Smart Queue Management System, including system design, component interactions, and technology choices.

## Architecture Principles

1. **Scalability**: Designed to handle growth in users and services
2. **Real-time Communication**: Low-latency updates for queue status
3. **Reliability**: High availability and fault tolerance
4. **Security**: Secure authentication and data protection
5. **Maintainability**: Clean code structure and documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├──────────────────────┬──────────────────────────────────────┤
│   Mobile App         │        Web Dashboard                  │
│   (React Native)     │        (React/Next.js)                │
│   - iOS              │        - Admin Dashboard              │
│   - Android          │        - Counter Dashboard            │
└──────────┬───────────┴──────────────┬───────────────────────┘
           │                          │
           │ HTTP/REST API            │
           │ WebSocket                │
           │                          │
┌──────────▼──────────────────────────▼───────────────────────┐
│                    API Gateway Layer                         │
│              (Load Balancer / Reverse Proxy)                 │
│                      - Nginx / Cloudflare                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                    Application Layer                         │
│                  (Backend API Server)                        │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Queue Service│  │Notification  │      │
│  │              │  │              │  │  Service     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Analytics    │  │ Real-time    │  │ File Storage │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  │              │  │ (WebSocket)  │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   PostgreSQL   │  │    Redis    │  │   File Storage │
│   (Primary DB) │  │   (Cache)   │  │   (S3/Cloud)   │
└────────────────┘  └─────────────┘  └────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├──────────────────────────────────────────────────────────────┤
│  - Firebase Cloud Messaging (Push Notifications)             │
│  - Email Service (SMTP / SendGrid)                           │
│  - Monitoring (CloudWatch / DataDog)                         │
└──────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Client Layer

#### Mobile Application (React Native)
```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Queue/
│   │   │   ├── ServiceListScreen.js
│   │   │   ├── QueueRequestScreen.js
│   │   │   ├── QueueStatusScreen.js
│   │   │   └── QueueHistoryScreen.js
│   │   └── Profile/
│   │       └── ProfileScreen.js
│   ├── components/
│   │   ├── QueueCard.js
│   │   ├── ServiceCard.js
│   │   └── NotificationBadge.js
│   ├── services/
│   │   ├── api.js
│   │   ├── websocket.js
│   │   └── notifications.js
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── store/ (Redux/Context)
│   │   ├── queueReducer.js
│   │   └── authReducer.js
│   └── utils/
│       └── helpers.js
└── config/
    └── api.js
```

#### Web Dashboard (React/Next.js)
```
web-dashboard/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.js
│   │   │   ├── Services.js
│   │   │   ├── Counters.js
│   │   │   └── Analytics.js
│   │   └── counter/
│   │       ├── CounterDashboard.js
│   │       └── QueueManagement.js
│   ├── components/
│   │   ├── QueueDisplay.js
│   │   ├── CounterCard.js
│   │   └── Charts/
│   ├── layouts/
│   │   └── DashboardLayout.js
│   └── services/
│       └── api.js
```

### 2. Backend API Server

#### Technology: Node.js with Express.js

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── queue.routes.js
│   │   ├── services.routes.js
│   │   ├── counters.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── queueController.js
│   │   ├── serviceController.js
│   │   └── counterController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── QueueEntry.js
│   │   ├── Service.js
│   │   └── Counter.js
│   ├── services/
│   │   ├── queueService.js
│   │   ├── notificationService.js
│   │   ├── analyticsService.js
│   │   └── websocketService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   └── config/
│       ├── database.js
│       ├── redis.js
│       └── constants.js
├── tests/
└── server.js
```

### 3. Database Layer

#### PostgreSQL (Primary Database)
- Stores all persistent data
- Relational data (users, queues, services, counters)
- ACID compliance for data integrity

#### Redis (Cache & Real-time)
- Queue state caching
- Session storage
- Real-time queue position updates
- Pub/Sub for WebSocket events

### 4. Real-time Communication

#### WebSocket Implementation (Socket.io)

**Client-Server Events:**

```javascript
// Client → Server
socket.emit('join_queue', { serviceId, userId })
socket.emit('leave_queue', { queueId })
socket.emit('counter_status', { counterId, status })

// Server → Client
socket.on('queue_update', { queuePosition, estimatedWaitTime })
socket.on('queue_called', { queueNumber, counterNumber })
socket.on('counter_status_change', { counterId, status })
```

**Room Structure:**
- `service:{serviceId}` - All users watching a service queue
- `counter:{counterId}` - Counter staff monitoring
- `user:{userId}` - Individual user notifications

## Data Flow

### Queue Request Flow

```
1. Student opens mobile app
2. Selects service (e.g., Registrar)
3. App sends POST /api/queue/request
   {
     userId: 123,
     serviceId: 1
   }
4. Backend validates request
5. Backend generates queue number
6. Backend calculates queue position
7. Backend saves to PostgreSQL
8. Backend updates Redis cache
9. Backend emits WebSocket event to service room
10. Backend sends push notification
11. Response sent to client
12. Client updates UI
```

### Queue Serving Flow

```
1. Counter staff logs in
2. Counter staff calls next number
3. POST /api/queue/call-next { counterId: 5 }
4. Backend finds next queue entry
5. Backend updates queue status to "called"
6. Backend updates counter current_serving_queue_id
7. Backend emits WebSocket event:
   - To user room (notify specific user)
   - To service room (update all watchers)
8. Backend sends push notification to user
9. User receives notification
10. Counter marks service as completed
11. POST /api/queue/complete { queueId: 456 }
12. Backend updates status to "completed"
13. Backend logs to queue_logs
14. Backend updates statistics
```

## API Design

### RESTful API Endpoints

#### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

#### Queue Management
```
POST   /api/queue/request
GET    /api/queue/:queueId
GET    /api/queue/status/:serviceId
DELETE /api/queue/:queueId/cancel
POST   /api/queue/:queueId/complete
GET    /api/queue/history
```

#### Services
```
GET    /api/services
GET    /api/services/:id
GET    /api/services/:id/queue-status
```

#### Counters
```
GET    /api/counters
GET    /api/counters/:id
POST   /api/counters/:id/call-next
POST   /api/counters/:id/status
```

#### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/analytics
GET    /api/admin/reports
POST   /api/admin/services
PUT    /api/admin/services/:id
```

### WebSocket Events

```javascript
// Client joins service room
socket.emit('join', { room: 'service:1' })

// Server broadcasts queue update
io.to('service:1').emit('queue_update', {
  currentServing: 'REG-042',
  waitingCount: 15,
  estimatedWait: 25
})

// Notify specific user
io.to('user:123').emit('queue_called', {
  queueNumber: 'REG-043',
  counterNumber: 2
})
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT token
4. Token includes: userId, role, expiresIn
5. Token sent to client
6. Client stores token (secure storage)
7. Client includes token in Authorization header
8. Backend middleware validates token
9. Backend extracts user info
10. Request proceeds
```

### Authorization
- Role-based access control (RBAC)
- Middleware checks user role
- Endpoints protected by role requirements

### Data Security
- Password hashing (bcrypt)
- JWT token expiration
- HTTPS for all communications
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Load balancer distribution
- Database connection pooling
- Redis for shared state

### Caching Strategy
- Redis for frequently accessed data
- Queue positions cached
- Service status cached
- Cache invalidation on updates

### Database Optimization
- Indexes on frequently queried columns
- Query optimization
- Connection pooling
- Read replicas (if needed)

## Deployment Architecture

### Production Setup

```
┌─────────────────────────────────────────┐
│         Cloud Provider (AWS/Azure)      │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Load Balancer│  │ Load Balancer│   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                 │            │
│  ┌──────▼───────┐  ┌──────▼───────┐   │
│  │  API Server  │  │  API Server  │   │
│  │   (Node.js)  │  │   (Node.js)  │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                 │            │
│  ┌──────▼─────────────────▼───────┐   │
│  │      PostgreSQL (Primary)      │   │
│  │      + Read Replica (Optional) │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Redis Cluster           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      File Storage (S3)          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Containerization (Docker)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### CI/CD Pipeline

```
1. Code push to GitHub
2. GitHub Actions triggered
3. Run tests
4. Build Docker image
5. Push to container registry
6. Deploy to staging
7. Run integration tests
8. Deploy to production
9. Health checks
```

## Monitoring & Logging

### Application Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic / DataDog)
- Uptime monitoring
- API response times

### Logging
- Structured logging (Winston)
- Log levels (error, warn, info, debug)
- Centralized logging
- Log rotation

### Health Checks
```
GET /api/health
Response: {
  status: "ok",
  database: "connected",
  redis: "connected",
  timestamp: "2024-01-01T00:00:00Z"
}
```

## Future Enhancements

1. **Microservices Architecture**: Split into separate services
2. **Message Queue**: Use RabbitMQ/Kafka for async processing
3. **CDN**: For static assets
4. **Multi-region**: Geographic distribution
5. **Auto-scaling**: Based on load
6. **Advanced Analytics**: ML-based predictions

---

This architecture provides a solid foundation for the Q-Tech system while allowing for future growth and enhancements.

